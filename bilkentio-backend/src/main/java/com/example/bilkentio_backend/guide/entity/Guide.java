package com.example.bilkentio_backend.guide.entity;

import com.example.bilkentio_backend.user.entity.User;
import com.example.bilkentio_backend.tour.entity.Tour;
import com.example.bilkentio_backend.tour.entity.IndividualTour;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;
import java.time.format.DateTimeFormatter;
import com.example.bilkentio_backend.tour.enums.TourStatus;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;

@Entity
@Table(name = "guides")
@PrimaryKeyJoinColumn(name = "user_id")
public class Guide extends User {

    @Column(nullable = false)
    private int yearsOfExperience;

    @Column(nullable = true)
    private int score = 0;

    @Column(nullable = true)
    private String level = "Level 0";

    // Add ManyToMany relationship with Tour
    @JsonBackReference
    @ManyToMany(mappedBy = "assignedGuides")
    private Set<Tour> joinedTours = new HashSet<>();

    @JsonBackReference("individual-tour-guides")
    @ManyToMany(mappedBy = "assignedGuides")
    private Set<IndividualTour> individualTours = new HashSet<>();

    public int getYearsOfExperience() {
        return yearsOfExperience;
    }

    public void setYearsOfExperience(int yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public void increaseScore(int increment) {
        this.score += increment;
    }

    public Set<Tour> getJoinedTours() {
        return joinedTours;
    }

    public void setJoinedTours(Set<Tour> joinedTours) {
        this.joinedTours = joinedTours;
    }

    public void addTour(Tour tour) {
        this.joinedTours.add(tour);
    }

    public void removeTour(Tour tour) {
        this.joinedTours.remove(tour);
    }

    public Set<IndividualTour> getIndividualTours() {
        return individualTours;
    }

    public void setIndividualTours(Set<IndividualTour> individualTours) {
        this.individualTours = individualTours;
    }

    public void addIndividualTour(IndividualTour tour) {
        this.individualTours.add(tour);
    }

    public void removeIndividualTour(IndividualTour tour) {
        this.individualTours.remove(tour);
    }

    public int getIndividualTourCountForMonth(String yearMonth) {
        return (int) individualTours.stream()
            .filter(tour -> tour.getStatus() == TourStatus.FINISHED || tour.getStatus() == TourStatus.GIVEN_FEEDBACK)
            .filter(tour -> tour.getDate().format(DateTimeFormatter.ofPattern("yyyy/MM")).equals(yearMonth))
            .count();
    }

    public int getGroupTourCountForMonth(String yearMonth) {
        return (int) joinedTours.stream()
            .filter(tour -> tour.getStatus() == TourStatus.FINISHED || tour.getStatus() == TourStatus.GIVEN_FEEDBACK)
            .filter(tour -> tour.getDate().format(DateTimeFormatter.ofPattern("yyyy/MM")).equals(yearMonth))
            .count();
    }

    public int getIndividualTourCountForYear(String year) {
        return (int) individualTours.stream()
            .filter(tour -> tour.getStatus() == TourStatus.FINISHED || tour.getStatus() == TourStatus.GIVEN_FEEDBACK)
            .filter(tour -> tour.getDate().format(DateTimeFormatter.ofPattern("yyyy")).equals(year))
            .count();
    }

    public int getGroupTourCountForYear(String year) {
        return (int) joinedTours.stream()
            .filter(tour -> tour.getStatus() == TourStatus.FINISHED || tour.getStatus() == TourStatus.GIVEN_FEEDBACK)
            .filter(tour -> tour.getDate().format(DateTimeFormatter.ofPattern("yyyy")).equals(year))
            .count();
    }

    public double getAverageRating() {
        double individualRatings = individualTours.stream()
            .filter(tour -> tour.getRating() != null)
            .mapToInt(IndividualTour::getRating)
            .average()
            .orElse(0.0);

        double groupRatings = joinedTours.stream()
            .filter(tour -> tour.getRating() != null)
            .mapToInt(Tour::getRating)
            .average()
            .orElse(0.0);

        // If there are no ratings, return 0
        if (individualRatings == 0.0 && groupRatings == 0.0) {
            return 0.0;
        }

        // Calculate weighted average if both types exist
        if (individualRatings > 0.0 && groupRatings > 0.0) {
            return (individualRatings + groupRatings) / 2.0;
        }

        // Return whichever is non-zero
        return individualRatings > 0.0 ? individualRatings : groupRatings;
    }

    public List<TourReview> getAllReviews() {
        List<TourReview> reviews = new ArrayList<>();
        
        // Add individual tour reviews
        individualTours.stream()
            .filter(tour -> tour.getFeedback() != null && tour.getRating() != null)
            .forEach(tour -> reviews.add(new TourReview(
                "Individual Tour",
                tour.getDate(),
                tour.getFeedback(),
                tour.getRating()
            )));

        // Add group tour reviews
        joinedTours.stream()
            .filter(tour -> tour.getFeedback() != null && tour.getRating() != null)
            .forEach(tour -> reviews.add(new TourReview(
                tour.getSchoolName(),
                tour.getDate(),
                tour.getFeedback(),
                tour.getRating()
            )));

        return reviews;
    }

    @Data
    @AllArgsConstructor
    public static class TourReview {
        private String tourName;
        private LocalDate date;
        private String feedback;
        private Integer rating;
    }

}