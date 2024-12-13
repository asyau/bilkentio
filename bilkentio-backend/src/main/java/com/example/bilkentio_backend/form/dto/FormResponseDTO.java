package com.example.bilkentio_backend.form.dto;

import com.example.bilkentio_backend.form.entity.Form;
import com.example.bilkentio_backend.form.enums.FormState;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FormResponseDTO {
    private String errorMessage;

    public static FormResponseDTO fromEntity(Form form) {
        return new FormResponseDTO(null);  // No error for successful cases
    }
}
