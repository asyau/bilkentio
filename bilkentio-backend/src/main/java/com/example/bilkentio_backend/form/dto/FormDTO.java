package com.example.bilkentio_backend.form.dto;

import java.time.LocalDate;
import lombok.Data;

@Data
public class FormDTO {
    private Integer groupSize;
    private String schoolName;
    private String contactPhone;
    private String expectations;
    private String specialRequirements;
    private String groupLeaderRole;
    private String groupLeaderPhone;
    private String groupLeaderEmail;
    private String visitorNotes;
    private String city;
    private Boolean agreeToTerms;
    private LocalDate date;
    private String time;
} 