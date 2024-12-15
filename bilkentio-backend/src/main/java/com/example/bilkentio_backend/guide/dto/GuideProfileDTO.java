package com.example.bilkentio_backend.guide.dto;

import com.example.bilkentio_backend.guide.entity.Guide;
import lombok.Data;

@Data
public class GuideProfileDTO {
    private Long id;
    private String name;
    private String email;
    private int yearsOfExperience;
    private int score;
    private String level;
    private double averageRating;
    private int totalCompletedTours;
    private int currentMonthTours;
    private int currentYearTours;
    private Double totalTourHours;
    private Double currentMonthTourHours;

    public static GuideProfileDTO fromEntity(Guide guide) {
        GuideProfileDTO dto = new GuideProfileDTO();
        dto.setId(guide.getId());
        dto.setName(guide.getNameSurname());
        dto.setEmail(guide.getEmail());
        dto.setYearsOfExperience(guide.getYearsOfExperience());
        dto.setScore(guide.getScore());
        dto.setLevel(guide.getLevel());
        dto.setAverageRating(guide.getAverageRating());
        
        String currentMonth = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy/MM"));
        String currentYear = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy"));
        
        dto.setCurrentMonthTours(
            guide.getGroupTourCountForMonth(currentMonth) + 
            guide.getIndividualTourCountForMonth(currentMonth)
        );
        
        dto.setCurrentYearTours(
            guide.getGroupTourCountForYear(currentYear) + 
            guide.getIndividualTourCountForYear(currentYear)
        );
        
        dto.setTotalCompletedTours(
            (int) (guide.getJoinedTours().size() + guide.getIndividualTours().size())
        );
        
        return dto;
    }
} 