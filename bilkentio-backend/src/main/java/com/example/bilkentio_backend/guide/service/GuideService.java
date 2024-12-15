package com.example.bilkentio_backend.guide.service;

import com.example.bilkentio_backend.guide.entity.Guide;
import com.example.bilkentio_backend.guide.repository.GuideRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.bilkentio_backend.tour.enums.TourStatus;
import com.example.bilkentio_backend.tour.dto.TourResponse;
import com.example.bilkentio_backend.tour.entity.Tour;
import com.example.bilkentio_backend.tour.dto.IndividualTourResponse;
import com.example.bilkentio_backend.guide.dto.GuideProfileDTO;

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
        
        tours.put("groupTours", guide.getJoinedTours().stream()
            .map(TourResponse::fromTour)
            .collect(Collectors.toList()));
            
        tours.put("individualTours", guide.getIndividualTours().stream()
            .map(IndividualTourResponse::fromTour)
            .collect(Collectors.toList()));
        
        tours.put("completedGroupTours", guide.getJoinedTours().stream()
            .filter(tour -> tour.getStatus() == TourStatus.FINISHED || 
                          tour.getStatus() == TourStatus.GIVEN_FEEDBACK)
            .map(TourResponse::fromTour)
            .collect(Collectors.toList()));
            
        tours.put("completedIndividualTours", guide.getIndividualTours().stream()
            .filter(tour -> tour.getStatus() == TourStatus.FINISHED || 
                          tour.getStatus() == TourStatus.GIVEN_FEEDBACK)
            .map(IndividualTourResponse::fromTour)
            .collect(Collectors.toList()));
            
        tours.put("upcomingGroupTours", guide.getJoinedTours().stream()
            .filter(tour -> tour.getStatus() == TourStatus.WAITING_TO_FINISH)
            .map(TourResponse::fromTour)
            .collect(Collectors.toList()));
            
        tours.put("upcomingIndividualTours", guide.getIndividualTours().stream()
            .filter(tour -> tour.getStatus() == TourStatus.WAITING_TO_FINISH)
            .map(IndividualTourResponse::fromTour)
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

    public List<Tour> getGuideCompletedTours(Long guideId) {
        Guide guide = guideRepository.findById(guideId)
            .orElseThrow(() -> new IllegalArgumentException("Guide not found"));
 
        return guide.getJoinedTours().stream()
            .filter(tour -> tour.getStatus() == TourStatus.FINISHED || 
                           tour.getStatus() == TourStatus.GIVEN_FEEDBACK)
            .collect(Collectors.toList());
    }

    public GuideProfileDTO getGuideProfile(Long guideId) {
        Guide guide = guideRepository.findById(guideId)
                .orElseThrow(() -> new IllegalArgumentException("Guide not found"));
                
        GuideProfileDTO profileDTO = GuideProfileDTO.fromEntity(guide);
        
        // Get current month and year
        LocalDate now = LocalDate.now();
        int currentMonth = now.getMonthValue();
        int currentYear = now.getYear();
        
        // Calculate total hours from all completed tours
        Double totalHours = guide.getJoinedTours().stream()
                .filter(tour -> tour.getTotalHours() != null)
                .mapToDouble(Tour::getTotalHours)
                .sum();
                
        // Calculate hours for current month
        Double currentMonthHours = guide.getJoinedTours().stream()
                .filter(tour -> {
                    LocalDate tourDate = tour.getDate();
                    return tour.getTotalHours() != null &&
                           tourDate.getMonthValue() == currentMonth &&
                           tourDate.getYear() == currentYear;
                })
                .mapToDouble(Tour::getTotalHours)
                .sum();
        
        profileDTO.setTotalTourHours(totalHours);
        profileDTO.setCurrentMonthTourHours(currentMonthHours);
        
        return profileDTO;
    }
} 