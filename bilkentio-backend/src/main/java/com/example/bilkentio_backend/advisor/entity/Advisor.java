package com.example.bilkentio_backend.advisor.entity;


import com.example.bilkentio_backend.user.entity.User;
import jakarta.persistence.*;

@Entity
@Table(name = "advisors")
@PrimaryKeyJoinColumn(name = "user_id")
public class Advisor extends User {
    
}