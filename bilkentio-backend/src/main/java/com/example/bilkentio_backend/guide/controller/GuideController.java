package com.example.bilkentio_backend.guide.controller;

import com.example.bilkentio_backend.guide.entity.Guide;
import com.example.bilkentio_backend.guide.service.GuideService;
import com.example.bilkentio_backend.guide.repository.GuideRepository;
import com.example.bilkentio_backend.tour.enums.TourStatus;
import com.example.bilkentio_backend.tour.dto.CompletedTourDTO;
import com.example.bilkentio_backend.tour.entity.Tour;
import com.example.bilkentio_backend.guide.dto.GuideProfileDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/guides")
public class GuideController {

    @Autowired
    private GuideService guideService;

    @Autowired
    private GuideRepository guideRepository;

    @GetMapping
    public List<Guide> getAllGuides() {
        return guideService.getAllGuides();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Guide> getGuideById(@PathVariable Long id) {
        return guideService.getGuideById(id)
                .map(guide -> ResponseEntity.ok().body(guide))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Guide createGuide(@RequestBody Guide guide) {
        return guideService.createGuide(guide);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Guide> updateGuide(@PathVariable Long id, @RequestBody Guide guideDetails) {
        return guideService.updateGuide(id, guideDetails)
                .map(updatedGuide -> ResponseEntity.ok(updatedGuide))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGuide(@PathVariable Long id) {
        return guideService.deleteGuide(id) 
                ? ResponseEntity.ok().build() 
                : ResponseEntity.notFound().build();
    }

    @GetMapping("/{guideId}/stats")
    public ResponseEntity<?> getGuideStats(@PathVariable Long guideId) {
        try {
            return ResponseEntity.ok(guideService.getGuideStats(guideId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{guideId}/reviews")
    public ResponseEntity<List<CompletedTourDTO>> getGuideReviews(@PathVariable Long guideId) {
        Optional<Guide> guideOpt = guideRepository.findById(guideId);
        if (guideOpt.isPresent()) {
            List<CompletedTourDTO> reviews = guideOpt.get().getAllReviews().stream()
                .map(CompletedTourDTO::fromEntity)
                .collect(Collectors.toList());
            return ResponseEntity.ok(reviews);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{guideId}/tours")
    public ResponseEntity<?> getGuideTours(@PathVariable Long guideId) {
        try {
            return ResponseEntity.ok(guideService.getGuideTours(guideId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{guideId}/tours/upcoming")
    public ResponseEntity<?> getGuideUpcomingTours(@PathVariable Long guideId) {
        try {
            return ResponseEntity.ok(guideService.getGuideUpcomingTours(guideId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{guideId}/tours/completed")
    public ResponseEntity<List<CompletedTourDTO>> getGuideCompletedTours(@PathVariable Long guideId) {
        try {
            List<Tour> completedTours = guideService.getGuideCompletedTours(guideId);
            List<CompletedTourDTO> dtos = completedTours.stream()
                .map(CompletedTourDTO::fromEntity)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{guideId}/profile")
    public ResponseEntity<GuideProfileDTO> getGuideProfile(@PathVariable Long guideId) {
        try {
            GuideProfileDTO profile = guideService.getGuideProfile(guideId);
            return ResponseEntity.ok(profile);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
} 