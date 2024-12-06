package com.example.bilkentio_backend.advisor.entity;


import com.example.bilkentio_backend.user.entity.User;
import jakarta.persistence.*;

@Entity
@Table(name = "advisors")
@PrimaryKeyJoinColumn(name = "user_id")
public class Advisor extends User {
    @Column(name = "responsible_day")
    private String responsibleDay;

    // Getter and Setter
    public String getResponsibleDay() {
        return responsibleDay;
    }

    public void setResponsibleDay(String responsibleDay) {
        this.responsibleDay = responsibleDay;
    }
}