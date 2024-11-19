package com.example.bilkentio_backend.guide.entity;

import com.example.bilkentio_backend.user.entity.User;
import jakarta.persistence.*;

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

}