package com.example.bilkentio_backend.guide.service;

import com.example.bilkentio_backend.guide.entity.Guide;
import com.example.bilkentio_backend.guide.repository.GuideRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GuideService {

    @Autowired
    private GuideRepository guideRepository;

    public List<Guide> getAllGuides() {
        return guideRepository.findAll();
    }

    public Optional<Guide> getGuideById(Long id) {
        return guideRepository.findById(id);
    }

    public Guide createGuide(Guide guide) {
        return guideRepository.save(guide);
    }

    public Optional<Guide> updateGuide(Long id, Guide guideDetails) {
        return guideRepository.findById(id)
                .map(guide -> {
                    guide.setYearsOfExperience(guideDetails.getYearsOfExperience());
                    guide.setScore(guideDetails.getScore());
                    guide.setLevel(guideDetails.getLevel());
                    return guideRepository.save(guide);
                });
    }

    public boolean deleteGuide(Long id) {
        return guideRepository.findById(id)
                .map(guide -> {
                    guideRepository.delete(guide);
                    return true;
                }).orElse(false);
    }

    public void updateGuideScore(Long id, int increment) {
        guideRepository.findById(id).ifPresent(guide -> {
            guide.increaseScore(increment);
            guideRepository.save(guide);
        });
    }

    public void updateGuideLevel(Long id, String newLevel) {
        guideRepository.findById(id).ifPresent(guide -> {
            guide.setLevel(newLevel);
            guideRepository.save(guide);
        });
    }
} 