package com.example.bilkentio_backend.fair.service;

import com.example.bilkentio_backend.fair.entity.Fair;
import com.example.bilkentio_backend.fair.repository.FairRepository;
import com.example.bilkentio_backend.fair.dto.FairInviteRequest;
import com.example.bilkentio_backend.school.service.SchoolService;
import com.example.bilkentio_backend.school.entity.School;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class FairService {

    @Autowired
    private FairRepository fairRepository;

    @Autowired
    private SchoolService schoolService;

    @Transactional
    public Fair createInvitation(FairInviteRequest request) {
        Fair fair = new Fair();
        fair.setSchoolName(request.getSchoolName());
        fair.setCity(request.getCity());
        fair.setDate(request.getFairDate());
        fair.setContactPerson(request.getContactPerson());
        fair.setContactEmail(request.getContactEmail());
        fair.setContactPhone(request.getContactPhone());
        fair.setNotes(request.getNotes());
        fair.setExpectedStudents(request.getExpectedStudents());
        fair.setStatus("PENDING");
        fair.setSubmissionDate(LocalDate.now());

        // Get school rank from processed_schools.csv data
        Optional<School> school = schoolService.findByName(request.getSchoolName());
        school.ifPresent(s -> fair.setSchoolRank(Double.valueOf(s.getPriorityRank())));

        return fairRepository.save(fair);
    }

    public List<Fair> getAllFairs() {
        return fairRepository.findAll();
    }

    public List<Fair> getFairsByStatus(String status) {
        return fairRepository.findByStatus(status);
    }

    @Transactional
    public Fair assignGuide(Long fairId, Long guideId) {
        Fair fair = fairRepository.findById(fairId)
                .orElseThrow(() -> new RuntimeException("Fair not found"));

        if (!"PENDING".equals(fair.getStatus())) {
            throw new RuntimeException("Can only assign guides to pending fairs");
        }

        fair.setAssignedGuideId(guideId);
        fair.setStatus("ASSIGNED");
        return fairRepository.save(fair);
    }

    @Transactional
    public Fair updateFairStatus(Long fairId, String newStatus) {
        Fair fair = fairRepository.findById(fairId)
                .orElseThrow(() -> new RuntimeException("Fair not found"));

        fair.setStatus(newStatus);
        return fairRepository.save(fair);
    }

    public List<Fair> getFairsBySchoolRankRange(Double minRank, Double maxRank) {
        return fairRepository.findBySchoolRankBetween(minRank, maxRank);
    }
}