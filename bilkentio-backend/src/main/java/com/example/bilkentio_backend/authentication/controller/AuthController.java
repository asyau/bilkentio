package com.example.bilkentio_backend.authentication.controller;

import com.example.bilkentio_backend.authentication.JwtUtil;
import com.example.bilkentio_backend.authentication.response.AuthenticationResponse;
import com.example.bilkentio_backend.authentication.service.CustomUserDetailsService;
import com.example.bilkentio_backend.user.entity.User;
import com.example.bilkentio_backend.user.repository.UserRepository;
import com.example.bilkentio_backend.user.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/auth")
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
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody User user) throws Exception {
        logger.info("Login attempt for user: {}", user.getUsername());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
            );
            logger.info("Authentication successful for user: {}", user.getUsername());
        } catch (BadCredentialsException e) {
            logger.error("Authentication failed for user: {}", user.getUsername(), e);
            return ResponseEntity.status(401).body("Incorrect username or password");
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        final String jwt = jwtUtil.generateToken(userDetails);
        logger.info("JWT token generated for user: {}", user.getUsername());

        return ResponseEntity.ok(new AuthenticationResponse(jwt));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User newUser) {
        logger.info("Registration attempt for user: {}", newUser.getUsername());

        // Check if username already exists
        if (userService.isUsernameTaken(newUser.getUsername())) {
            logger.warn("Registration failed: Username '{}' already exists", newUser.getUsername());
            return ResponseEntity
                    .badRequest()
                    .body("Error: Username is already taken!");
        }

        // If name and surname are not provided, generate default ones
        if (newUser.getNameSurname() == null || newUser.getNameSurname().isEmpty()) {
            String defaultName = "User_" + UUID.randomUUID().toString().substring(0, 8);
            newUser.setNameSurname(defaultName);
            logger.info("Generated default name and surname: {}", defaultName);
        }

        // Create new user's account using UserService
        User savedUser = userService.saveUser(newUser);
        logger.info("User registered successfully: {}", savedUser.getUsername());

        return ResponseEntity.ok("User registered successfully!");
    }
}
