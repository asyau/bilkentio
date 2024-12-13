package com.example.bilkentio_backend.tour.entity;

import com.example.bilkentio_backend.form.entity.Form;
import com.example.bilkentio_backend.guide.entity.Guide;
import com.example.bilkentio_backend.tour.enums.TourStatus;
import com.example.bilkentio_backend.user.entity.User;
import com.example.bilkentio_backend.school.entity.School;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "tours")
@Data
public class Tour {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "form_id")
    private Form form;

    @ManyToOne
    @JoinColumn(name = "counselor_id")
    private User counselor;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String time;

    @Column(nullable = false)
    private Integer groupSize;

    @Column(nullable = false)
    private Integer requiredGuides;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "school_id", nullable = false)
    @JsonBackReference
    private School school;

    @Column
    private String expectations;

    @Column
    private String specialRequirements;

    @Column
    private String visitorNotes;

    @JsonManagedReference
    @ManyToMany
    @JoinTable(
        name = "tour_guides",
        joinColumns = @JoinColumn(name = "tour_id"),
        inverseJoinColumns = @JoinColumn(name = "guide_id")
    )
    private Set<Guide> assignedGuides = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TourStatus status = TourStatus.GUIDES_PENDING;

    @Column
    private String feedback;

    @Column
    private Integer rating;

    @Column
    private String cancellationReason;

    // Convenience methods to get school information
    public String getSchoolName() {
        return school != null ? school.getName() : null;
    }

    public String getCity() {
        return school != null ? school.getCity() : null;
    }
} 