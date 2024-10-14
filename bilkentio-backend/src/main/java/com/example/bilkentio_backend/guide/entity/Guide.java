package com.example.bilkentio_backend.guide.entity;


import com.example.bilkentio_backend.user.entity.User;
import jakarta.persistence.*;

@Entity
@Table(name = "guides")
@PrimaryKeyJoinColumn(name = "user_id")
public class Guide extends User {
    @Column(nullable = false)
    private String specialization;

    @Column(nullable = false)
    private int yearsOfExperience;

    // Getters and setters
}