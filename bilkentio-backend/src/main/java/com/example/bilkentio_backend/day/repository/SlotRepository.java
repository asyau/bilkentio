package com.example.bilkentio_backend.day.repository;
import com.example.bilkentio_backend.day.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface SlotRepository extends JpaRepository<TimeSlot, Long> {
    Optional<TimeSlot> findByDay_DateAndTime(LocalDate date, String time);
}
