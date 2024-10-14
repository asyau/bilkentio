package com.example.bilkentio_backend.coordinator.entity;


import com.example.bilkentio_backend.user.entity.User;
import jakarta.persistence.*;

@Entity
@Table(name = "coordinators")
@PrimaryKeyJoinColumn(name = "user_id")
public class Coordinator extends User {
    
}
