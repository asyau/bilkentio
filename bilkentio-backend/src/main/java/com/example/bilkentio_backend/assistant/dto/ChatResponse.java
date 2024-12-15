package com.example.bilkentio_backend.assistant.dto;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class ChatResponse {
    private String message;
    private String timestamp;
} 