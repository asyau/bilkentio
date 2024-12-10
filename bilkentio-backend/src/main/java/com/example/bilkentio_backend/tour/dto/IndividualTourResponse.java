package com.example.bilkentio_backend.tour.dto;

import com.example.bilkentio_backend.tour.entity.IndividualTour;
import lombok.Data;

@Data
public class IndividualTourResponse {
    private Long id;
    private String date;
    private String time;
    private String interests;
    private String contactNumber;
    private String email;
    private String specialRequirements;
    private String visitorNotes;
    private String city;
    private String status;
    private String feedback;
    private Integer rating;

    public static IndividualTourResponse fromTour(IndividualTour tour) {
        IndividualTourResponse response = new IndividualTourResponse();
        response.setId(tour.getId());
        response.setDate(tour.getDate().toString());
        response.setTime(tour.getTime());
        response.setInterests(tour.getInterests());
        response.setContactNumber(tour.getContactNumber());
        response.setEmail(tour.getEmail());
        response.setSpecialRequirements(tour.getSpecialRequirements());
        response.setVisitorNotes(tour.getVisitorNotes());
        response.setCity(tour.getCity());
        response.setStatus(tour.getStatus().toString());
        response.setFeedback(tour.getFeedback());
        response.setRating(tour.getRating());
        return response;
    }
} 