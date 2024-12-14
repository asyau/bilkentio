package com.example.bilkentio_backend.assistant.dto;

import lombok.Data;

@Data
public class ChatRequest {
    private String userId;
    private String message;
    private String language = "en";
} 