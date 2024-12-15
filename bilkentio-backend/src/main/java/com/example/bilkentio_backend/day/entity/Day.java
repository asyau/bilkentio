package com.example.bilkentio_backend.day.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "days")
@Data
public class Day {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private LocalDate date;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "day")
    @JsonManagedReference
    private List<TimeSlot> slots = new ArrayList<>();

    public void initializeSlots() {
        slots = new ArrayList<>();
        TimeSlot slot1 = new TimeSlot("09:00");
        TimeSlot slot2 = new TimeSlot("11:00");
        TimeSlot slot3 = new TimeSlot("13:30");
        TimeSlot slot4 = new TimeSlot("16:00");

        slot1.setDay(this);
        slot2.setDay(this);
        slot3.setDay(this);
        slot4.setDay(this);

        slots.add(slot1);
        slots.add(slot2);
        slots.add(slot3);
        slots.add(slot4);
    }
}