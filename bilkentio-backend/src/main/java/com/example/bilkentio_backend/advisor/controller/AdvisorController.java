package com.example.bilkentio_backend.advisor.controller;

import com.example.bilkentio_backend.advisor.entity.Advisor;
import com.example.bilkentio_backend.advisor.service.AdvisorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/advisors")
public class AdvisorController {

    @Autowired
    private AdvisorService advisorService;

    @GetMapping
    public List<Advisor> getAllAdvisors() {
        return advisorService.getAllAdvisors();
    }

    @GetMapping("/me")
    public ResponseEntity<Advisor> getCurrentAdvisor(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.badRequest().build();
        }
        return advisorService.getAdvisorByUsername(authentication.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Advisor> getAdvisorById(@PathVariable Long id) {
        return advisorService.getAdvisorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Advisor createAdvisor(@RequestBody Advisor advisor) {
        return advisorService.createAdvisor(advisor);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Advisor> updateAdvisor(@PathVariable Long id, @RequestBody Advisor advisorDetails) {
        return advisorService.updateAdvisor(id, advisorDetails)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAdvisor(@PathVariable Long id) {
        return advisorService.deleteAdvisor(id)
                ? ResponseEntity.ok().build()
                : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/responsible-day")
    public ResponseEntity<Advisor> updateResponsibleDay(
            @PathVariable Long id,
            @RequestBody String day) {
        return advisorService.updateResponsibleDay(id, day)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/responsible-day")
    public ResponseEntity<String> getResponsibleDay(@PathVariable Long id) {
        return advisorService.getResponsibleDay(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
