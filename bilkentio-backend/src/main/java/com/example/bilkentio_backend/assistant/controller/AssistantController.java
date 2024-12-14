package com.example.bilkentio_backend.assistant.controller;

import com.example.bilkentio_backend.assistant.dto.ChatRequest;
import com.example.bilkentio_backend.assistant.dto.ChatResponse;
import com.example.bilkentio_backend.assistant.service.AssistantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/assistant")
public class AssistantController {

    @Autowired
    private AssistantService assistantService;

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        String response = assistantService.processMessage(
            request.getUserId(), 
            request.getMessage(), 
            request.getLanguage()
        );

        ChatResponse chatResponse = ChatResponse.builder()
            .message(response)
            .timestamp(LocalDateTime.now().toString())
            .build();

        return ResponseEntity.ok(chatResponse);
    }
} 