package com.example.bilkentio_backend.analytics.dto;

import lombok.Data;
import lombok.Builder;
import java.util.Map;
import java.util.List;

@Data
@Builder
public class AnalyticsDTO {
    // Overall statistics
    private int totalStudentsVisited;
    private int totalSchoolsVisited;
    private int totalToursGiven;
    private double averageGroupSize;
    private double averageTourRating;
    
    // School statistics
    private Map<String, Integer> schoolVisitCounts;  // school name -> visit count
    private Map<String, Integer> cityVisitCounts;    // city -> visit count
    private Map<String, List<String>> cityToSchools; // city -> list of schools
    
    // Time-based statistics
    private Map<String, Integer> monthlyVisits;      // month -> visit count
    private Map<String, Integer> dailyVisits;        // day of week -> visit count
    
    // Tour feedback statistics
    private Map<Integer, Integer> ratingDistribution; // rating -> count
    private int totalFeedbackCount;
    private int pendingFeedbackCount;
} 