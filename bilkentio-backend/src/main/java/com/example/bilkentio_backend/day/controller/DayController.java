package com.example.bilkentio_backend.day.controller;

import com.example.bilkentio_backend.day.dto.DayDTO;
import com.example.bilkentio_backend.day.entity.Day;
import com.example.bilkentio_backend.day.service.DayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/days")
@CrossOrigin(origins = "*")
public class DayController {
    @Autowired
    private DayService dayService;

    @GetMapping("/week")
    public ResponseEntity<List<DayDTO>> getCurrentWeek(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate startDate = date != null ? date : LocalDate.now();
        LocalDate endDate = startDate.plusDays(6);
        dayService.ensureDaysExist();
        List<Day> days = dayService.getDaysForRange(startDate, endDate);
        List<DayDTO> dtos = days.stream()
            .map(DayDTO::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
} 