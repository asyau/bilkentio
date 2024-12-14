package com.example.bilkentio_backend.assistant.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class KnowledgeBaseService {
    
    private static final String CHROMA_SERVICE_URL = "http://localhost:5001/query";
    private final RestTemplate restTemplate;

    public KnowledgeBaseService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String getRelevantContext(String query) {
        StringBuilder context = new StringBuilder();
        
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("query", query);
            requestBody.put("n_results", 5);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                CHROMA_SERVICE_URL,
                HttpMethod.POST,
                entity,
                Map.class
            );

            if (response.getBody() != null && response.getBody().containsKey("results")) {
                List<Map<String, Object>> results = (List<Map<String, Object>>) response.getBody().get("results");
                
                log.info("Query: " + query);
                log.info("Found {} relevant documents:", results.size());
                
                for (Map<String, Object> result : results) {
                    String title = (String) result.get("title");
                    String source = (String) result.get("source");
                    String content = (String) result.get("full_content");
                    
                    log.info("Source: {} ({})", title, source);
                    log.info("Content preview: {}", content.substring(0, Math.min(content.length(), 200)));
                    log.info("-".repeat(80));
                    
                    context.append("Source: ").append(title)
                          .append(" (").append(source).append(")\n")
                          .append(content).append("\n\n");
                }
            }
        } catch (Exception e) {
            log.error("Error querying knowledge base: ", e);
            context.append("Error retrieving information from knowledge base.");
        }
        
        return context.toString();
    }

    // Add health check method
    public boolean isChromaServiceHealthy() {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                "http://localhost:5001/health",
                Map.class
            );
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            log.error("ChromaDB service health check failed: ", e);
            return false;
        }
    }
} 