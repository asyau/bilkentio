package com.example.bilkentio_backend.admin.controller;

import com.example.bilkentio_backend.user.entity.User;
import com.example.bilkentio_backend.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    
    @Autowired
    private UserService userService;

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody User user, @RequestParam String role) {
        return ResponseEntity.ok(userService.createUserWithRole(user, role));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User user) {
        return userService.updateUser(id, user)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userService.deleteUser(id) 
            ? ResponseEntity.ok().build() 
            : ResponseEntity.notFound().build();
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
