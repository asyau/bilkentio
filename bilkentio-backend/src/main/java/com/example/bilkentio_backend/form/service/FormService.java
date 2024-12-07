package com.example.bilkentio_backend.form.service;

import com.example.bilkentio_backend.day.entity.TimeSlot;
import com.example.bilkentio_backend.day.enums.SlotStatus;
import com.example.bilkentio_backend.day.repository.SlotRepository;
import com.example.bilkentio_backend.form.entity.Form;
import com.example.bilkentio_backend.form.enums.FormState;
import com.example.bilkentio_backend.form.repository.FormRepository;
import com.example.bilkentio_backend.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

import com.example.bilkentio_backend.common.EmailService;

@Service
public class FormService {
    @Autowired
    private FormRepository formRepository;

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Transactional
    public Form submitForm(Form form) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        
        form.setSubmittedBy(userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found")));

        TimeSlot slot = form.getLinkedSlot();
        slot.setStatus(SlotStatus.FORM_REQUESTED);
        slotRepository.save(slot);
        Form savedForm = formRepository.save(form);
        
        // Send email asynchronously
        sendFormSubmissionEmail(savedForm);
        
        return savedForm;
    }

    @Transactional
    public Form updateFormStatus(Long formId, FormState newState) {
        Form form = formRepository.findById(formId)
            .orElseThrow(() -> new RuntimeException("Form not found"));

        System.out.println("Updating form " + formId + " state from " + form.getState() + " to " + newState);
        form.setState(newState);
        TimeSlot slot = form.getLinkedSlot();

        if (newState == FormState.APPROVED) {
            slot.setStatus(SlotStatus.UNAVAILABLE);
        } else if (newState == FormState.DENIED) {
            if (slot.getLinkedForms().stream()
                    .noneMatch(f -> f.getState() == FormState.APPROVED)) {
                slot.setStatus(SlotStatus.AVAILABLE);
            }
        }

        slotRepository.save(slot);
        Form savedForm = formRepository.save(form);
        
        // Send status update email asynchronously
        sendFormStatusUpdateEmail(savedForm);
        
        return savedForm;
    }

    @Async
    protected void sendFormSubmissionEmail(Form form) {
        try {
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMMM d, yyyy");
            String date = form.getLinkedSlot().getDay().getDate().format(dateFormatter);
            String time = form.getLinkedSlot().getTime().toString();
            
            emailService.sendEmail(
                form.getGroupLeaderEmail(),
                "Bilkent IO - Form Submission Confirmation",
                emailService.createFormSubmissionEmailBody(
                    form.getSubmittedBy().getNameSurname(),
                    date,
                    time,
                    form.getGroupSize(),
                    form.getSchoolName(),
                    form.getContactPhone(),
                    form.getExpectations(),
                    form.getSpecialRequirements(),
                    form.getGroupLeaderRole(),
                    form.getGroupLeaderPhone(),
                    form.getGroupLeaderEmail(),
                    form.getVisitorNotes(),
                    form.getCity()
                )
            );
        } catch (Exception e) {
            System.err.println("Failed to send form submission email: " + e.getMessage());
        }
    }

    @Async
    protected void sendFormStatusUpdateEmail(Form form) {
        try {
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMMM d, yyyy");
            
            String date = form.getLinkedSlot().getDay().getDate().format(dateFormatter);
            String time = form.getLinkedSlot().getTime().toString();
            
            emailService.sendEmail(
                form.getGroupLeaderEmail(),
                "Bilkent IO - Form Status Update",
                emailService.createFormStatusUpdateEmailBody(
                    form.getSubmittedBy().getNameSurname(),
                    date,
                    time,
                    form.getState().toString()
                )
            );
        } catch (Exception e) {
            System.err.println("Failed to send form status update email: " + e.getMessage());
        }
    }

    public List<Form> getPendingForms() {
        return formRepository.findByState(FormState.PENDING);
    }

    public List<Form> getAllForms() {
        return formRepository.findAll();
    }

    public List<Form> getFormsBySubmitter(Long userId) {
        return formRepository.findBySubmittedBy_Id(userId);
    }

    public List<Form> getFormsByState(FormState state) {
        return formRepository.findByStateOrderByLinkedSlot_Day_DateAsc(state);
    }

    public List<Form> getMyForms() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return formRepository.findBySubmittedBy_Username(username);
    }

    public Optional<Form> getFormById(Long id) {
        return formRepository.findById(id);
    }
}