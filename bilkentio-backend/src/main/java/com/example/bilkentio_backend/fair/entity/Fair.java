package com.example.bilkentio_backend.fair.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.bilkentio_backend.fair.enums.FairStatus;
import com.example.bilkentio_backend.user.entity.User;

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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FairStatus status = FairStatus.PENDING;

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

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_guide_id")
    private User assignedGuide;

    private LocalDateTime guideAssignedAt;
    private LocalDateTime guideResponseAt;
    private Boolean guideAccepted;

    @Column(nullable = false)
    private LocalDate submissionDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by_id")
    private User requestedBy;
}