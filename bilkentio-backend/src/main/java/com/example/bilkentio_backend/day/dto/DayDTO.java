package com.example.bilkentio_backend.day.dto;

import com.example.bilkentio_backend.day.entity.Day;
import com.example.bilkentio_backend.day.entity.TimeSlot;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class DayDTO {
    private Long id;
    private LocalDate date;
    private List<TimeSlotDTO> slots;

    public static DayDTO fromEntity(Day day) {
        DayDTO dto = new DayDTO();
        dto.setId(day.getId());
        dto.setDate(day.getDate());
        dto.setSlots(day.getSlots().stream()
            .map(TimeSlotDTO::fromEntity)
            .collect(Collectors.toList()));
        return dto;
    }

    @Data
    public static class TimeSlotDTO {
        private Long id;
        private String time;
        private String status;

        public static TimeSlotDTO fromEntity(TimeSlot slot) {
            TimeSlotDTO dto = new TimeSlotDTO();
            dto.setId(slot.getId());
            dto.setTime(slot.getTime());
            dto.setStatus(slot.getStatus().toString());
            return dto;
        }
    }
} 