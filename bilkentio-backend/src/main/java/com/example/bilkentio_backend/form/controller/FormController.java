package com.example.bilkentio_backend.form.controller;

import com.example.bilkentio_backend.day.entity.TimeSlot;
import com.example.bilkentio_backend.form.entity.Form;
import com.example.bilkentio_backend.form.enums.FormState;
import com.example.bilkentio_backend.form.service.FormService;
import com.example.bilkentio_backend.user.entity.User;
import com.example.bilkentio_backend.guidanceCounselor.entity.GuidanceCounselor;
import com.example.bilkentio_backend.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import com.example.bilkentio_backend.form.dto.FormResponseDTO;
import com.example.bilkentio_backend.day.repository.SlotRepository;
import com.example.bilkentio_backend.form.dto.FormSubmissionDTO;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/forms")
public class FormController {
    @Autowired
    private FormService formService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SlotRepository slotRepository;

    @PostMapping
    public ResponseEntity<?> submitForm(@RequestBody FormSubmissionDTO submissionDTO) {
        try {
            // Get current user and validate
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Validate user is a GuidanceCounselor and get school
            if (!(user instanceof GuidanceCounselor)) {
                throw new RuntimeException("Only guidance counselors can submit forms");
            }
            GuidanceCounselor counselor = (GuidanceCounselor) user;

            // Get the time slot
            TimeSlot slot = slotRepository.findById(submissionDTO.getSlotId())
                    .orElseThrow(() -> new RuntimeException("Time slot not found"));

            // Create and populate the form
            Form form = new Form();
            form.setGroupSize(submissionDTO.getGroupSize());
            form.setContactPhone(submissionDTO.getContactPhone());
            form.setExpectations(submissionDTO.getExpectations());
            form.setSpecialRequirements(submissionDTO.getSpecialRequirements());
            form.setGroupLeaderRole(submissionDTO.getGroupLeaderRole());
            form.setGroupLeaderPhone(submissionDTO.getGroupLeaderPhone());
            form.setGroupLeaderEmail(submissionDTO.getGroupLeaderEmail());
            form.setVisitorNotes(submissionDTO.getVisitorNotes());
            form.setAgreeToTerms(submissionDTO.getAgreeToTerms());
            form.setLinkedSlot(slot);
            form.setSubmittedBy(user);
            form.setSchool(counselor.getSchool());

            Form savedForm = formService.submitForm(form);
            return ResponseEntity.ok(savedForm);
        } catch (IllegalStateException e) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(new FormResponseDTO(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new FormResponseDTO("Failed to submit form: " + e.getMessage()));
        }
    }

    @PutMapping("/{formId}/status")
    @PreAuthorize("hasAnyRole('ADVISOR', 'ADMIN', 'COORDINATOR', 'COORDİNATOR') or " +
            "(hasRole('ROLE_COUNSELOR') and @formService.isFormOwner(#formId, principal.username))")
    public ResponseEntity<?> updateFormStatus(
            @PathVariable Long formId,
            @RequestParam FormState newState) {
        // Only allow counselors to set status to DENIED
        if (SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_COUNSELOR"))
                && newState != FormState.DENIED) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Counselors can only deny their own forms");
        }
        Form updatedForm = formService.updateFormStatus(formId, newState);
        return ResponseEntity.ok(updatedForm);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADVISOR', 'ADMIN', 'COORDINATOR', 'COORDİNATOR')")
    public ResponseEntity<List<Form>> getPendingForms() {
        List<Form> forms = formService.getPendingForms();
        return ResponseEntity.ok(forms);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADVISOR', 'ADMIN', 'COORDINATOR', 'COORDİNATOR')")
    public ResponseEntity<List<Form>> getAllForms() {
        List<Form> forms = formService.getAllForms();
        return ResponseEntity.ok(forms);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('COUNSELOR', 'ADMIN', 'COORDINATOR', 'COORDİNATOR')")
    public ResponseEntity<List<Form>> getUserForms(@PathVariable Long userId) {
        List<Form> forms = formService.getFormsBySubmitter(userId);
        return ResponseEntity.ok(forms);
    }

    @GetMapping("/state/{state}")
    @PreAuthorize("hasAnyRole('ADVISOR', 'ADMIN', 'COORDINATOR', 'COORDİNATOR')")
    public ResponseEntity<List<Form>> getFormsByState(@PathVariable FormState state) {
        List<Form> forms = formService.getFormsByState(state);
        System.out.println("Found " + forms.size() + " forms with state: " + state);
        return ResponseEntity.ok(forms);
    }

    @GetMapping("/my-forms")
    @PreAuthorize("hasAnyRole('COUNSELOR', 'ADMIN', 'COORDINATOR', 'COORDİNATOR')")
    public ResponseEntity<List<Form>> getMyForms() {
        List<Form> forms = formService.getMyForms();
        return ResponseEntity.ok(forms);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADVISOR', 'ADMIN', 'COORDINATOR', 'COORDİNATOR', 'COUNSELOR')")
    public ResponseEntity<Form> getFormById(@PathVariable Long id) {
        return formService.getFormById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
