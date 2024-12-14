package com.example.bilkentio_backend.user.controller;

import com.example.bilkentio_backend.user.entity.User;
import com.example.bilkentio_backend.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import com.example.bilkentio_backend.authentication.*;
import com.example.bilkentio_backend.user.repository.UserRepository;
import java.util.Collections;
import java.util.HashMap;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtUtil jwtUtil; 

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    // Create
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User savedUser = userService.saveUser(user);
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }

    // Read (all users)
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    // Read (single user)
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(user -> new ResponseEntity<>(user, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        return userService.updateUser(id, user)
                .map(updatedUser -> new ResponseEntity<>(updatedUser, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            boolean deleted = userService.deleteUser(id);
            if (deleted) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error deleting user with id " + id, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/{id}/change-password")
    public ResponseEntity<Void> changePassword(@PathVariable Long id, @RequestBody PasswordChangeRequest request) {
        boolean changed = userService.changePassword(id, request.getOldPassword(), request.getNewPassword());
        if (changed) {
            return new ResponseEntity<>(HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/check-username/{username}")
    public ResponseEntity<?> checkUsernameAvailability(@PathVariable String username) {
        boolean isAvailable = userService.isUsernameAvailable(username);
        Map<String, Boolean> response = new HashMap<>();
        response.put("available", isAvailable);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update-username")
    public ResponseEntity<?> updateUsername(@RequestBody Map<String, String> request) {
        String newUsername = request.get("username");
        
        if (newUsername == null || newUsername.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Username cannot be empty");
        }

        // Get current user from security context
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        
        try {
            boolean updated = userService.updateUsername(currentUsername, newUsername);
            if (updated) {
                // Generate new JWT token
                User updatedUser = userRepository.findByUsername(newUsername).orElse(null);
                String newJwt = jwtUtil.generateToken(updatedUser);
                return ResponseEntity.ok(Collections.singletonMap("token", newJwt));
            } else {
                return ResponseEntity.badRequest().body("Username is already taken");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating username: " + e.getMessage());
        }
    }

    
}


// Add this class at the end of the file or in a separate file
class PasswordChangeRequest {
    private String oldPassword;
    private String newPassword;

    // Getters and setters
    public String getOldPassword() {
        return oldPassword;
    }

    public void setOldPassword(String oldPassword) {
        this.oldPassword = oldPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
