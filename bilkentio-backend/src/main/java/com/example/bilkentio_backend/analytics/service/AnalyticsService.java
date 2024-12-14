package com.example.bilkentio_backend.analytics.service;

import com.example.bilkentio_backend.analytics.dto.AnalyticsDTO;
import com.example.bilkentio_backend.tour.repository.TourRepository;
import com.example.bilkentio_backend.tour.entity.Tour;
import com.example.bilkentio_backend.tour.enums.TourStatus;
import com.example.bilkentio_backend.school.entity.School;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;
import java.util.Locale;
import java.time.LocalDate;

@Service
public class AnalyticsService {
    
    @Autowired
    private TourRepository tourRepository;

    public Map<String, Object> getOverviewAnalytics() {
        List<Tour> completedTours = getCompletedTours();
        
        Map<String, Object> overview = new HashMap<>();
        overview.put("totalStudentsVisited", completedTours.stream().mapToInt(Tour::getGroupSize).sum());
        overview.put("totalSchoolsVisited", completedTours.stream().map(Tour::getSchool).distinct().count());
        overview.put("totalToursGiven", completedTours.size());
        overview.put("averageGroupSize", completedTours.stream().mapToInt(Tour::getGroupSize).average().orElse(0.0));
        overview.put("averageTourRating", completedTours.stream()
            .filter(t -> t.getRating() != null)
            .mapToInt(Tour::getRating)
            .average()
            .orElse(0.0));
        
        return overview;
    }

    public Map<String, Object> getSchoolAnalytics() {
        List<Tour> completedTours = getCompletedTours();
        
        Map<String, Object> schoolStats = new HashMap<>();
        Map<String, Integer> schoolVisits = new HashMap<>();
        Map<String, Double> schoolRatings = new HashMap<>();
        Map<String, Integer> schoolStudents = new HashMap<>();
        
        completedTours.forEach(tour -> {
            String schoolName = tour.getSchool().getName();
            schoolVisits.merge(schoolName, 1, Integer::sum);
            schoolStudents.merge(schoolName, tour.getGroupSize(), Integer::sum);
            if (tour.getRating() != null) {
                schoolRatings.merge(schoolName, (double) tour.getRating(), Double::sum);
            }
        });
        
        // Calculate average ratings
        schoolRatings.replaceAll((k, v) -> v / schoolVisits.get(k));
        
        schoolStats.put("schoolVisitCounts", schoolVisits);
        schoolStats.put("schoolAverageRatings", schoolRatings);
        schoolStats.put("schoolTotalStudents", schoolStudents);
        
        return schoolStats;
    }

    public Map<String, Object> getCityAnalytics() {
        List<Tour> completedTours = getCompletedTours();
        
        Map<String, Object> cityStats = new HashMap<>();
        Map<String, Integer> cityVisits = new HashMap<>();
        Map<String, List<String>> citySchools = new HashMap<>();
        Map<String, Integer> cityStudents = new HashMap<>();
        
        completedTours.forEach(tour -> {
            School school = tour.getSchool();
            String city = school.getCity();
            String schoolName = school.getName();
            
            cityVisits.merge(city, 1, Integer::sum);
            cityStudents.merge(city, tour.getGroupSize(), Integer::sum);
            
            citySchools.computeIfAbsent(city, k -> new ArrayList<>());
            if (!citySchools.get(city).contains(schoolName)) {
                citySchools.get(city).add(schoolName);
            }
        });
        
        cityStats.put("cityVisitCounts", cityVisits);
        cityStats.put("cityToSchools", citySchools);
        cityStats.put("cityTotalStudents", cityStudents);
        
        return cityStats;
    }

    public Map<String, Object> getTimeBasedAnalytics() {
        List<Tour> completedTours = getCompletedTours();
        
        Map<String, Object> timeStats = new HashMap<>();
        Map<String, Integer> monthlyVisits = new HashMap<>();
        Map<String, Integer> dailyVisits = new HashMap<>();
        Map<String, Integer> monthlyStudents = new HashMap<>();
        
        completedTours.forEach(tour -> {
            String month = tour.getDate().getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
            String dayOfWeek = tour.getDate().getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
            
            monthlyVisits.merge(month, 1, Integer::sum);
            dailyVisits.merge(dayOfWeek, 1, Integer::sum);
            monthlyStudents.merge(month, tour.getGroupSize(), Integer::sum);
        });
        
        timeStats.put("monthlyVisits", monthlyVisits);
        timeStats.put("dailyVisits", dailyVisits);
        timeStats.put("monthlyStudents", monthlyStudents);
        
        return timeStats;
    }

    public Map<String, Object> getFeedbackAnalytics() {
        List<Tour> completedTours = getCompletedTours();
        
        Map<String, Object> feedbackStats = new HashMap<>();
        Map<Integer, Integer> ratingDistribution = completedTours.stream()
            .filter(t -> t.getRating() != null)
            .collect(Collectors.groupingBy(
                Tour::getRating,
                Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
            ));
        
        int totalFeedback = (int) completedTours.stream()
            .filter(t -> t.getFeedback() != null)
            .count();
        
        int pendingFeedback = (int) completedTours.stream()
            .filter(t -> t.getStatus() == TourStatus.FINISHED && t.getFeedback() == null)
            .count();
        
        feedbackStats.put("ratingDistribution", ratingDistribution);
        feedbackStats.put("totalFeedbackCount", totalFeedback);
        feedbackStats.put("pendingFeedbackCount", pendingFeedback);
        feedbackStats.put("averageRating", completedTours.stream()
            .filter(t -> t.getRating() != null)
            .mapToInt(Tour::getRating)
            .average()
            .orElse(0.0));
        
        return feedbackStats;
    }

    public Map<String, Object> getSchoolSpecificAnalytics(Long schoolId) {
        List<Tour> schoolTours = tourRepository.findBySchool_Id(schoolId);
        List<Tour> completedTours = schoolTours.stream()
            .filter(tour -> tour.getStatus() == TourStatus.FINISHED || tour.getStatus() == TourStatus.GIVEN_FEEDBACK)
            .collect(Collectors.toList());
        
        Map<String, Object> schoolStats = new HashMap<>();
        schoolStats.put("totalVisits", completedTours.size());
        schoolStats.put("totalStudents", completedTours.stream().mapToInt(Tour::getGroupSize).sum());
        schoolStats.put("averageGroupSize", completedTours.stream().mapToInt(Tour::getGroupSize).average().orElse(0.0));
        schoolStats.put("averageRating", completedTours.stream()
            .filter(t -> t.getRating() != null)
            .mapToInt(Tour::getRating)
            .average()
            .orElse(0.0));
        
        // Monthly distribution
        Map<String, Integer> monthlyVisits = completedTours.stream()
            .collect(Collectors.groupingBy(
                tour -> tour.getDate().getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH),
                Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
            ));
        schoolStats.put("monthlyVisits", monthlyVisits);
        
        return schoolStats;
    }

    public Map<String, Object> getCitySpecificAnalytics(String city) {
        List<Tour> completedTours = getCompletedTours();
        List<Tour> cityTours = completedTours.stream()
            .filter(tour -> tour.getSchool().getCity().equalsIgnoreCase(city))
            .collect(Collectors.toList());
        
        Map<String, Object> cityStats = new HashMap<>();
        cityStats.put("totalVisits", cityTours.size());
        cityStats.put("totalStudents", cityTours.stream().mapToInt(Tour::getGroupSize).sum());
        cityStats.put("averageGroupSize", cityTours.stream().mapToInt(Tour::getGroupSize).average().orElse(0.0));
        
        // Schools in city
        Map<String, Integer> schoolVisits = cityTours.stream()
            .collect(Collectors.groupingBy(
                tour -> tour.getSchool().getName(),
                Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
            ));
        cityStats.put("schoolVisits", schoolVisits);
        
        return cityStats;
    }

    private List<Tour> getCompletedTours() {
        return tourRepository.findAll().stream()
            .filter(tour -> tour.getStatus() == TourStatus.FINISHED || tour.getStatus() == TourStatus.GIVEN_FEEDBACK)
            .collect(Collectors.toList());
    }

    // Original getAnalytics method remains for backward compatibility
    public AnalyticsDTO getAnalytics() {
        List<Tour> allTours = tourRepository.findAll();
        List<Tour> completedTours = allTours.stream()
            .filter(tour -> tour.getStatus() == TourStatus.FINISHED || tour.getStatus() == TourStatus.GIVEN_FEEDBACK)
            .collect(Collectors.toList());
            
        // Calculate overall statistics
        int totalStudents = completedTours.stream()
            .mapToInt(Tour::getGroupSize)
            .sum();
            
        Set<School> uniqueSchools = completedTours.stream()
            .map(Tour::getSchool)
            .collect(Collectors.toSet());
            
        double avgGroupSize = completedTours.stream()
            .mapToInt(Tour::getGroupSize)
            .average()
            .orElse(0.0);
            
        double avgRating = completedTours.stream()
            .filter(t -> t.getRating() != null)
            .mapToInt(Tour::getRating)
            .average()
            .orElse(0.0);
            
        // Calculate school statistics
        Map<String, Integer> schoolVisits = new HashMap<>();
        Map<String, Integer> cityVisits = new HashMap<>();
        Map<String, List<String>> citySchools = new HashMap<>();
        
        completedTours.forEach(tour -> {
            School school = tour.getSchool();
            String schoolName = school.getName();
            String city = school.getCity();
            
            // Update school visits
            schoolVisits.merge(schoolName, 1, Integer::sum);
            
            // Update city visits
            cityVisits.merge(city, 1, Integer::sum);
            
            // Update city to schools mapping
            citySchools.computeIfAbsent(city, k -> new ArrayList<>());
            if (!citySchools.get(city).contains(schoolName)) {
                citySchools.get(city).add(schoolName);
            }
        });
        
        // Calculate time-based statistics
        Map<String, Integer> monthlyStats = new HashMap<>();
        Map<String, Integer> dailyStats = new HashMap<>();
        
        completedTours.forEach(tour -> {
            String month = tour.getDate().getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
            String dayOfWeek = tour.getDate().getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
            
            monthlyStats.merge(month, 1, Integer::sum);
            dailyStats.merge(dayOfWeek, 1, Integer::sum);
        });
        
        // Calculate rating distribution
        Map<Integer, Integer> ratingDist = completedTours.stream()
            .filter(t -> t.getRating() != null)
            .collect(Collectors.groupingBy(
                Tour::getRating,
                Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
            ));
            
        int totalFeedback = (int) completedTours.stream()
            .filter(t -> t.getFeedback() != null)
            .count();
            
        int pendingFeedback = (int) completedTours.stream()
            .filter(t -> t.getStatus() == TourStatus.FINISHED && t.getFeedback() == null)
            .count();
        
        // Build and return the DTO
        return AnalyticsDTO.builder()
            .totalStudentsVisited(totalStudents)
            .totalSchoolsVisited(uniqueSchools.size())
            .totalToursGiven(completedTours.size())
            .averageGroupSize(avgGroupSize)
            .averageTourRating(avgRating)
            .schoolVisitCounts(schoolVisits)
            .cityVisitCounts(cityVisits)
            .cityToSchools(citySchools)
            .monthlyVisits(monthlyStats)
            .dailyVisits(dailyStats)
            .ratingDistribution(ratingDist)
            .totalFeedbackCount(totalFeedback)
            .pendingFeedbackCount(pendingFeedback)
            .build();
    }

    public Map<String, Object> getGuideAnalytics() {
        List<Tour> completedTours = getCompletedTours();
        
        Map<String, Object> guideStats = new HashMap<>();
        
        // Guide participation stats
        Map<String, Integer> guideTourCounts = new HashMap<>();
        Map<String, Double> guideRatings = new HashMap<>();
        Map<String, Integer> guideStudentCounts = new HashMap<>();
        
        completedTours.forEach(tour -> {
            tour.getAssignedGuides().forEach(guide -> {
                String guideName = guide.getNameSurname();
                guideTourCounts.merge(guideName, 1, Integer::sum);
                guideStudentCounts.merge(guideName, tour.getGroupSize(), Integer::sum);
                if (tour.getRating() != null) {
                    guideRatings.merge(guideName, (double) tour.getRating(), Double::sum);
                }
            });
        });
        
        // Calculate average ratings
        guideRatings.replaceAll((k, v) -> v / guideTourCounts.get(k));
        
        guideStats.put("guideTourCounts", guideTourCounts);
        guideStats.put("guideAverageRatings", guideRatings);
        guideStats.put("guideStudentCounts", guideStudentCounts);
        
        return guideStats;
    }

    public Map<String, Object> getTrendAnalytics() {
        List<Tour> completedTours = getCompletedTours();
        
        Map<String, Object> trends = new HashMap<>();
        
        // Monthly trends
        Map<String, List<Integer>> monthlyTrends = completedTours.stream()
            .collect(Collectors.groupingBy(
                tour -> tour.getDate().getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH),
                Collectors.mapping(Tour::getGroupSize, Collectors.toList())
            ));
            
        // Calculate growth rates
        Map<String, Double> monthlyGrowth = new HashMap<>();
        monthlyTrends.forEach((month, sizes) -> {
            double avgSize = sizes.stream().mapToInt(Integer::intValue).average().orElse(0.0);
            monthlyGrowth.put(month, avgSize);
        });
        
        trends.put("monthlyGrowth", monthlyGrowth);
        trends.put("popularTimes", getPopularTimeSlots(completedTours));
        
        return trends;
    }

    public Map<String, Object> getComparisonAnalytics(String city1, String city2) {
        List<Tour> completedTours = getCompletedTours();
        
        Map<String, Object> comparison = new HashMap<>();
        
        // Filter tours by cities
        List<Tour> city1Tours = completedTours.stream()
            .filter(tour -> tour.getSchool().getCity().equalsIgnoreCase(city1))
            .collect(Collectors.toList());
            
        List<Tour> city2Tours = completedTours.stream()
            .filter(tour -> tour.getSchool().getCity().equalsIgnoreCase(city2))
            .collect(Collectors.toList());
            
        comparison.put("city1Stats", calculateCityStats(city1Tours));
        comparison.put("city2Stats", calculateCityStats(city2Tours));
        
        return comparison;
    }

    public Map<String, Object> getDateRangeAnalytics(LocalDate startDate, LocalDate endDate) {
        List<Tour> completedTours = getCompletedTours().stream()
            .filter(tour -> !tour.getDate().isBefore(startDate) && !tour.getDate().isAfter(endDate))
            .collect(Collectors.toList());
            
        Map<String, Object> rangeStats = new HashMap<>();
        rangeStats.put("totalTours", completedTours.size());
        rangeStats.put("totalStudents", completedTours.stream().mapToInt(Tour::getGroupSize).sum());
        rangeStats.put("averageRating", completedTours.stream()
            .filter(t -> t.getRating() != null)
            .mapToInt(Tour::getRating)
            .average()
            .orElse(0.0));
            
        // Daily distribution
        Map<String, Integer> dailyDistribution = completedTours.stream()
            .collect(Collectors.groupingBy(
                tour -> tour.getDate().toString(),
                Collectors.summingInt(Tour::getGroupSize)
            ));
            
        rangeStats.put("dailyDistribution", dailyDistribution);
        
        return rangeStats;
    }

    public Map<String, Object> getPeakTimeAnalytics() {
        List<Tour> completedTours = getCompletedTours();
        
        Map<String, Object> peakStats = new HashMap<>();
        
        // Hour-based analysis
        Map<String, Integer> hourlyDistribution = new HashMap<>();
        Map<String, Double> hourlyRatings = new HashMap<>();
        
        completedTours.forEach(tour -> {
            String time = tour.getTime();
            hourlyDistribution.merge(time, 1, Integer::sum);
            if (tour.getRating() != null) {
                hourlyRatings.merge(time, (double) tour.getRating(), Double::sum);
            }
        });
        
        // Calculate average ratings per hour
        hourlyRatings.replaceAll((k, v) -> v / hourlyDistribution.get(k));
        
        peakStats.put("hourlyDistribution", hourlyDistribution);
        peakStats.put("hourlyRatings", hourlyRatings);
        peakStats.put("busyDays", getBusiestDays(completedTours));
        
        return peakStats;
    }

    public Map<String, Object> getGroupSizeAnalytics() {
        List<Tour> completedTours = getCompletedTours();
        
        Map<String, Object> sizeStats = new HashMap<>();
        
        // Group size distribution
        Map<String, Integer> sizeDistribution = new HashMap<>();
        completedTours.forEach(tour -> {
            String sizeRange = getGroupSizeRange(tour.getGroupSize());
            sizeDistribution.merge(sizeRange, 1, Integer::sum);
        });
        
        // Average ratings by group size
        Map<String, Double> sizeRatings = new HashMap<>();
        completedTours.stream()
            .filter(t -> t.getRating() != null)
            .forEach(tour -> {
                String sizeRange = getGroupSizeRange(tour.getGroupSize());
                sizeRatings.merge(sizeRange, (double) tour.getRating(), Double::sum);
            });
            
        sizeRatings.replaceAll((k, v) -> v / sizeDistribution.get(k));
        
        sizeStats.put("sizeDistribution", sizeDistribution);
        sizeStats.put("sizeRatings", sizeRatings);
        
        return sizeStats;
    }

    public Map<String, Object> getCounselorPerformanceAnalytics() {
        List<Tour> completedTours = getCompletedTours();
        
        Map<String, Object> counselorStats = new HashMap<>();
        
        // Counselor tour counts
        Map<String, Integer> counselorTourCounts = new HashMap<>();
        Map<String, Integer> counselorStudentCounts = new HashMap<>();
        Map<String, Double> counselorRatings = new HashMap<>();
        
        completedTours.forEach(tour -> {
            String counselorName = tour.getCounselor().getNameSurname();
            counselorTourCounts.merge(counselorName, 1, Integer::sum);
            counselorStudentCounts.merge(counselorName, tour.getGroupSize(), Integer::sum);
            if (tour.getRating() != null) {
                counselorRatings.merge(counselorName, (double) tour.getRating(), Double::sum);
            }
        });
        
        // Calculate average ratings
        counselorRatings.replaceAll((k, v) -> v / counselorTourCounts.get(k));
        
        counselorStats.put("counselorTourCounts", counselorTourCounts);
        counselorStats.put("counselorStudentCounts", counselorStudentCounts);
        counselorStats.put("counselorAverageRatings", counselorRatings);
        
        return counselorStats;
    }

    // Helper methods
    private Map<String, Object> calculateCityStats(List<Tour> tours) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTours", tours.size());
        stats.put("totalStudents", tours.stream().mapToInt(Tour::getGroupSize).sum());
        stats.put("averageRating", tours.stream()
            .filter(t -> t.getRating() != null)
            .mapToInt(Tour::getRating)
            .average()
            .orElse(0.0));
        stats.put("uniqueSchools", tours.stream()
            .map(tour -> tour.getSchool().getName())
            .distinct()
            .count());
        return stats;
    }

    private Map<String, Integer> getPopularTimeSlots(List<Tour> tours) {
        return tours.stream()
            .collect(Collectors.groupingBy(
                Tour::getTime,
                Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
            ));
    }

    private Map<String, Integer> getBusiestDays(List<Tour> tours) {
        return tours.stream()
            .collect(Collectors.groupingBy(
                tour -> tour.getDate().getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH),
                Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
            ));
    }

    private String getGroupSizeRange(int size) {
        if (size <= 10) return "1-10";
        if (size <= 20) return "11-20";
        if (size <= 30) return "21-30";
        if (size <= 40) return "31-40";
        return "40+";
    }
} 