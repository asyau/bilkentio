package com.example.bilkentio_backend.tour.dto;

import com.example.bilkentio_backend.tour.entity.Tour;
import com.example.bilkentio_backend.tour.enums.TourStatus;
import com.example.bilkentio_backend.guide.entity.Guide;
import lombok.Data;

@Data
public class CompletedTourDTO {
    private Long id;
    private Long schoolId;
    private String schoolName;
    private String city;
    private String date;
    private String time;
    private Integer groupSize;
    private String feedback;
    private Integer rating;
    private TourStatus status;
    private boolean isIndividual;

    public static CompletedTourDTO fromEntity(Tour tour) {
        CompletedTourDTO dto = new CompletedTourDTO();
        dto.setId(tour.getId());
        dto.setSchoolId(tour.getSchool().getId());
        dto.setSchoolName(tour.getSchool().getName());
        dto.setCity(tour.getSchool().getCity());
        dto.setDate(tour.getDate().toString());
        dto.setTime(tour.getTime());
        dto.setGroupSize(tour.getGroupSize());
        dto.setFeedback(tour.getFeedback());
        dto.setRating(tour.getRating());
        dto.setStatus(tour.getStatus());
        dto.setIndividual(false);
        return dto;
    }

    public static CompletedTourDTO fromEntity(Guide.TourReview review) {
        CompletedTourDTO dto = new CompletedTourDTO();
        dto.setSchoolName(review.getTourName());
        dto.setDate(review.getDate().toString());
        dto.setFeedback(review.getFeedback());
        dto.setRating(review.getRating());
        dto.setStatus(TourStatus.GIVEN_FEEDBACK);
        dto.setIndividual(review.getTourName().equals("Individual Tour"));
        return dto;
    }
} 