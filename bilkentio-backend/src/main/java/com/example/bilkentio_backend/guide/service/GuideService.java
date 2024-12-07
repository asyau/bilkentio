package com.example.bilkentio_backend.guide.service;

import com.example.bilkentio_backend.guide.entity.Guide;
import com.example.bilkentio_backend.guide.repository.GuideRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.bilkentio_backend.tour.enums.TourStatus;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;


@Service
public class GuideService {

    @Autowired
    private GuideRepository guideRepository;

    public List<Guide> getAllGuides() {
        return guideRepository.findAll();
    }

    public Optional<Guide> getGuideById(Long id) {
        return guideRepository.findById(id);
    }

    public Guide createGuide(Guide guide) {
        return guideRepository.save(guide);
    }

    public Optional<Guide> updateGuide(Long id, Guide guideDetails) {
        return guideRepository.findById(id)
                .map(guide -> {
                    guide.setYearsOfExperience(guideDetails.getYearsOfExperience());
                    guide.setScore(guideDetails.getScore());
                    guide.setLevel(guideDetails.getLevel());
                    return guideRepository.save(guide);
                });
    }

    public boolean deleteGuide(Long id) {
        return guideRepository.findById(id)
                .map(guide -> {
                    guideRepository.delete(guide);
                    return true;
                }).orElse(false);
    }

    public void updateGuideScore(Long id, int increment) {
        guideRepository.findById(id).ifPresent(guide -> {
            guide.increaseScore(increment);
            guideRepository.save(guide);
        });
    }

    public void updateGuideLevel(Long id, String newLevel) {
        guideRepository.findById(id).ifPresent(guide -> {
            guide.setLevel(newLevel);
            guideRepository.save(guide);
        });
    }

    public Map<String, Object> getGuideStats(Long guideId) {
        Guide guide = guideRepository.findById(guideId)
            .orElseThrow(() -> new IllegalArgumentException("Guide not found"));
            
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("averageRating", guide.getAverageRating());
        stats.put("totalIndividualTours", guide.getIndividualTours().size());
        stats.put("totalGroupTours", guide.getJoinedTours().size());
        stats.put("reviews", guide.getAllReviews());
        
        String currentMonth = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM"));
        String currentYear = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy"));
        
        stats.put("currentMonthIndividualTours", guide.getIndividualTourCountForMonth(currentMonth));
        stats.put("currentMonthGroupTours", guide.getGroupTourCountForMonth(currentMonth));
        stats.put("currentYearIndividualTours", guide.getIndividualTourCountForYear(currentYear));
        stats.put("currentYearGroupTours", guide.getGroupTourCountForYear(currentYear));

        return stats;
    }

    public Map<String, Object> getGuideTours(Long guideId) {
        Guide guide = guideRepository.findById(guideId)
            .orElseThrow(() -> new IllegalArgumentException("Guide not found"));
            
        Map<String, Object> tours = new HashMap<>();
        
        tours.put("groupTours", guide.getJoinedTours());
        tours.put("individualTours", guide.getIndividualTours());
        
        tours.put("completedGroupTours", guide.getJoinedTours().stream()
            .filter(tour -> tour.getStatus() == TourStatus.FINISHED || 
                          tour.getStatus() == TourStatus.GIVEN_FEEDBACK)
            .collect(Collectors.toList()));
            
        tours.put("completedIndividualTours", guide.getIndividualTours().stream()
            .filter(tour -> tour.getStatus() == TourStatus.FINISHED || 
                          tour.getStatus() == TourStatus.GIVEN_FEEDBACK)
            .collect(Collectors.toList()));
        
        tours.put("upcomingGroupTours", guide.getJoinedTours().stream()
            .filter(tour -> tour.getStatus() == TourStatus.WAITING_TO_FINISH)
            .collect(Collectors.toList()));
            
        tours.put("upcomingIndividualTours", guide.getIndividualTours().stream()
            .filter(tour -> tour.getStatus() == TourStatus.WAITING_TO_FINISH)
            .collect(Collectors.toList()));

        return tours;
    }

    public Map<String, List<?>> getGuideUpcomingTours(Long guideId) {
        Guide guide = guideRepository.findById(guideId)
            .orElseThrow(() -> new IllegalArgumentException("Guide not found"));
            
        Map<String, List<?>> upcomingTours = new HashMap<>();
        
        upcomingTours.put("groupTours", guide.getJoinedTours().stream()
            .filter(tour -> tour.getStatus() == TourStatus.WAITING_TO_FINISH)
            .collect(Collectors.toList()));
            
        upcomingTours.put("individualTours", guide.getIndividualTours().stream()
            .filter(tour -> tour.getStatus() == TourStatus.WAITING_TO_FINISH)
            .collect(Collectors.toList()));

        return upcomingTours;
    }

    public Map<String, List<?>> getGuideCompletedTours(Long guideId) {
        Guide guide = guideRepository.findById(guideId)
            .orElseThrow(() -> new IllegalArgumentException("Guide not found"));
            
        Map<String, List<?>> completedTours = new HashMap<>();
        
        completedTours.put("groupTours", guide.getJoinedTours().stream()
            .filter(tour -> tour.getStatus() == TourStatus.FINISHED || 
                          tour.getStatus() == TourStatus.GIVEN_FEEDBACK)
            .collect(Collectors.toList()));
            
        completedTours.put("individualTours", guide.getIndividualTours().stream()
            .filter(tour -> tour.getStatus() == TourStatus.FINISHED || 
                          tour.getStatus() == TourStatus.GIVEN_FEEDBACK)
            .collect(Collectors.toList()));

        return completedTours;
    }
} 