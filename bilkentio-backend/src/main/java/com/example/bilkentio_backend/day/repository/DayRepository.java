package com.example.bilkentio_backend.day.repository;

import com.example.bilkentio_backend.day.entity.Day;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface DayRepository extends JpaRepository<Day, Long> {
    boolean existsByDate(LocalDate date);
    List<Day> findByDateBetweenOrderByDateAsc(LocalDate startDate, LocalDate endDate);
} 