package com.example.bilkentio_backend.tour.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class TourCancellationDTO {
    @NotBlank(message = "Cancellation reason is required")
    private String reason;
} 