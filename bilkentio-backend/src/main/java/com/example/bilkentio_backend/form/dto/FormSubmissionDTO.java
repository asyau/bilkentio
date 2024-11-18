package com.example.bilkentio_backend.form.dto;

import lombok.Data;

@Data
public class FormSubmissionDTO {
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
    private Long slotId;
} 