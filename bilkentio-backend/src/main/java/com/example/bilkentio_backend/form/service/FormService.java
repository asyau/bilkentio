package com.example.bilkentio_backend.form.service;

import com.example.bilkentio_backend.day.entity.TimeSlot;
import com.example.bilkentio_backend.day.enums.SlotStatus;
import com.example.bilkentio_backend.day.repository.SlotRepository;
import com.example.bilkentio_backend.form.entity.Form;
import com.example.bilkentio_backend.form.enums.FormState;
import com.example.bilkentio_backend.form.repository.FormRepository;
import com.example.bilkentio_backend.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

import com.example.bilkentio_backend.common.EmailService;
import com.example.bilkentio_backend.common.event.EmailEvent;

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

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Transactional
    public Form submitForm(Form form) {
        TimeSlot slot = form.getLinkedSlot();
        if (slot == null) {
            throw new IllegalArgumentException("Form must have a linked time slot");
        }

        boolean formExists = formRepository.existsBySchool_IdAndLinkedSlot_Id(
                form.getSchool().getId(),
                slot.getId());

        if (formExists) {
            throw new IllegalStateException("A form from your school has already been submitted for this time slot");
        }

        slot.setStatus(SlotStatus.FORM_REQUESTED);
        slotRepository.save(slot);

        Form savedForm = formRepository.save(form);
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

        if (newState == FormState.DENIED) {
            // Check if there are other pending forms for this slot
            List<Form> otherPendingForms = formRepository.findByLinkedSlot_IdAndStateAndIdNot(
                    slot.getId(),
                    FormState.PENDING,
                    formId);

            // Only set to AVAILABLE if there are no other pending forms
            if (otherPendingForms.isEmpty()) {
                slot.setStatus(SlotStatus.AVAILABLE);
            }
            slotRepository.save(slot);
        } else if (newState == FormState.APPROVED) {
            slot.setStatus(SlotStatus.UNAVAILABLE);

            // Get all other pending forms for the same time slot
            List<Form> otherForms = formRepository.findByLinkedSlot_IdAndStateAndIdNot(
                    slot.getId(),
                    FormState.PENDING,
                    formId);

            // Automatically deny other forms
            for (Form otherForm : otherForms) {
                otherForm.setState(FormState.DENIED);
                formRepository.save(otherForm);
                sendFormStatusUpdateEmail(otherForm);
            }
        }
        slotRepository.save(slot);
        Form savedForm = formRepository.save(form);

        sendFormStatusUpdateEmail(savedForm);

        return savedForm;
    }

    private void sendFormSubmissionEmail(Form form) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMMM d, yyyy");
        String date = form.getLinkedSlot().getDay().getDate().format(dateFormatter);
        String time = form.getLinkedSlot().getTime().toString();

        String emailContent = emailService.createFormSubmissionEmailBody(
                form.getSubmittedBy().getNameSurname(),
                date,
                time,
                form.getGroupSize(),
                form.getSchool().getName(),
                form.getContactPhone(),
                form.getExpectations(),
                form.getSpecialRequirements(),
                form.getGroupLeaderRole(),
                form.getGroupLeaderPhone(),
                form.getGroupLeaderEmail(),
                form.getVisitorNotes(),
                form.getSchool().getCity());

        eventPublisher.publishEvent(new EmailEvent(
                form.getGroupLeaderEmail(),
                "Bilkent IO - Form Submission Confirmation",
                emailContent));
    }

    protected void sendFormStatusUpdateEmail(Form form) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMMM d, yyyy");
        String date = form.getLinkedSlot().getDay().getDate().format(dateFormatter);
        String time = form.getLinkedSlot().getTime().toString();

        String emailContent = emailService.createFormStatusUpdateEmailBody(
                form.getSubmittedBy().getNameSurname(),
                date,
                time,
                form.getState().toString());

        eventPublisher.publishEvent(new EmailEvent(
                form.getGroupLeaderEmail(),
                "Bilkent IO - Form Status Update",
                emailContent));
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

    public List<Form> getFormsBySchool(Long schoolId) {
        return formRepository.findBySchool_Id(schoolId);
    }

    public List<Form> getFormsBySchoolAndState(Long schoolId, FormState state) {
        return formRepository.findBySchool_IdAndState(schoolId, state);
    }

    public boolean isFormOwner(Long formId, String username) {
        try {
            Form form = formRepository.findById(formId)
                .orElse(null);
            if (form == null) {
                return false;
            }
            String formUsername = form.getSubmittedBy().getUsername();
            System.out.println("Comparing form username: " + formUsername + " with current username: " + username);
            return formUsername.equals(username);
        } catch (Exception e) {
            System.err.println("Error checking form ownership: " + e.getMessage());
            return false;
        }
    }
}