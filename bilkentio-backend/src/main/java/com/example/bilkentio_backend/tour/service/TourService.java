package com.example.bilkentio_backend.tour.service;

import com.example.bilkentio_backend.form.entity.Form;
import com.example.bilkentio_backend.form.enums.FormState;
import com.example.bilkentio_backend.form.repository.FormRepository;
import com.example.bilkentio_backend.guide.entity.Guide;
import com.example.bilkentio_backend.guide.repository.GuideRepository;
import com.example.bilkentio_backend.tour.entity.Tour;
import com.example.bilkentio_backend.tour.enums.TourStatus;
import com.example.bilkentio_backend.tour.repository.TourRepository;
import com.example.bilkentio_backend.user.entity.User;
import com.example.bilkentio_backend.guidanceCounselor.entity.GuidanceCounselor;
import com.example.bilkentio_backend.common.EmailService;
import com.example.bilkentio_backend.common.event.EmailEvent;

import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class TourService {

    private static final Logger logger = LoggerFactory.getLogger(TourService.class);

    @Autowired
    private TourRepository tourRepository;

    @Autowired
    private GuideRepository guideRepository;

    @Autowired
    private FormRepository formRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Transactional
    public Tour createTourFromForm(Long formId, int requiredGuides) {
        Form form = formRepository.findById(formId)
                .orElseThrow(() -> new EntityNotFoundException("Form not found with id: " + formId));

        User user = form.getSubmittedBy();
        if (user == null) {
            throw new IllegalStateException("Form does not have an assigned user");
        }

        if (!(user instanceof GuidanceCounselor)) {
            throw new IllegalStateException("Form submitter is not a guidance counselor");
        }

        GuidanceCounselor counselor = (GuidanceCounselor) user;

        Tour tour = new Tour();
        tour.setForm(form);
        tour.setCounselor(counselor);
        tour.setDate(form.getLinkedSlot().getDay().getDate());
        tour.setTime(form.getLinkedSlot().getTime());
        tour.setGroupSize(form.getGroupSize());
        tour.setRequiredGuides(requiredGuides);
        tour.setSchool(form.getSchool());
        tour.setExpectations(form.getExpectations());
        tour.setSpecialRequirements(form.getSpecialRequirements());
        tour.setVisitorNotes(form.getVisitorNotes());

        return tourRepository.save(tour);
    }

    public List<Tour> getToursBySchool(Long schoolId) {
        return tourRepository.findBySchool_Id(schoolId);
    }

    public List<Tour> getToursBySchoolAndStatus(Long schoolId, TourStatus status) {
        return tourRepository.findBySchool_IdAndStatus(schoolId, status);
    }

    public List<Tour> getToursByStatus(TourStatus status) {
        return tourRepository.findByStatus(status);
    }

    public Optional<Tour> getTourById(Long id) {
        return tourRepository.findById(id);
    }

    @Transactional
    public Tour assignGuide(Long tourId, Long guideId) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new EntityNotFoundException("Tour not found"));

        Guide guide = guideRepository.findById(guideId)
                .orElseThrow(() -> new EntityNotFoundException("Guide not found"));

        tour.getAssignedGuides().add(guide);

        if (tour.getAssignedGuides().size() >= tour.getRequiredGuides()) {
            tour.setStatus(TourStatus.WAITING_TO_FINISH);
        }

        return tourRepository.save(tour);
    }

    @Transactional
    public Tour updateTourStatus(Long tourId, TourStatus newStatus) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new EntityNotFoundException("Tour not found"));

        TourStatus oldStatus = tour.getStatus();
        tour.setStatus(newStatus);
        
        notifyStatusChange(tour, oldStatus, newStatus);
        
        return tourRepository.save(tour);
    }

    private void notifyStatusChange(Tour tour, TourStatus oldStatus, TourStatus newStatus) {
        String subject = "Tour Status Update";
        
        if (tour.getCounselor() != null && tour.getCounselor().getEmail() != null) {
            String message = String.format(
                "Your tour for %s on %s has been updated from %s to %s.",
                tour.getSchoolName(),
                tour.getDate(),
                oldStatus,
                newStatus
            );
            eventPublisher.publishEvent(new EmailEvent(
                tour.getCounselor().getEmail(),
                subject,
                message
            ));
        }

        for (Guide guide : tour.getAssignedGuides()) {
            if (guide.getEmail() != null) {
                String message = String.format(
                    "The tour for %s on %s has been updated from %s to %s.",
                    tour.getSchoolName(),
                    tour.getDate(),
                    oldStatus,
                    newStatus
                );
                eventPublisher.publishEvent(new EmailEvent(
                    guide.getEmail(),
                    subject,
                    message
                ));
            }
        }
    }

    @Transactional
    public Tour addFeedback(Long tourId, String feedback, Integer rating) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new EntityNotFoundException("Tour not found"));

        if (tour.getCounselor() == null) {
            throw new IllegalStateException("Cannot add counselor feedback to non-group tour");
        }

        tour.setFeedback(feedback);
        tour.setRating(rating);
        tour.setStatus(TourStatus.GIVEN_FEEDBACK);

        return tourRepository.save(tour);
    }

    public List<Tour> getToursByGuide(Long guideId) {
        return tourRepository.findByAssignedGuides_Id(guideId);
    }

    public List<Tour> getToursByCounselor(Long counselorId) {
        logger.info("Fetching tours for counselor: {}", counselorId);

        List<Tour> tours = tourRepository.findByCounselor_Id(counselorId);

        // Add logging
        logger.info("Found {} tours for counselor {}", tours.size(), counselorId);

        return tours;
    }

    @Transactional
    public Tour cancelTour(Long tourId, String cancellationReason) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new EntityNotFoundException("Tour not found"));

        if (tour.getStatus() == TourStatus.WAITING_TO_FINISH ||
                tour.getStatus() == TourStatus.FINISHED ||
                tour.getStatus() == TourStatus.GIVEN_FEEDBACK) {
            throw new IllegalStateException("Cannot cancel a tour that has already started or finished");
        }

        TourStatus oldStatus = tour.getStatus();
        tour.setStatus(TourStatus.CANCELLED);
        tour.setCancellationReason(cancellationReason);

        notifyCancellation(tour, oldStatus, cancellationReason);

        Form form = tour.getForm();
        form.setState(FormState.DENIED);
        formRepository.save(form);

        tour.getAssignedGuides().clear();

        return tourRepository.save(tour);
    }

    private void notifyCancellation(Tour tour, TourStatus oldStatus, String reason) {
        String subject = "Tour Cancelled";
        
        if (tour.getCounselor() != null && tour.getCounselor().getEmail() != null) {
            String message = String.format(
                "Your tour for %s on %s has been cancelled.\nReason: %s",
                tour.getSchoolName(),
                tour.getDate(),
                reason
            );
            eventPublisher.publishEvent(new EmailEvent(
                tour.getCounselor().getEmail(),
                subject,
                message
            ));
        }

        for (Guide guide : tour.getAssignedGuides()) {
            if (guide.getEmail() != null) {
                String message = String.format(
                    "The tour for %s on %s has been cancelled.\nReason: %s",
                    tour.getSchoolName(),
                    tour.getDate(),
                    reason
                );
                eventPublisher.publishEvent(new EmailEvent(
                    guide.getEmail(),
                    subject,
                    message
                ));
            }
        }
    }

}