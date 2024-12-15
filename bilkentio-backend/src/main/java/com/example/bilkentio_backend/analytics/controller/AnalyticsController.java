package com.example.bilkentio_backend.analytics.controller;

import com.example.bilkentio_backend.analytics.dto.AnalyticsDTO;
import com.example.bilkentio_backend.analytics.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/analytics")
@PreAuthorize("hasRole('ADMIN') or hasRole('COORDINATOR') or hasRole('COORDİNATOR')")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverviewAnalytics() {
        return ResponseEntity.ok(analyticsService.getOverviewAnalytics());
    }

    @GetMapping("/schools")
    public ResponseEntity<Map<String, Object>> getSchoolAnalytics() {
        return ResponseEntity.ok(analyticsService.getSchoolAnalytics());
    }

    @GetMapping("/cities")
    public ResponseEntity<Map<String, Object>> getCityAnalytics() {
        return ResponseEntity.ok(analyticsService.getCityAnalytics());
    }

    @GetMapping("/time")
    public ResponseEntity<Map<String, Object>> getTimeBasedAnalytics() {
        return ResponseEntity.ok(analyticsService.getTimeBasedAnalytics());
    }

    @GetMapping("/feedback")
    public ResponseEntity<Map<String, Object>> getFeedbackAnalytics() {
        return ResponseEntity.ok(analyticsService.getFeedbackAnalytics());
    }

    @GetMapping("/school/{schoolId}")
    public ResponseEntity<Map<String, Object>> getSchoolSpecificAnalytics(@PathVariable Long schoolId) {
        return ResponseEntity.ok(analyticsService.getSchoolSpecificAnalytics(schoolId));
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<Map<String, Object>> getCitySpecificAnalytics(@PathVariable String city) {
        return ResponseEntity.ok(analyticsService.getCitySpecificAnalytics(city));
    }

    @GetMapping("/guides")
    public ResponseEntity<Map<String, Object>> getGuideAnalytics() {
        return ResponseEntity.ok(analyticsService.getGuideAnalytics());
    }

    @GetMapping("/trends")
    public ResponseEntity<Map<String, Object>> getTrendAnalytics() {
        return ResponseEntity.ok(analyticsService.getTrendAnalytics());
    }

    @GetMapping("/comparison")
    public ResponseEntity<Map<String, Object>> getComparisonAnalytics(
            @RequestParam(required = false) String city1,
            @RequestParam(required = false) String city2) {
        return ResponseEntity.ok(analyticsService.getComparisonAnalytics(city1, city2));
    }

    @GetMapping("/date-range")
    public ResponseEntity<Map<String, Object>> getDateRangeAnalytics(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return ResponseEntity.ok(analyticsService.getDateRangeAnalytics(startDate, endDate));
    }

    @GetMapping("/peak-times")
    public ResponseEntity<Map<String, Object>> getPeakTimeAnalytics() {
        return ResponseEntity.ok(analyticsService.getPeakTimeAnalytics());
    }

    @GetMapping("/group-size")
    public ResponseEntity<Map<String, Object>> getGroupSizeAnalytics() {
        return ResponseEntity.ok(analyticsService.getGroupSizeAnalytics());
    }

    @GetMapping("/counselor-performance")
    public ResponseEntity<Map<String, Object>> getCounselorPerformanceAnalytics() {
        return ResponseEntity.ok(analyticsService.getCounselorPerformanceAnalytics());
    }

    @GetMapping
    public ResponseEntity<AnalyticsDTO> getAllAnalytics() {
        return ResponseEntity.ok(analyticsService.getAnalytics());
    }
} 