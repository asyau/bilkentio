package com.example.bilkentio_backend.guide.entity;

import com.example.bilkentio_backend.user.entity.User;
import com.example.bilkentio_backend.tour.entity.Tour;
import com.example.bilkentio_backend.tour.entity.IndividualTour;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

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

}