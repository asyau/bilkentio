package com.example.bilkentio_backend.guide.controller;

import com.example.bilkentio_backend.guide.entity.Guide;
import com.example.bilkentio_backend.guide.service.GuideService;
import com.example.bilkentio_backend.guide.repository.GuideRepository;
import com.example.bilkentio_backend.tour.enums.TourStatus;
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
        Optional<Guide> guideOpt = guideRepository.findById(guideId);
        if (guideOpt.isPresent()) {
            Guide guide = guideOpt.get();
            Map<String, Object> stats = new HashMap<>();
            
            stats.put("averageRating", guide.getAverageRating());
            stats.put("totalIndividualTours", guide.getIndividualTours().size());
            stats.put("totalGroupTours", guide.getJoinedTours().size());
            stats.put("reviews", guide.getAllReviews());
            
            // Get current month and year stats
            String currentMonth = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM"));
            String currentYear = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy"));
            
            stats.put("currentMonthIndividualTours", guide.getIndividualTourCountForMonth(currentMonth));
            stats.put("currentMonthGroupTours", guide.getGroupTourCountForMonth(currentMonth));
            stats.put("currentYearIndividualTours", guide.getIndividualTourCountForYear(currentYear));
            stats.put("currentYearGroupTours", guide.getGroupTourCountForYear(currentYear));

            return ResponseEntity.ok(stats);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{guideId}/reviews")
    public ResponseEntity<?> getGuideReviews(@PathVariable Long guideId) {
        Optional<Guide> guideOpt = guideRepository.findById(guideId);
        if (guideOpt.isPresent()) {
            return ResponseEntity.ok(guideOpt.get().getAllReviews());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{guideId}/tours")
    public ResponseEntity<?> getGuideTours(@PathVariable Long guideId) {
        Optional<Guide> guideOpt = guideRepository.findById(guideId);
        if (guideOpt.isPresent()) {
            Guide guide = guideOpt.get();
            Map<String, Object> tours = new HashMap<>();
            
            // Get all tours
            tours.put("groupTours", guide.getJoinedTours());
            tours.put("individualTours", guide.getIndividualTours());
            
            // Get completed tours
            tours.put("completedGroupTours", guide.getJoinedTours().stream()
                .filter(tour -> tour.getStatus() == TourStatus.FINISHED || 
                              tour.getStatus() == TourStatus.GIVEN_FEEDBACK)
                .collect(Collectors.toList()));
                
            tours.put("completedIndividualTours", guide.getIndividualTours().stream()
                .filter(tour -> tour.getStatus() == TourStatus.FINISHED || 
                              tour.getStatus() == TourStatus.GIVEN_FEEDBACK)
                .collect(Collectors.toList()));
            
            // Get upcoming tours
            tours.put("upcomingGroupTours", guide.getJoinedTours().stream()
                .filter(tour -> tour.getStatus() == TourStatus.WAITING_TO_FINISH)
                .collect(Collectors.toList()));
                
            tours.put("upcomingIndividualTours", guide.getIndividualTours().stream()
                .filter(tour -> tour.getStatus() == TourStatus.WAITING_TO_FINISH)
                .collect(Collectors.toList()));

            return ResponseEntity.ok(tours);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{guideId}/tours/upcoming")
    public ResponseEntity<?> getGuideUpcomingTours(@PathVariable Long guideId) {
        Optional<Guide> guideOpt = guideRepository.findById(guideId);
        if (guideOpt.isPresent()) {
            Guide guide = guideOpt.get();
            Map<String, List<?>> upcomingTours = new HashMap<>();
            
            upcomingTours.put("groupTours", guide.getJoinedTours().stream()
                .filter(tour -> tour.getStatus() == TourStatus.WAITING_TO_FINISH)
                .collect(Collectors.toList()));
                
            upcomingTours.put("individualTours", guide.getIndividualTours().stream()
                .filter(tour -> tour.getStatus() == TourStatus.WAITING_TO_FINISH)
                .collect(Collectors.toList()));

            return ResponseEntity.ok(upcomingTours);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{guideId}/tours/completed")
    public ResponseEntity<?> getGuideCompletedTours(@PathVariable Long guideId) {
        Optional<Guide> guideOpt = guideRepository.findById(guideId);
        if (guideOpt.isPresent()) {
            Guide guide = guideOpt.get();
            Map<String, List<?>> completedTours = new HashMap<>();
            
            completedTours.put("groupTours", guide.getJoinedTours().stream()
                .filter(tour -> tour.getStatus() == TourStatus.FINISHED || 
                              tour.getStatus() == TourStatus.GIVEN_FEEDBACK)
                .collect(Collectors.toList()));
                
            completedTours.put("individualTours", guide.getIndividualTours().stream()
                .filter(tour -> tour.getStatus() == TourStatus.FINISHED || 
                              tour.getStatus() == TourStatus.GIVEN_FEEDBACK)
                .collect(Collectors.toList()));

            return ResponseEntity.ok(completedTours);
        }
        return ResponseEntity.notFound().build();
    }
} 