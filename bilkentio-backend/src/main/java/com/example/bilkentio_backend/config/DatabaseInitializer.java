package com.example.bilkentio_backend.config;

import com.example.bilkentio_backend.admin.entity.Admin;
import com.example.bilkentio_backend.admin.repository.AdminRepository;
import com.example.bilkentio_backend.day.entity.Day;
import com.example.bilkentio_backend.day.repository.DayRepository;
import com.example.bilkentio_backend.guide.entity.Guide;
import com.example.bilkentio_backend.guide.repository.GuideRepository;
import com.example.bilkentio_backend.individual.entity.Individual;
import com.example.bilkentio_backend.individual.repository.IndividualRepository;
import com.example.bilkentio_backend.guidanceCounselor.entity.GuidanceCounselor;
import com.example.bilkentio_backend.guidanceCounselor.repository.GuidanceCounselorRepository;
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
    private IndividualRepository individualRepository;

    @Autowired
    private GuideRepository guideRepository;

    @Autowired
    private GuidanceCounselorRepository guidanceCounselorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        initializeAdmin();
        initializeDays();
        initializeIndividual();
        initializeGuide();
        initializeCounselor();
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

    private void initializeGuide() {
        // Check if guide account exists
        if (!guideRepository.findByUsername("asya").isPresent()) {
            Guide guide = new Guide();
            guide.setUsername("asya");
            guide.setPassword(passwordEncoder.encode("123"));
            guide.setNameSurname("Asya Guide");
            guide.setEmail("asya@example.com");
            guide.setPhoneNumber("+90 555 987 6543");
            guide.setYearsOfExperience(2);
            guide.setScore(0);
            guide.setLevel("Level 0");
            guide.setRoles(new HashSet<>(Collections.singletonList("ROLE_GUIDE")));
            guideRepository.save(guide);
        }
    }

    private void initializeCounselor() {
        // Check if counselor account exists
        if (!guidanceCounselorRepository.findByUsername("eray").isPresent()) {
            GuidanceCounselor counselor = new GuidanceCounselor();
            counselor.setUsername("eray");
            counselor.setPassword(passwordEncoder.encode("123"));
            counselor.setNameSurname("Eray Counselor");
            counselor.setEmail("barsyayc@gmail.com");
            counselor.setPhoneNumber("+90 555 123 4567");
            counselor.setRoles(new HashSet<>(Collections.singletonList("ROLE_COUNSELOR")));
            guidanceCounselorRepository.save(counselor);
        }
    }
}