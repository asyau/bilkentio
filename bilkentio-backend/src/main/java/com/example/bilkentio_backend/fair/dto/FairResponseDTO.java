package com.example.bilkentio_backend.fair.dto;

import com.example.bilkentio_backend.fair.entity.Fair;
import lombok.Data;
import java.time.LocalDate;

@Data
public class FairResponseDTO {
    private Long id;
    private String schoolName;
    private String city;
    private LocalDate date;
    private String status;
    private Double schoolRank;
    private String contactPerson;
    private String contactEmail;
    private String contactPhone;
    private Integer expectedStudents;
    private String notes;
    private Long assignedGuideId;
    private LocalDate submissionDate;

    public static FairResponseDTO fromEntity(Fair fair) {
        FairResponseDTO dto = new FairResponseDTO();
        dto.setId(fair.getId());
        dto.setSchoolName(fair.getSchoolName());
        dto.setCity(fair.getCity());
        dto.setDate(fair.getDate());
        dto.setStatus(fair.getStatus());
        dto.setSchoolRank(fair.getSchoolRank());
        dto.setContactPerson(fair.getContactPerson());
        dto.setContactEmail(fair.getContactEmail());
        dto.setContactPhone(fair.getContactPhone());
        dto.setExpectedStudents(fair.getExpectedStudents());
        dto.setNotes(fair.getNotes());
        dto.setAssignedGuideId(fair.getAssignedGuideId());
        dto.setSubmissionDate(fair.getSubmissionDate());
        return dto;
    }
}