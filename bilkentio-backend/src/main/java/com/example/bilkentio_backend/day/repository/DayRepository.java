package com.example.bilkentio_backend.day.repository;

import com.example.bilkentio_backend.day.entity.Day;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DayRepository extends JpaRepository<Day, Long> {
    boolean existsByDate(LocalDate date);
    List<Day> findByDateBetweenOrderByDateAsc(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT d FROM Day d LEFT JOIN FETCH d.slots WHERE 1=1")
    List<Day> findAllWithSlots();
    
    Optional<Day> findByDate(LocalDate date);
} 