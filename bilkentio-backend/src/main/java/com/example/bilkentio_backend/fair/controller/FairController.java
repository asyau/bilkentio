package com.example.bilkentio_backend.fair.controller;

import com.example.bilkentio_backend.fair.dto.FairInviteRequest;
import com.example.bilkentio_backend.fair.dto.FairRequestDTO;
import com.example.bilkentio_backend.fair.dto.FairResponseDTO;
import com.example.bilkentio_backend.fair.entity.Fair;
import com.example.bilkentio_backend.fair.enums.FairStatus;
import com.example.bilkentio_backend.fair.service.FairService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/fairs")
@CrossOrigin(origins = "*")
public class FairController {

    @Autowired
    private FairService fairService;

    @PostMapping("/invite")
    @PreAuthorize("hasAnyRole('ADMIN', 'COUNSELOR')")
    public ResponseEntity<FairResponseDTO> createInvitation(@Valid @RequestBody FairInviteRequest request) {
        Fair fair = fairService.createInvitation(request);
        return ResponseEntity.ok(FairResponseDTO.fromEntity(fair));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PRESIDENT', 'COORDINATOR')")
    public ResponseEntity<List<FairResponseDTO>> getAllFairs(
            @RequestParam(required = false) FairStatus status,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Double minRank,
            @RequestParam(required = false) Double maxRank) {

        List<Fair> fairs;
        if (status != null) {
            fairs = fairService.getFairsByStatus(status);
        } else if (minRank != null && maxRank != null) {
            fairs = fairService.getFairsBySchoolRankRange(minRank, maxRank);
        } else {
            fairs = fairService.getAllFairs();
        }

        return ResponseEntity.ok(
                fairs.stream()
                        .map(FairResponseDTO::fromEntity)
                        .collect(Collectors.toList()));
    }

    @PutMapping("/{fairId}/assign-guide/{guideId}")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<FairResponseDTO> assignGuide(
            @PathVariable Long fairId,
            @PathVariable Long guideId) {
        Fair fair = fairService.assignGuide(fairId, guideId);
        return ResponseEntity.ok(FairResponseDTO.fromEntity(fair));
    }

    @PutMapping("/{fairId}/guide-response")
    @PreAuthorize("hasRole('GUIDE')")
    public ResponseEntity<FairResponseDTO> handleGuideResponse(
            @PathVariable Long fairId,
            @RequestParam Long guideId,
            @RequestParam boolean accepted) {
        Fair fair = fairService.handleGuideResponse(fairId, guideId, accepted);
        return ResponseEntity.ok(FairResponseDTO.fromEntity(fair));
    }

    @GetMapping("/guide/{guideId}")
    @PreAuthorize("hasRole('GUIDE')")
    public ResponseEntity<List<FairResponseDTO>> getFairsByGuide(@PathVariable Long guideId) {
        List<Fair> fairs = fairService.getFairsByGuide(guideId);
        return ResponseEntity.ok(
                fairs.stream()
                        .map(FairResponseDTO::fromEntity)
                        .collect(Collectors.toList()));
    }

    @PutMapping("/{fairId}/status")
    public ResponseEntity<FairResponseDTO> updateStatus(
            @PathVariable Long fairId,
            @RequestBody Map<String, String> request) {
        try {
            FairStatus status = FairStatus.valueOf(request.get("status"));
            String reason = request.get("reason");
            Fair fair = fairService.updateFairStatus(fairId, status, reason);
            return ResponseEntity.ok(FairResponseDTO.fromEntity(fair));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status value");
        }
    }

    @PostMapping("/request")
    @PreAuthorize("hasRole('COUNSELOR')")
    public ResponseEntity<FairResponseDTO> requestFair(@Valid @RequestBody FairRequestDTO request) {
        Fair fair = fairService.createFairRequest(request);
        return ResponseEntity.ok(FairResponseDTO.fromEntity(fair));
    }
}