package com.example.bilkentio_backend.form.dto;

import java.time.LocalDate;
import lombok.Data;

@Data
public class FormDTO {
    private Integer groupSize;
    private Long schoolId;
    private String contactPhone;
    private String expectations;
    private String specialRequirements;
    private String groupLeaderRole;
    private String groupLeaderPhone;
    private String groupLeaderEmail;
    private String visitorNotes;
    private Boolean agreeToTerms;
    private LocalDate date;
    private String time;
    
    private String schoolName;
    private String city;
} 