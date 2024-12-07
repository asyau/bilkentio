package com.example.bilkentio_backend.tour.controller;

import com.example.bilkentio_backend.tour.entity.IndividualTour;
import com.example.bilkentio_backend.tour.service.IndividualTourService;
import com.example.bilkentio_backend.tour.dto.IndividualTourRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/individual-tours")
public class IndividualTourController {

    @Autowired
    private IndividualTourService individualTourService;

    @GetMapping
    public ResponseEntity<List<IndividualTour>> getAllTours() {
        return ResponseEntity.ok(individualTourService.getAllIndividualTours());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<IndividualTour>> getPendingTours() {
        return ResponseEntity.ok(individualTourService.getPendingTours());
    }

    @PostMapping
    public ResponseEntity<IndividualTour> createTour(@Valid @RequestBody IndividualTourRequest tourRequest) {
        return ResponseEntity.ok(individualTourService.createIndividualTour(tourRequest));
    }

    @PostMapping("/{tourId}/join/{guideId}")
    public ResponseEntity<IndividualTour> joinTour(
            @PathVariable Long tourId,
            @PathVariable Long guideId) {
        return ResponseEntity.ok(individualTourService.joinTour(tourId, guideId));
    }

    @PostMapping("/{tourId}/complete")
    public ResponseEntity<IndividualTour> completeTour(@PathVariable Long tourId) {
        return ResponseEntity.ok(individualTourService.completeTour(tourId));
    }

    @PostMapping("/{tourId}/cancel")
    public ResponseEntity<IndividualTour> cancelTour(
            @PathVariable Long tourId,
            @RequestBody(required = false) String reason) {
        return ResponseEntity.ok(individualTourService.cancelTour(tourId, reason));
    }

    @PostMapping("/{tourId}/feedback")
    public ResponseEntity<IndividualTour> provideFeedback(
            @PathVariable Long tourId,
            @RequestParam String feedback,
            @RequestParam Integer rating) {
        return ResponseEntity.ok(individualTourService.provideFeedback(tourId, feedback, rating));
    }

    @GetMapping("/my-tours")
    public ResponseEntity<List<IndividualTour>> getMyTours() {
        return ResponseEntity.ok(individualTourService.getToursForCurrentUser());
    }

    @GetMapping("/available")
    public ResponseEntity<List<IndividualTour>> getAvailableIndividualTours() {
        return ResponseEntity.ok(individualTourService.getPendingTours());
    }

    @GetMapping("/guide/{guideId}")
    public ResponseEntity<List<IndividualTour>> getGuideIndividualTours(@PathVariable Long guideId) {
        return ResponseEntity.ok(individualTourService.getToursForGuide(guideId));
    }
} 