package com.example.bilkentio_backend.config;

import com.example.bilkentio_backend.admin.entity.Admin;
import com.example.bilkentio_backend.admin.repository.AdminRepository;
import com.example.bilkentio_backend.day.entity.Day;
import com.example.bilkentio_backend.day.repository.DayRepository;
import com.example.bilkentio_backend.guide.entity.Guide;
import com.example.bilkentio_backend.guide.repository.GuideRepository;
import com.example.bilkentio_backend.individual.entity.Individual;
import com.example.bilkentio_backend.individual.repository.IndividualRepository;
import com.example.bilkentio_backend.school.service.SchoolService;
import com.example.bilkentio_backend.guidanceCounselor.entity.GuidanceCounselor;
import com.example.bilkentio_backend.guidanceCounselor.repository.GuidanceCounselorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private DayRepository dayRepository;

    @Autowired
    private IndividualRepository individualRepository;

    @Autowired
    private GuideRepository guideRepository;

    @Autowired
    private GuidanceCounselorRepository guidanceCounselorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SchoolService schoolService;

    @Override
    @Transactional
    public void run(String... args) {
        initializeAdmin();
        initializeDays();
        initializeIndividual();
        initializeSchools();
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

    private void initializeIndividual() {
        // Check if individual account exists
        if (!individualRepository.findByUsername("baro").isPresent()) {
            Individual individual = new Individual();
            individual.setUsername("baro");
            individual.setPassword(passwordEncoder.encode("123"));
            individual.setNameSurname("Baro Individual");
            individual.setEmail("baro@example.com");
            individual.setPhoneNumber("+90 555 123 4567");
            individual.setRoles(new HashSet<>(Collections.singletonList("ROLE_INDIVIDUAL")));
            individualRepository.save(individual);
        }
    }

    private void initializeSchools() {
        if (schoolService.getAllSchools().isEmpty()) {
            try {
                schoolService.importSchoolsFromCsv("/Users/asyaunal/bilio/S3-T3-bilkentio/bilkentio-backend/src/main/resources/processed_schools.csv");
            } catch (Exception e) {
                logger.error("Failed to initialize schools", e);
            }
        }
    }
}