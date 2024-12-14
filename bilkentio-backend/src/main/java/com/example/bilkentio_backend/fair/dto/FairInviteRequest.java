package com.example.bilkentio_backend.fair.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class FairInviteRequest {
    @NotBlank(message = "School name is required")
    private String schoolName;

    @NotBlank(message = "City is required")
    private String city;

    @NotNull(message = "Fair date is required")
    private LocalDate fairDate;

    @NotBlank(message = "Contact person is required")
    private String contactPerson;

    @NotBlank(message = "Contact email is required")
    private String contactEmail;

    @NotBlank(message = "Contact phone is required")
    private String contactPhone;

    private String notes;
    private Integer expectedStudents;
}