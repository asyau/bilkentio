package com.example.bilkentio_backend.advisor.service;

import com.example.bilkentio_backend.advisor.entity.Advisor;
import com.example.bilkentio_backend.advisor.repository.AdvisorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdvisorService {

    @Autowired
    private AdvisorRepository advisorRepository;

    public List<Advisor> getAllAdvisors() {
        return advisorRepository.findAll();
    }

    public Optional<Advisor> getAdvisorById(Long id) {
        return advisorRepository.findById(id);
    }

    public Optional<Advisor> getAdvisorByUsername(String username) {
        return advisorRepository.findByUsername(username);
    }

    public Advisor createAdvisor(Advisor advisor) {
        return advisorRepository.save(advisor);
    }

    public Optional<Advisor> updateAdvisor(Long id, Advisor advisorDetails) {
        return advisorRepository.findById(id)
                .map(advisor -> {
                    advisor.setResponsibleDay(advisorDetails.getResponsibleDay());
                    // Update other fields as needed
                    return advisorRepository.save(advisor);
                });
    }

    public boolean deleteAdvisor(Long id) {
        return advisorRepository.findById(id)
                .map(advisor -> {
                    advisorRepository.delete(advisor);
                    return true;
                }).orElse(false);
    }

    public Optional<Advisor> updateResponsibleDay(Long id, String day) {
        return advisorRepository.findById(id)
                .map(advisor -> {
                    advisor.setResponsibleDay(day);
                    return advisorRepository.save(advisor);
                });
    }

    public Optional<String> getResponsibleDay(Long id) {
        return advisorRepository.findById(id)
                .map(Advisor::getResponsibleDay);
    }
}
