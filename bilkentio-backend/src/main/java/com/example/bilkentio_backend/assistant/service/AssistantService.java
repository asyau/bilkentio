package com.example.bilkentio_backend.assistant.service;
import com.example.bilkentio_backend.assistant.repository.ConversationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.messages.AssistantMessage;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Service
public class AssistantService {
    
    
    @Autowired
    private ChatClient chatClient;
    
    @Autowired
    private KnowledgeBaseService knowledgeBaseService;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    private static final String CACHE_KEY_PREFIX = "conversation:";
    private static final long CACHE_TTL_HOURS = 24;

    public String processMessage(String userId, String message, String language) {
        // Get cached messages
        String cacheKey = CACHE_KEY_PREFIX + userId;
        List<Message> cachedMessages = getCachedMessages(cacheKey);
        
        // Add new user message
        cachedMessages.add(new Message("user", message));
        
        // Get relevant context from ChromaDB
        String systemContext = knowledgeBaseService.getRelevantContext(message);
        
        // Create AI messages list
        List<org.springframework.ai.chat.messages.Message> aiMessages = new ArrayList<>();
        
        // Add system message with context from ChromaDB
        String systemPrompt = String.format(
            "You are a Bilkent University assistant. Base your response STRICTLY on this information:\n\n%s\n\n" +
            "Important instructions:\n" +
            "1. ONLY use the information provided above\n" +
            "2. If the information is not in the context, say 'I don't have specific information about that in my current context'\n" +
            "3. Do NOT refer to the website or suggest visiting it\n" +
            "4. Keep responses concise and factual\n" +
            "5. If you find relevant information, start with 'Based on the available information...'\n",
            systemContext
        );
        aiMessages.add(new SystemMessage(systemPrompt));
        
        // Add conversation history
        for (Message cachedMsg : cachedMessages) {
            if ("user".equals(cachedMsg.getRole())) {
                aiMessages.add(new UserMessage(cachedMsg.getContent()));
            } else {
                aiMessages.add(new AssistantMessage(cachedMsg.getContent()));
            }
        }
        
        Prompt prompt = new Prompt(aiMessages);
        String response = chatClient.call(prompt).getResult().getOutput().getContent();
        
        // Add AI response to cache
        cachedMessages.add(new Message("assistant", response));
        redisTemplate.opsForValue().set(cacheKey, cachedMessages, CACHE_TTL_HOURS, TimeUnit.HOURS);
        
        return response;
    }

    private List<Message> getCachedMessages(String key) {
        Object cached = redisTemplate.opsForValue().get(key);
        if (cached != null) {
            return (List<Message>) cached;
        }
        return new ArrayList<>();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    private static class Message {
        private String role;
        private String content;
    }
} 