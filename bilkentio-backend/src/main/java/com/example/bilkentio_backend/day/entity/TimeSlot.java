package com.example.bilkentio_backend.day.entity;

import com.example.bilkentio_backend.form.entity.Form;
import com.example.bilkentio_backend.day.enums.SlotStatus;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "time_slots")
@Data
@NoArgsConstructor
public class TimeSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String time;

    @Enumerated(EnumType.STRING)
    private SlotStatus status = SlotStatus.AVAILABLE;

    @OneToMany(mappedBy = "linkedSlot")
    @JsonManagedReference
    private List<Form> linkedForms = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "day_id")
    @JsonBackReference
    private Day day;

    public TimeSlot(String time) {
        this.time = time;
    }
}

