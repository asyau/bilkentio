package com.example.bilkentio_backend.form.entity;

import com.example.bilkentio_backend.day.entity.TimeSlot;
import com.example.bilkentio_backend.form.enums.FormState;
import com.example.bilkentio_backend.user.entity.User;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "forms")
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Form {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer groupSize;
    private String schoolName;
    private String contactPhone;
    private String expectations;
    private String specialRequirements;
    private String groupLeaderRole;
    private String groupLeaderPhone;
    private String groupLeaderEmail;
    private String visitorNotes;
    private String city;
    private Boolean agreeToTerms;

    @ManyToOne
    @JoinColumn(name = "submitted_by")
    private User submittedBy;

    @Enumerated(EnumType.STRING)
    private FormState state = FormState.PENDING;

    @ManyToOne
    @JoinColumn(name = "linked_slot_id")
    private TimeSlot linkedSlot;

    public String getSlotDate() {
        return linkedSlot != null && linkedSlot.getDay() != null ? 
            linkedSlot.getDay().getDate().toString() : null;
    }

    public String getSlotTime() {
        return linkedSlot != null ? linkedSlot.getTime() : null;
    }
}

