package com.example.bilkentio_backend.tour.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

@Data
public class TourRequestDTO {
    @NotNull
    private Long formId;
    
    @NotNull
    @Min(1)
    private Integer requiredGuides;
    
    @NotNull
    private String submittedBy;
} 