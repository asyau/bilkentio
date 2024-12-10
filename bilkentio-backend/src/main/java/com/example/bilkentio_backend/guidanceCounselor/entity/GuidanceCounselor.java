package com.example.bilkentio_backend.guidanceCounselor.entity;

import com.example.bilkentio_backend.user.entity.User;
import com.example.bilkentio_backend.school.entity.School;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "guidance_counselors")
@PrimaryKeyJoinColumn(name = "user_id")
@Getter
@Setter
public class GuidanceCounselor extends User {
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "school_id")
    @JsonBackReference
    private School school;
    
}