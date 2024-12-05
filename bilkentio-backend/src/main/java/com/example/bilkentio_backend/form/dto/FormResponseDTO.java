package com.example.bilkentio_backend.form.dto;

import com.example.bilkentio_backend.form.entity.Form;
import com.example.bilkentio_backend.form.enums.FormState;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
public class FormResponseDTO {
    private Long id;
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
    private FormState state;
    private String slotDate;
    private String slotTime;
    private String submittedByUsername;
    private String submissionDate; // Changed to String to hold the formatted value

    public static FormResponseDTO fromEntity(Form form) {
        FormResponseDTO dto = new FormResponseDTO();
        dto.setId(form.getId());
        dto.setGroupSize(form.getGroupSize());
        dto.setSchoolName(form.getSchoolName());
        dto.setContactPhone(form.getContactPhone());
        dto.setExpectations(form.getExpectations());
        dto.setSpecialRequirements(form.getSpecialRequirements());
        dto.setGroupLeaderRole(form.getGroupLeaderRole());
        dto.setGroupLeaderPhone(form.getGroupLeaderPhone());
        dto.setGroupLeaderEmail(form.getGroupLeaderEmail());
        dto.setVisitorNotes(form.getVisitorNotes());
        dto.setCity(form.getCity());
        dto.setState(form.getState());

        // Format submissionDate
        if (form.getSubmissionDate() != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");
            dto.setSubmissionDate(form.getSubmissionDate().format(formatter));
        }

        if (form.getLinkedSlot() != null) {
            if (form.getLinkedSlot().getDay() != null) {
                dto.setSlotDate(form.getLinkedSlot().getDay().getDate().toString());
            }
            dto.setSlotTime(form.getLinkedSlot().getTime());
        }

        if (form.getSubmittedBy() != null) {
            dto.setSubmittedByUsername(form.getSubmittedBy().getUsername());
        }

        return dto;
    }
}
