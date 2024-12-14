package com.example.bilkentio_backend.assistant.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String language;

    @ElementCollection
    @CollectionTable(name = "conversation_messages")
    private List<Message> messages = new ArrayList<>();

    private LocalDateTime startTime;
    
    private LocalDateTime lastUpdateTime;

    @Embedded
    private UserContext userContext;

    @Data
    @Embeddable
    public static class Message {
        private String role; // user or assistant
        @Column(columnDefinition = "TEXT")
        private String content;
        private LocalDateTime timestamp;
    }

    @Data
    @Embeddable
    public static class UserContext {
        private String interests;
        private Integer groupSize;
        private String preferredTourType;
        private String specialRequirements;
    }
} 