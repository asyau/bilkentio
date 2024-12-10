package com.example.bilkentio_backend.fair.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "fairs")
public class Fair {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String schoolName;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String status;

    private Double schoolRank;

    @Column(nullable = false)
    private String contactPerson;

    @Column(nullable = false)
    private String contactEmail;

    @Column(nullable = false)
    private String contactPhone;

    private Integer expectedStudents;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private Long assignedGuideId;

    @Column(nullable = false)
    private LocalDate submissionDate;
}