package com.example.bilkentio_backend.common.event;

import lombok.Getter;
import lombok.AllArgsConstructor;

@Getter
@AllArgsConstructor
public class EmailEvent {
    private final String to;
    private final String subject;
    private final String content;
} 