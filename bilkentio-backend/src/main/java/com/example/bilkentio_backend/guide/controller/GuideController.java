package com.example.bilkentio_backend.guide.controller;

import com.example.bilkentio_backend.guide.entity.Guide;
import com.example.bilkentio_backend.guide.service.GuideService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/guides")
public class GuideController {

    @Autowired
    private GuideService guideService;

    @GetMapping
    public List<Guide> getAllGuides() {
        return guideService.getAllGuides();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Guide> getGuideById(@PathVariable Long id) {
        return guideService.getGuideById(id)
                .map(guide -> ResponseEntity.ok().body(guide))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Guide createGuide(@RequestBody Guide guide) {
        return guideService.createGuide(guide);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Guide> updateGuide(@PathVariable Long id, @RequestBody Guide guideDetails) {
        return guideService.updateGuide(id, guideDetails)
                .map(updatedGuide -> ResponseEntity.ok(updatedGuide))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGuide(@PathVariable Long id) {
        return guideService.deleteGuide(id) 
                ? ResponseEntity.ok().build() 
                : ResponseEntity.notFound().build();
    }
} 