package com.example.bilkentio_backend.config;

import com.example.bilkentio_backend.admin.entity.Admin;
import com.example.bilkentio_backend.admin.repository.AdminRepository;
import com.example.bilkentio_backend.day.entity.Day;
import com.example.bilkentio_backend.day.repository.DayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private DayRepository dayRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        initializeAdmin();
        initializeDays();
    }

    private void initializeAdmin() {
        // Check if admin account exists
        if (!adminRepository.findByUsername("admin").isPresent()) {
            Admin admin = new Admin();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("abba"));
            admin.setNameSurname("System Administrator");
            admin.setRoles(new HashSet<>(Arrays.asList("ROLE_ADMIN", "ROLE_ADVISOR")));
            adminRepository.save(admin);
        }
    }

    private void initializeDays() {
        LocalDate today = LocalDate.now();
        LocalDate endOfNextMonth = today.plusMonths(1);

        LocalDate current = today;
        while (!current.isAfter(endOfNextMonth)) {
            if (!dayRepository.existsByDate(current)) {
                Day day = new Day();
                day.setDate(current);
                day.initializeSlots();
                
                // Set the day reference for each slot
                day.getSlots().forEach(slot -> slot.setDay(day));
                
                dayRepository.save(day);
            }
            current = current.plusDays(1);
        }
    }
} 