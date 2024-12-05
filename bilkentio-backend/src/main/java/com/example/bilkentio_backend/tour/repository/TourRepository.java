package com.example.bilkentio_backend.tour.repository;

import com.example.bilkentio_backend.tour.entity.Tour;
import com.example.bilkentio_backend.tour.enums.TourStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TourRepository extends JpaRepository<Tour, Long> {
    List<Tour> findByStatus(TourStatus status);
    List<Tour> findByAssignedGuidesId(Long guideId);
    List<Tour> findByCounselorId(Long counselorId);
    List<Tour> findByCounselorUsername(String counselorUsername);
} 