package com.example.bilkentio_backend.tour.dto;

import lombok.Data;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Data
public class TourFeedbackDTO {
    @NotNull
    private String feedback;
    
    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;
} 