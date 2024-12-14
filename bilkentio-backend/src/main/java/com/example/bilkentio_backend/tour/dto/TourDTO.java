package com.example.bilkentio_backend.tour.dto;

import com.example.bilkentio_backend.tour.entity.Tour;
import com.example.bilkentio_backend.tour.enums.TourStatus;
import com.example.bilkentio_backend.guide.entity.Guide;
import lombok.Data;

import java.time.LocalDate;
import java.util.Set;
import java.util.stream.Collectors;

@Data
public class TourDTO {
    private Long id;
    private Long formId;
    private Long counselorId;
    private String counselorName;
    private LocalDate date;
    private String time;
    private Integer groupSize;
    private Integer requiredGuides;
    private String schoolName;
    private String expectations;
    private String specialRequirements;
    private String visitorNotes;
    private String city;
    private Set<GuideDTO> assignedGuides;
    private TourStatus status;
    private String feedback;
    private Integer rating;
    private String cancellationReason;
    private String groupLeaderRole;
    private String groupLeaderPhone;
    private String groupLeaderEmail;

    public static TourDTO fromEntity(Tour tour) {
        TourDTO dto = new TourDTO();
        dto.setId(tour.getId());
        dto.setFormId(tour.getForm() != null ? tour.getForm().getId() : null);
        dto.setCounselorId(tour.getCounselor() != null ? tour.getCounselor().getId() : null);
        dto.setCounselorName(tour.getCounselor() != null ? tour.getCounselor().getNameSurname() : null);
        dto.setDate(tour.getDate());
        dto.setTime(tour.getTime());
        dto.setGroupSize(tour.getGroupSize());
        dto.setRequiredGuides(tour.getRequiredGuides());
        dto.setSchoolName(tour.getSchoolName());
        dto.setExpectations(tour.getExpectations());
        dto.setSpecialRequirements(tour.getSpecialRequirements());
        dto.setVisitorNotes(tour.getVisitorNotes());
        dto.setCity(tour.getCity());
        dto.setStatus(tour.getStatus());
        dto.setFeedback(tour.getFeedback());
        dto.setRating(tour.getRating());
        dto.setCancellationReason(tour.getCancellationReason());
        dto.setGroupLeaderRole(tour.getGroupLeaderRole());
        dto.setGroupLeaderPhone(tour.getGroupLeaderPhone());
        dto.setGroupLeaderEmail(tour.getGroupLeaderEmail());

        if (tour.getAssignedGuides() != null) {
            dto.setAssignedGuides(tour.getAssignedGuides().stream()
                .map(GuideDTO::fromEntity)
                .collect(Collectors.toSet()));
        }

        return dto;
    }

    @Data
    public static class GuideDTO {
        private Long id;
        private String nameSurname;
        private String username;

        public static GuideDTO fromEntity(Guide guide) {
            GuideDTO dto = new GuideDTO();
            dto.setId(guide.getId());
            dto.setNameSurname(guide.getNameSurname());
            dto.setUsername(guide.getUsername());
            return dto;
        }
    }
} 