package com.example.bilkentio_backend.tour.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class IndividualTourRequest {
    @NotNull
    private LocalDate date;
    
    @NotNull
    private String time;
    
    private String interests;
    
    @NotNull
    private String contactNumber;
    
    @NotNull
    @Email
    private String email;
    
    private String specialRequirements;
    
    private String visitorNotes;
    
    @NotNull
    private String city;
} 