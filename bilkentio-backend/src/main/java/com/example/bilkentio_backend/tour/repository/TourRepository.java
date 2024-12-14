package com.example.bilkentio_backend.tour.repository;

import com.example.bilkentio_backend.tour.entity.Tour;
import com.example.bilkentio_backend.tour.enums.TourStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TourRepository extends JpaRepository<Tour, Long> {
    List<Tour> findByStatus(TourStatus status);
    List<Tour> findByCounselor_Id(Long counselorId);
    List<Tour> findByDateAndStatus(LocalDate date, TourStatus status);
    List<Tour> findByAssignedGuides_Id(Long guideId);
    
    // New methods for school-related queries
    List<Tour> findBySchool_Id(Long schoolId);
    List<Tour> findBySchool_IdAndStatus(Long schoolId, TourStatus status);
    List<Tour> findBySchool_IdOrderByDateAsc(Long schoolId);
} 