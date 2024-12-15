package com.example.bilkentio_backend.authentication.controller;

import com.example.bilkentio_backend.authentication.JwtUtil;
import com.example.bilkentio_backend.authentication.response.AuthenticationResponse;
import com.example.bilkentio_backend.authentication.request.LoginRequest;
import com.example.bilkentio_backend.authentication.service.CustomUserDetailsService;
import com.example.bilkentio_backend.guidanceCounselor.entity.GuidanceCounselor;
import com.example.bilkentio_backend.user.entity.User;
import com.example.bilkentio_backend.user.repository.UserRepository;
import com.example.bilkentio_backend.user.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import com.example.bilkentio_backend.individual.entity.Individual;
import com.example.bilkentio_backend.school.entity.School;
import com.example.bilkentio_backend.school.repository.SchoolRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.scheduling.annotation.Async;
import com.example.bilkentio_backend.common.EmailService;
import org.springframework.context.ApplicationEventPublisher;
import com.example.bilkentio_backend.common.event.EmailEvent;

import java.util.Collections;
import java.util.UUID;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping({"/auth", "/api/auth"})
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            logger.info("Login attempt for user: {}", loginRequest.getUsername());
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );

            final User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            final String jwt = jwtUtil.generateToken(user);
            System.out.println(jwt);
            return ResponseEntity.ok(new AuthenticationResponse(jwt));
        } catch (BadCredentialsException e) {
            logger.error("Login failed for user: {}", loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }
    }

    @PostMapping("/register/counselor")
    public ResponseEntity<?> registerUser(@RequestBody GuidanceCounselor newCounselor) {
        logger.info("Registration attempt for counselor: {}", newCounselor.getUsername());
        
        try {
            if (userService.isUsernameTaken(newCounselor.getUsername())) {
                logger.warn("Registration failed: Username '{}' already exists", newCounselor.getUsername());
                return ResponseEntity
                        .badRequest()
                        .body("Error: Username is already taken!");
            }

            if (newCounselor.getNameSurname() == null || newCounselor.getNameSurname().isEmpty()) {
                String defaultName = "User_" + UUID.randomUUID().toString().substring(0, 8);
                newCounselor.setNameSurname(defaultName);
                logger.info("Generated default name and surname: {}", defaultName);
            }

            // Create new GuidanceCounselor directly
            GuidanceCounselor counselor = new GuidanceCounselor();
            String rawPassword = newCounselor.getPassword();
            
            counselor.setUsername(newCounselor.getUsername());
            counselor.setPassword(passwordEncoder.encode(rawPassword));
            counselor.setNameSurname(newCounselor.getNameSurname());
            counselor.setEmail(newCounselor.getEmail());
            counselor.setPhoneNumber(newCounselor.getPhoneNumber());
            counselor.setRoles(Collections.singleton("ROLE_COUNSELOR"));

            // Set school
            School school = schoolRepository.findById(newCounselor.getSchool().getId())
                .orElseThrow(() -> new RuntimeException("School not found"));
            counselor.setSchool(school);
            
            GuidanceCounselor savedCounselor = userRepository.save(counselor);
            
            // Send credentials email
            sendCredentialsEmail(savedCounselor, rawPassword, "counselor");

            logger.info("Counselor successfully registered with school assignment");
            return ResponseEntity.ok("Counselor registered successfully!");
            
        } catch (Exception e) {
            logger.error("Error during counselor registration", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error during registration: " + e.getMessage());
        }
    }

    @PostMapping("/register/individual")
    public ResponseEntity<?> registerIndividual(@RequestBody Individual newIndividual) {
        logger.info("Registration attempt for individual: {}", newIndividual.getUsername());

        if (userService.isUsernameTaken(newIndividual.getUsername())) {
            logger.warn("Registration failed: Username '{}' already exists", newIndividual.getUsername());
            return ResponseEntity
                    .badRequest()
                    .body("Error: Username is already taken!");
        }

        if (newIndividual.getNameSurname() == null || newIndividual.getNameSurname().isEmpty()) {
            String defaultName = "User_" + UUID.randomUUID().toString().substring(0, 8);
            newIndividual.setNameSurname(defaultName);
            logger.info("Generated default name and surname: {}", defaultName);
        }

        userService.createUserWithRole(newIndividual, "INDIVIDUAL");
        
        return ResponseEntity.ok("Individual registered successfully!");
    }

    @GetMapping("/getRole")
    public ResponseEntity<?> getUserRole(@RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7)); // Remove "Bearer " prefix
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            return ResponseEntity.ok(Collections.singletonMap("roles", userDetails.getAuthorities()));
        } catch (Exception e) {
            logger.error("Error getting user role", e);
            return ResponseEntity.status(401).body("Error getting user role");
        }
    }

    @Async
    protected void sendCredentialsEmail(User user, String rawPassword, String role) {
        String emailContent = emailService.createCredentialsEmailBody(
            user.getNameSurname(),
            user.getUsername(),
            rawPassword,
            role
        );

        eventPublisher.publishEvent(new EmailEvent(
            user.getEmail(),
            "Bilkent IO - Your Account Credentials",
            emailContent
        ));
    }
}
