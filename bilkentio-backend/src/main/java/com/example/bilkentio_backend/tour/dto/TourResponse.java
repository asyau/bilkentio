package com.example.bilkentio_backend.tour.dto;

import com.example.bilkentio_backend.tour.entity.Tour;
import lombok.Data;

@Data
public class TourResponse {
    private Long id;
    private String date;
    private String time;
    private String schoolName;
    private Integer groupSize;
    private String expectations;
    private String specialRequirements;
    private String city;
    private String status;
    private String feedback;
    private Integer rating;

    public static TourResponse fromTour(Tour tour) {
        TourResponse response = new TourResponse();
        response.setId(tour.getId());
        response.setDate(tour.getDate().toString());
        response.setTime(tour.getTime());
        response.setSchoolName(tour.getSchoolName());
        response.setGroupSize(tour.getGroupSize());
        response.setExpectations(tour.getExpectations());
        response.setSpecialRequirements(tour.getSpecialRequirements());
        response.setCity(tour.getCity());
        response.setStatus(tour.getStatus().toString());
        response.setFeedback(tour.getFeedback());
        response.setRating(tour.getRating());
        return response;
    }
} 