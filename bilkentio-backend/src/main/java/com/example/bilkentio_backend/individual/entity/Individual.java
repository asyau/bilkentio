package com.example.bilkentio_backend.individual.entity;


import com.example.bilkentio_backend.user.entity.User;
import jakarta.persistence.*;

@Entity
@Table(name = "individuals")
@PrimaryKeyJoinColumn(name = "user_id")
public class Individual extends User {
    
}