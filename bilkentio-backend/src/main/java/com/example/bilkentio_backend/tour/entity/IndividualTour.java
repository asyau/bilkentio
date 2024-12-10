package com.example.bilkentio_backend.tour.entity;

import com.example.bilkentio_backend.guide.entity.Guide;
import com.example.bilkentio_backend.tour.enums.TourStatus;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "individual_tours")
@Getter
@Setter
public class IndividualTour {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;  // to track who submitted the request

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String time;

    @Column(nullable = false)
    private String interests;

    @Column(nullable = false)
    private String contactNumber;

    @Column(nullable = false)
    private String email;

    @Column
    private String specialRequirements;

    @Column
    private String visitorNotes;

    @JsonManagedReference("individual-tour-guides")
    @ManyToMany
    @JoinTable(
        name = "individual_tour_guides",
        joinColumns = @JoinColumn(name = "individual_tour_id"),
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

    @Column
    private String city;

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
} 