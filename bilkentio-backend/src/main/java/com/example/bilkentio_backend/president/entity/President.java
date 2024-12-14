package com.example.bilkentio_backend.president.entity;

import com.example.bilkentio_backend.user.entity.User;
import jakarta.persistence.*;

@Entity
@Table(name = "presidents")
@PrimaryKeyJoinColumn(name = "user_id")
public class President extends User {
   

}