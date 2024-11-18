package com.example.bilkentio_backend.day.service;

import com.example.bilkentio_backend.day.entity.Day;
import com.example.bilkentio_backend.day.repository.DayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
public class DayService {
    @Autowired
    private DayRepository dayRepository;

    @Transactional
    public void ensureDaysExist() {
        LocalDate today = LocalDate.now();
        LocalDate endOfNextMonth = today.plusMonths(1);

        LocalDate current = today;
        while (!current.isAfter(endOfNextMonth)) {
            if (!dayRepository.existsByDate(current)) {
                Day day = new Day();
                day.setDate(current);
                day.initializeSlots();
                dayRepository.save(day);
            }
            current = current.plusDays(1);
        }
    }

    public List<Day> getDaysForRange(LocalDate startDate, LocalDate endDate) {
        return dayRepository.findByDateBetweenOrderByDateAsc(startDate, endDate);
    }
} 