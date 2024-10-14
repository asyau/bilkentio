package com.example.bilkentio_backend.guidanceCounselor.entity;

import com.example.bilkentio_backend.user.entity.User;
import jakarta.persistence.*;

@Entity
@Table(name = "guidance_counselors")
@PrimaryKeyJoinColumn(name = "user_id")
public class GuidanceCounselor extends User {
    
}