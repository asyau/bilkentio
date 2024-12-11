package com.example.bilkentio_backend.tour.controller;

import com.example.bilkentio_backend.tour.dto.TourDTO;
import com.example.bilkentio_backend.tour.dto.TourRequestDTO;
import com.example.bilkentio_backend.tour.dto.TourFeedbackDTO;
import com.example.bilkentio_backend.tour.dto.TourCancellationDTO;
import com.example.bilkentio_backend.tour.entity.Tour;
import com.example.bilkentio_backend.tour.enums.TourStatus;
import com.example.bilkentio_backend.tour.service.TourService;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tours")
public class TourController {

    private static final Logger logger = LoggerFactory.getLogger(TourController.class);

    @Autowired
    private TourService tourService;

    @GetMapping
    public ResponseEntity<List<TourDTO>> getTours(
            @RequestParam(required = false) TourStatus status) {

        if (status != null) {
            return ResponseEntity.ok(
                tourService.getToursByStatus(status).stream()
                    .map(TourDTO::fromEntity)
                    .collect(Collectors.toList())
            );
        }

        return ResponseEntity.ok(
            tourService.getToursByStatus(TourStatus.GUIDES_PENDING).stream()
                .map(TourDTO::fromEntity)
                .collect(Collectors.toList())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<TourDTO> getTourById(@PathVariable Long id) {
        return tourService.getTourById(id)
                .map(tour -> ResponseEntity.ok(TourDTO.fromEntity(tour)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{tourId}/guides/{guideId}")
    public ResponseEntity<TourDTO> assignGuide(
            @PathVariable Long tourId,
            @PathVariable Long guideId) {
        return ResponseEntity.ok(TourDTO.fromEntity(
            tourService.assignGuide(tourId, guideId)
        ));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TourDTO> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {
        TourStatus newStatus = TourStatus.valueOf(statusUpdate.get("status"));
        return ResponseEntity.ok(TourDTO.fromEntity(
            tourService.updateTourStatus(id, newStatus)
        ));
    }

    @PostMapping("/{id}/feedback")
    public ResponseEntity<TourDTO> addFeedback(
            @PathVariable Long id,
            @RequestBody TourFeedbackDTO feedbackDTO) {
        try {
            return ResponseEntity.ok(TourDTO.fromEntity(
                tourService.addFeedback(id, feedbackDTO.getFeedback(), feedbackDTO.getRating())
            ));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/guide/{guideId}")
    public ResponseEntity<List<TourDTO>> getToursByGuide(@PathVariable Long guideId) {
        return ResponseEntity.ok(
            tourService.getToursByGuide(guideId).stream()
                .map(TourDTO::fromEntity)
                .collect(Collectors.toList())
        );
    }

    @GetMapping("/counselor/{counselorId}")
    public ResponseEntity<List<TourDTO>> getToursByCounselor(@PathVariable Long counselorId) {
        return ResponseEntity.ok(
            tourService.getToursByCounselor(counselorId).stream()
                .map(TourDTO::fromEntity)
                .collect(Collectors.toList())
        );
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<TourDTO> cancelTour(
            @PathVariable Long id,
            @RequestBody TourCancellationDTO cancellationDTO) {
        try {
            Tour cancelledTour = tourService.cancelTour(id, cancellationDTO.getReason());
            return ResponseEntity.ok(TourDTO.fromEntity(cancelledTour));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createTour(@RequestBody TourRequestDTO requestDTO) {
        logger.debug("Attempting to create tour with data: {}", requestDTO);
        try {
            Tour tour = tourService.createTourFromForm(
                requestDTO.getFormId(), 
                requestDTO.getRequiredGuides()
            );
            logger.debug("Tour created successfully: {}", tour);
            return ResponseEntity.ok(TourDTO.fromEntity(tour));
        } catch (EntityNotFoundException e) {
            logger.error("Entity not found: {}", e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (IllegalStateException e) {
            logger.error("Invalid state: {}", e.getMessage());
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("An unexpected error occurred: " + e.getMessage());
        }
    }
} 