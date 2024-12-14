package com.example.bilkentio_backend.school.controller;

import com.example.bilkentio_backend.school.entity.School;
import com.example.bilkentio_backend.school.service.SchoolService;
import com.example.bilkentio_backend.guidanceCounselor.entity.GuidanceCounselor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schools")
@CrossOrigin(origins = "*")
public class SchoolController {

    @Autowired
    private SchoolService schoolService;

    @GetMapping
    public ResponseEntity<List<School>> getAllSchools() {
        return ResponseEntity.ok(schoolService.getAllSchools());
    }

    @GetMapping("/cities")
    public ResponseEntity<List<String>> getAllCities() {
        return ResponseEntity.ok(schoolService.getAllCities());
    }

    @GetMapping("/city/{cityName}")
    public ResponseEntity<List<School>> getSchoolsByCity(@PathVariable String cityName) {
        return ResponseEntity.ok(schoolService.getSchoolsByCity(cityName));
    }

    @GetMapping("/priority/{rank}")
    public ResponseEntity<List<School>> getSchoolsByPriorityRank(@PathVariable Integer rank) {
        return ResponseEntity.ok(schoolService.getSchoolsByPriorityRank(rank));
    }

    @GetMapping("/{schoolId}/counselors")
    public ResponseEntity<List<GuidanceCounselor>> getSchoolCounselors(@PathVariable Long schoolId) {
        return ResponseEntity.ok(schoolService.getSchoolCounselors(schoolId));
    }
} 