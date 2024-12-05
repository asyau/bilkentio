package com.example.bilkentio_backend.authentication.request;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
} 