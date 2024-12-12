package com.example.bilkentio_backend.form.controller;

import com.example.bilkentio_backend.day.entity.TimeSlot;
import com.example.bilkentio_backend.form.dto.FormDTO;
import com.example.bilkentio_backend.form.entity.Form;
import com.example.bilkentio_backend.form.enums.FormState;
import com.example.bilkentio_backend.form.service.FormService;
import com.example.bilkentio_backend.user.entity.User;
import com.example.bilkentio_backend.guidanceCounselor.entity.GuidanceCounselor;
import com.example.bilkentio_backend.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
    public ResponseEntity<FormResponseDTO> submitForm(@RequestBody FormSubmissionDTO submissionDTO) {
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
        return ResponseEntity.ok(FormResponseDTO.fromEntity(savedForm));
    }

    @PutMapping("/{formId}/status")
    @PreAuthorize("hasAnyRole('ADVISOR', 'ADMIN')")
    public ResponseEntity<FormResponseDTO> updateFormStatus(
            @PathVariable Long formId,
            @RequestParam FormState newState) {
        Form updatedForm = formService.updateFormStatus(formId, newState);
        FormResponseDTO response = FormResponseDTO.fromEntity(updatedForm);
        System.out.println("Updated form state: " + response.getState());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADVISOR', 'ADMIN')")
    public ResponseEntity<List<FormResponseDTO>> getPendingForms() {
        List<Form> forms = formService.getPendingForms();
        List<FormResponseDTO> dtos = forms.stream()
                .map(FormResponseDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADVISOR', 'ADMIN')")
    public ResponseEntity<List<FormResponseDTO>> getAllForms() {
        List<Form> forms = formService.getAllForms();
        List<FormResponseDTO> dtos = forms.stream()
                .map(FormResponseDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('COUNSELOR', 'ADMIN')")
    public ResponseEntity<List<FormResponseDTO>> getUserForms(@PathVariable Long userId) {
        List<Form> forms = formService.getFormsBySubmitter(userId);
        List<FormResponseDTO> dtos = forms.stream()
                .map(FormResponseDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/state/{state}")
    @PreAuthorize("hasAnyRole('ADVISOR', 'ADMIN')")
    public ResponseEntity<List<FormResponseDTO>> getFormsByState(@PathVariable FormState state) {
        List<Form> forms = formService.getFormsByState(state);
        List<FormResponseDTO> dtos = forms.stream()
                .map(FormResponseDTO::fromEntity)
                .collect(Collectors.toList());
        System.out.println("Found " + forms.size() + " forms with state: " + state);
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/my-forms")
    @PreAuthorize("hasAnyRole('COUNSELOR', 'ADMIN')")
    public ResponseEntity<List<FormResponseDTO>> getMyForms() {
        List<Form> forms = formService.getMyForms();
        List<FormResponseDTO> dtos = forms.stream()
                .map(FormResponseDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADVISOR', 'ADMIN', 'COUNSELOR')")
    public ResponseEntity<Form> getFormById(@PathVariable Long id) {
        return formService.getFormById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
