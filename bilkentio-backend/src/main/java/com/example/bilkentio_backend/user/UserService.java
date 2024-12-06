package com.example.bilkentio_backend.user;

import com.example.bilkentio_backend.admin.entity.Admin;
import com.example.bilkentio_backend.advisor.entity.Advisor;
import com.example.bilkentio_backend.advisor.repository.AdvisorRepository;
import com.example.bilkentio_backend.coordinator.entity.Coordinator;
import com.example.bilkentio_backend.guidanceCounselor.entity.GuidanceCounselor;
import com.example.bilkentio_backend.guide.entity.Guide;
import com.example.bilkentio_backend.guide.repository.GuideRepository;
import com.example.bilkentio_backend.individual.entity.Individual;
import com.example.bilkentio_backend.president.entity.President;
import com.example.bilkentio_backend.user.entity.User;
import com.example.bilkentio_backend.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    @Autowired
    private GuideRepository guideRepository;

     @Autowired
    private AdvisorRepository advisorRepository; // Add this


    public User saveUser(User newUser) {
        User user = new User();
        user.setUsername(newUser.getUsername());
        user.setPassword(passwordEncoder.encode(newUser.getPassword()));
        user.setNameSurname(newUser.getNameSurname());
        user.setRoles(Collections.singleton("ROLE_USER")); // Default role
        return userRepository.save(user);
    }

    public boolean isUsernameTaken(String username) {
        return userRepository.findByUsername(username).isPresent();
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> updateUser(Long id, User updatedUser) {
        return userRepository.findById(id)
            .map(user -> {
                user.setUsername(updatedUser.getUsername());
                user.setNameSurname(updatedUser.getNameSurname());
                
                // Update role if provided
                if (updatedUser.getRoles() != null && !updatedUser.getRoles().isEmpty()) {
                    user.setRoles(updatedUser.getRoles());
                }
                
                // Update password if provided
                if (updatedUser.getPassword() != null) {
                    user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
                }
                
                return userRepository.save(user);
            });
    }

    public boolean deleteUser(Long id) {
        try {
            Optional<User> userOptional = userRepository.findById(id);
            if (userOptional.isPresent()) {
                userRepository.delete(userOptional.get());
                return true;
            }
            return false;
        } catch (Exception e) {
            logger.error("Error deleting user with id " + id, e);
            throw e;
        }
    }

    public boolean changePassword(Long userId, String oldPassword, String newPassword) {
        return userRepository.findById(userId)
                .map(user -> {
                    if (passwordEncoder.matches(oldPassword, user.getPassword())) {
                        user.setPassword(passwordEncoder.encode(newPassword));
                        userRepository.save(user);
                        return true;
                    }
                    return false;
                })
                .orElse(false);
    }

    public User createUserWithRole(User newUser, String role) {
        // Create the appropriate entity based on role
        User user = switch (role.toLowerCase()) {
            case "admin" -> new Admin();
            case "advisor" -> new Advisor();
            case "guide" -> new Guide();
            case "president" -> new President();
            case "coordinator" -> new Coordinator();
            case "individual" -> new Individual();
            case "counselor" -> new GuidanceCounselor();
            default -> throw new IllegalArgumentException("Invalid role: " + role);
        };

        // Set common properties
        user.setUsername(newUser.getUsername());
        user.setPassword(passwordEncoder.encode(newUser.getPassword()));
        user.setNameSurname(newUser.getNameSurname());

        // Set role
        String roleWithPrefix = "ROLE_" + role.toUpperCase();
        user.setRoles(Collections.singleton(roleWithPrefix));

        return userRepository.save(user);
    }
}
