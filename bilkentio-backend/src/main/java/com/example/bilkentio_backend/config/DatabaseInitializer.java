package com.example.bilkentio_backend.config;

import com.example.bilkentio_backend.admin.entity.Admin;
import com.example.bilkentio_backend.admin.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Check if admin account exists
        if (!adminRepository.findByUsername("admin").isPresent()) {
            Admin admin = new Admin();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("abba"));
            admin.setNameSurname("System Administrator");
            admin.setRoles(Collections.singleton("ROLE_ADMIN"));
            adminRepository.save(admin);
        }
    }
} 