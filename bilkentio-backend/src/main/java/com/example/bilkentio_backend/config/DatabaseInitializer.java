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
import com.example.bilkentio_backend.tour.entity.Tour;
import com.example.bilkentio_backend.tour.repository.TourRepository;
import com.example.bilkentio_backend.form.entity.Form;
import com.example.bilkentio_backend.form.repository.FormRepository;
import com.example.bilkentio_backend.form.enums.FormState;
import com.example.bilkentio_backend.tour.enums.TourStatus;
import com.example.bilkentio_backend.day.entity.TimeSlot;
import com.example.bilkentio_backend.day.repository.SlotRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import com.example.bilkentio_backend.school.entity.School;
import com.example.bilkentio_backend.day.enums.SlotStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

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
    private TourRepository tourRepository;

    @Autowired
    private FormRepository formRepository;

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SchoolService schoolService;

    @Override
    public void run(String... args) {
        try {
            initializeAdmin();
            logger.info("Admin initialization completed successfully");
        } catch (Exception e) {
            logger.error("Failed to initialize Admin: {}", e.getMessage(), e);
        }

        try {
            initializeDays();
            logger.info("Days initialization completed successfully");
        } catch (Exception e) {
            logger.error("Failed to initialize Days: {}", e.getMessage(), e);
        }

        try {
            initializeIndividual();
            logger.info("Individual initialization completed successfully");
        } catch (Exception e) {
            logger.error("Failed to initialize Individual: {}", e.getMessage(), e);
        }

        try {
            initializeSchools();
            logger.info("Schools initialization completed successfully");
        } catch (Exception e) {
            logger.error("Failed to initialize Schools: {}", e.getMessage(), e);
        }

        // START OF MOCK DATA - REMOVE IN PRODUCTION
        try {
            initializeMockCounselors();
            logger.info("Mock Counselors initialization completed successfully");
        } catch (Exception e) {
            logger.error("Failed to initialize Mock Counselors: {}", e.getMessage(), e);
        }

        try {
            initializeMockGuides();
            logger.info("Mock Guides initialization completed successfully");
        } catch (Exception e) {
            logger.error("Failed to initialize Mock Guides: {}", e.getMessage(), e);
        }

        try {
            initializeMockToursAndForms();
            logger.info("Mock Tours and Forms initialization completed successfully");
        } catch (Exception e) {
            logger.error("Failed to initialize Mock Tours and Forms: {}", e.getMessage(), e);
        }
        // END OF MOCK DATA
    }

    @Transactional
    private void initializeAdmin() {
        logger.info("Starting Admin initialization...");
        if (!adminRepository.findByUsername("admin").isPresent()) {
            Admin admin = new Admin();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("abba"));
            admin.setNameSurname("System Administrator");
            admin.setRoles(new HashSet<>(Arrays.asList("ROLE_ADMIN", "ROLE_ADVISOR")));
            adminRepository.save(admin);
        }
    }

    @Transactional
    private void initializeDays() {
        logger.info("Starting Days initialization...");
        // Original method unchanged
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

    @Transactional
    private void initializeIndividual() {
        logger.info("Starting Individual initialization...");
        // Original method unchanged
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

    @Transactional
    private void initializeSchools() {
        logger.info("Starting Schools initialization...");
        // Original method unchanged
        if (schoolService.getAllSchools().isEmpty()) {
            try {
                schoolService.importSchoolsFromCsv(
                        "/Users/barisyayci/Desktop/bilcant/SS.2.2/CS319/bilknetio/S3-T3-bilkentio/bilkentio-backend/src/main/resources/processed_schools.csv");
            } catch (Exception e) {
                logger.error("Failed to initialize schools", e);
            }
        }
    }

    // New methods for mock data
    @Transactional
    private void initializeMockCounselors() {
        logger.info("Starting Mock Counselors initialization...");
        if (guidanceCounselorRepository.count() == 0) {
            List<School> schools = schoolService.getAllSchools();
            List<GuidanceCounselor> counselors = new ArrayList<>();
            Random random = new Random();

            // Turkish names for more realistic data
            String[] firstNames = {
                    "Ahmet", "Mehmet", "Ali", "Ayşe", "Fatma", "Zeynep",
                    "Mustafa", "Emine", "Hatice", "İbrahim", "Yusuf", "Merve",
                    "Can", "Ece", "Deniz", "Elif", "Berk", "Selin", "Burak", "Ceren"
            };

            String[] lastNames = {
                    "Yılmaz", "Kaya", "Demir", "Şahin", "Çelik", "Yıldız",
                    "Arslan", "Taş", "Aksoy", "Aydın", "Özdemir", "Doğan",
                    "Kılıç", "Aslan", "Çetin", "Erdoğan", "Koç", "Kurt", "Özkan", "Şen"
            };

            // Create one counselor for each school
            for (int i = 0; i < schools.size(); i++) {
                School school = schools.get(i);

                // Generate unique name combinations
                String firstName = firstNames[random.nextInt(firstNames.length)];
                String lastName = lastNames[random.nextInt(lastNames.length)];
                String fullName = firstName + " " + lastName;

                GuidanceCounselor counselor = new GuidanceCounselor();
                counselor.setNameSurname(fullName);
                counselor.setUsername("counselor" + (i + 1));
                counselor.setPassword(passwordEncoder.encode("123"));
                counselor.setRoles(new HashSet<>(Collections.singletonList("ROLE_COUNSELOR")));
                counselor.setSchool(school);
                counselor.setEmail(firstName.toLowerCase() + "." + lastName.toLowerCase() + "@" +
                        school.getName().toLowerCase().replaceAll("\\s+", "") + ".edu.tr");
                counselor.setPhoneNumber("+90" + (530 + random.nextInt(3)) + // Random operator code (530-532)
                        String.format("%07d", random.nextInt(10000000))); // 7 random digits

                counselors.add(counselor);

                if ((i + 1) % 100 == 0) {
                    // Save in batches of 100 to prevent memory issues
                    guidanceCounselorRepository.saveAll(counselors);
                    counselors.clear();
                }
            }

            // Save any remaining counselors
            if (!counselors.isEmpty()) {
                guidanceCounselorRepository.saveAll(counselors);
            }

            logger.info("Created {} mock counselors", schools.size());
        }
    }

    @Transactional
    private void initializeMockGuides() {
        logger.info("Starting Mock Guides initialization...");
        if (guideRepository.count() == 0) {
            List<Guide> guides = new ArrayList<>();
            String[] guideNames = {
                    "Alex Turner", "Emily White", "David Lee",
                    "Sophie Clark", "Ryan Taylor", "Olivia Green",
                    "James Wilson", "Emma Davis", "Michael Brown",
                    "Sarah Johnson"
            };

            for (int i = 0; i < guideNames.length; i++) {
                Guide guide = new Guide();
                guide.setNameSurname(guideNames[i]);
                guide.setUsername("guide" + (i + 1));
                guide.setPassword(passwordEncoder.encode("123"));
                guide.setRoles(new HashSet<>(Collections.singletonList("ROLE_GUIDE")));
                guides.add(guide);
            }

            guideRepository.saveAll(guides);
            logger.info("Created {} mock guides", guides.size());
        }
    }

    @Transactional
    private void initializeMockToursAndForms() {
        logger.info("Starting Mock Tours and Forms initialization...");
        if (tourRepository.count() == 0) {
            Random random = new Random();
            List<Guide> guides = guideRepository.findAll();
            List<GuidanceCounselor> counselors = guidanceCounselorRepository.findAll();
            List<Day> availableDays = dayRepository.findAllWithSlots();

            if (availableDays.isEmpty()) {
                logger.error("No available days found in the database. Please ensure days are initialized first.");
                return;
            }

            // Create more tours and forms (200 for better analytics)
            int numberOfTours = 100;
            List<Form> forms = new ArrayList<>();
            List<Tour> tours = new ArrayList<>();
            List<TimeSlot> slotsToUpdate = new ArrayList<>();

            String[] leaderRoles = {
                    "Department Head",
                    "Guidance Counselor",
                    "Vice Principal",
                    "Principal",
                    "Academic Coordinator",
                    "Career Advisor",
                    "Student Affairs Coordinator"
            };

            for (int i = 0; i < numberOfTours; i++) {
                try {
                    // Create form
                    Form form = new Form();
                    GuidanceCounselor counselor = counselors.get(random.nextInt(counselors.size()));
                    form.setSubmittedBy(counselor);
                    form.setSchool(counselor.getSchool());
                    form.setGroupSize(10 + random.nextInt(31));
                    form.setContactPhone(counselor.getPhoneNumber());
                    form.setExpectations("Sample expectations for tour " + (i + 1));
                    form.setSpecialRequirements("Sample requirements for tour " + (i + 1));
                    form.setGroupLeaderRole(leaderRoles[random.nextInt(leaderRoles.length)]);
                    form.setGroupLeaderPhone(counselor.getPhoneNumber());
                    form.setGroupLeaderEmail(counselor.getEmail());
                    form.setVisitorNotes("Sample notes for tour " + (i + 1));
                    form.setAgreeToTerms(true);
                    form.setState(FormState.APPROVED);

                    // Get a random existing day and its slots
                    Day randomDay = availableDays.get(random.nextInt(availableDays.size()));
                    List<TimeSlot> daySlots = randomDay.getSlots().stream()
                            .filter(slot -> slot.getStatus() == SlotStatus.AVAILABLE)
                            .collect(Collectors.toList());

                    if (!daySlots.isEmpty()) {
                        TimeSlot randomSlot = daySlots.get(random.nextInt(daySlots.size()));
                        form.setLinkedSlot(randomSlot);

                        // Update slot status based on form state
                        if (form.getState() == FormState.PENDING) {
                            randomSlot.setStatus(SlotStatus.FORM_REQUESTED);
                        } else if (form.getState() == FormState.APPROVED) {
                            randomSlot.setStatus(SlotStatus.UNAVAILABLE);
                        }

                        slotsToUpdate.add(randomSlot);
                        forms.add(form);

                        // Create corresponding tour
                        Tour tour = new Tour();
                        tour.setForm(form);
                        tour.setCounselor(counselor);
                        tour.setSchool(counselor.getSchool());
                        tour.setDate(randomDay.getDate());
                        tour.setTime(randomSlot.getTime());
                        tour.setGroupSize(form.getGroupSize());
                        tour.setRequiredGuides(1 + random.nextInt(3));
                        tour.setExpectations(form.getExpectations());
                        tour.setSpecialRequirements(form.getSpecialRequirements());
                        tour.setVisitorNotes(form.getVisitorNotes());
                        tour.setGroupLeaderRole(form.getGroupLeaderRole());
                        tour.setGroupLeaderPhone(form.getGroupLeaderPhone());
                        tour.setGroupLeaderEmail(form.getGroupLeaderEmail());

                        // Set status with weighted distribution
                        double statusRandom = random.nextDouble();
                        if (statusRandom < 0.2) {
                            tour.setStatus(TourStatus.GUIDES_PENDING);
                            // Don't assign guides for GUIDES_PENDING status
                            tour.setAssignedGuides(new HashSet<>());
                        } else {
                            // Assign guides for other statuses
                            Set<Guide> assignedGuides = new HashSet<>();
                            int numGuides = 1 + random.nextInt(tour.getRequiredGuides());
                            for (int j = 0; j < numGuides; j++) {
                                assignedGuides.add(guides.get(random.nextInt(guides.size())));
                            }
                            tour.setAssignedGuides(assignedGuides);

                            if (statusRandom < 0.4) {
                                tour.setStatus(TourStatus.WAITING_TO_FINISH);
                            } else {
                                // For FINISHED and GIVEN_FEEDBACK status, add end time and total hours
                                LocalTime startTime = LocalTime.parse(tour.getTime());
                                // Generate random duration between 1 and 4 hours
                                int additionalHours = 1 + random.nextInt(3);
                                int additionalMinutes = random.nextInt(60);
                                LocalTime endTime = startTime.plusHours(additionalHours).plusMinutes(additionalMinutes);
                                
                                tour.setEndTime(endTime);
                                // Calculate and set total hours
                                double totalHours = additionalHours + (additionalMinutes / 60.0);
                                tour.setTotalHours(totalHours);

                                if (statusRandom < 0.7) {
                                    tour.setStatus(TourStatus.FINISHED);
                                } else {
                                    tour.setStatus(TourStatus.GIVEN_FEEDBACK);
                                    tour.setFeedback("Sample feedback for tour " + (i + 1));
                                    tour.setRating(3 + random.nextInt(3));
                                }
                            }
                        }
                        tours.add(tour);

                        if ((i + 1) % 50 == 0) {
                            // Save in batches to prevent memory issues
                            slotRepository.saveAll(slotsToUpdate);
                            formRepository.saveAll(forms);
                            tourRepository.saveAll(tours);
                            forms.clear();
                            tours.clear();
                            slotsToUpdate.clear();
                        }
                    } else {
                        logger.warn("Day {} has no available slots, skipping tour creation", randomDay.getDate());
                    }
                } catch (Exception e) {
                    logger.error("Error creating tour {}: {}", i + 1, e.getMessage(), e);
                }
            }

            // Save any remaining forms and tours
            if (!forms.isEmpty()) {
                slotRepository.saveAll(slotsToUpdate);
                formRepository.saveAll(forms);
                tourRepository.saveAll(tours);
            }

            logger.info("Created {} mock tours and forms", numberOfTours);
        }
    }
}