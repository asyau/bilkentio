package com.example.bilkentio_backend.tour.service;

import com.example.bilkentio_backend.guide.entity.Guide;
import com.example.bilkentio_backend.guide.repository.GuideRepository;
import com.example.bilkentio_backend.tour.entity.IndividualTour;
import com.example.bilkentio_backend.tour.enums.TourStatus;
import com.example.bilkentio_backend.tour.repository.IndividualTourRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.example.bilkentio_backend.tour.dto.IndividualTourRequest;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@Service
public class IndividualTourService {

    @Autowired
    private IndividualTourRepository individualTourRepository;

    @Autowired
    private GuideRepository guideRepository;

    public List<IndividualTour> getAllIndividualTours() {
        return individualTourRepository.findAll();
    }

    public IndividualTour createIndividualTour(IndividualTourRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        
        IndividualTour tour = new IndividualTour();
        tour.setUsername(username);
        tour.setDate(request.getDate());
        tour.setTime(request.getTime());
        tour.setInterests(request.getInterests());
        tour.setContactNumber(request.getContactNumber());
        tour.setEmail(request.getEmail());
        tour.setSpecialRequirements(request.getSpecialRequirements());
        tour.setVisitorNotes(request.getVisitorNotes());
        tour.setCity(request.getCity());
        tour.setStatus(TourStatus.GUIDES_PENDING);
        
        return individualTourRepository.save(tour);
    }

    public List<IndividualTour> getPendingTours() {
        return individualTourRepository.findByStatus(TourStatus.GUIDES_PENDING);
    }

    public IndividualTour joinTour(Long tourId, Long guideId) {
        Optional<IndividualTour> tourOpt = individualTourRepository.findById(tourId);
        Optional<Guide> guideOpt = guideRepository.findById(guideId);

        if (tourOpt.isPresent() && guideOpt.isPresent()) {
            IndividualTour tour = tourOpt.get();
            Guide guide = guideOpt.get();

            if (tour.getStatus() != TourStatus.GUIDES_PENDING) {
                throw new IllegalStateException("Tour is not in GUIDES_PENDING state");
            }

            if (tour.getAssignedGuides().size() >= 1) {
                throw new IllegalStateException("Tour already has a guide assigned");
            }

            tour.getAssignedGuides().add(guide);
            tour.setStatus(TourStatus.WAITING_TO_FINISH);
            guide.addIndividualTour(tour);

            guideRepository.save(guide);
            return individualTourRepository.save(tour);
        }
        throw new IllegalArgumentException("Tour or Guide not found");
    }

    public IndividualTour completeTour(Long tourId) {
        Optional<IndividualTour> tourOpt = individualTourRepository.findById(tourId);
        if (tourOpt.isPresent()) {
            IndividualTour tour = tourOpt.get();
            tour.setStatus(TourStatus.FINISHED);
            return individualTourRepository.save(tour);
        }
        throw new IllegalArgumentException("Tour not found");
    }

    public IndividualTour cancelTour(Long tourId, String reason) {
        Optional<IndividualTour> tourOpt = individualTourRepository.findById(tourId);
        if (tourOpt.isPresent()) {
            IndividualTour tour = tourOpt.get();
            tour.setStatus(TourStatus.CANCELLED);
            tour.setCancellationReason(reason);
            return individualTourRepository.save(tour);
        }
        throw new IllegalArgumentException("Tour not found");
    }

    public IndividualTour provideFeedback(Long tourId, String feedback, Integer rating) {
        Optional<IndividualTour> tourOpt = individualTourRepository.findById(tourId);
        if (tourOpt.isPresent()) {
            IndividualTour tour = tourOpt.get();
            tour.setFeedback(feedback);
            tour.setRating(rating);
            tour.setStatus(TourStatus.GIVEN_FEEDBACK);
            return individualTourRepository.save(tour);
        }
        throw new IllegalArgumentException("Tour not found");
    }

    public List<IndividualTour> getToursForCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return individualTourRepository.findByUsername(username);
    }

    public List<IndividualTour> getToursForGuide(Long guideId) {
        Optional<Guide> guide = guideRepository.findById(guideId);
        if (guide.isPresent()) {
            return new ArrayList<>(guide.get().getIndividualTours());
        }
        throw new IllegalArgumentException("Guide not found");
    }
} 