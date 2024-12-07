package com.example.bilkentio_backend.tour.repository;

import com.example.bilkentio_backend.tour.entity.IndividualTour;
import com.example.bilkentio_backend.tour.enums.TourStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IndividualTourRepository extends JpaRepository<IndividualTour, Long> {
    List<IndividualTour> findByStatus(TourStatus status);
    List<IndividualTour> findByUsername(String username);
} 