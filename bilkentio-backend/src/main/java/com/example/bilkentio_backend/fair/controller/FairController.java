package com.example.bilkentio_backend.fair.controller;

import com.example.bilkentio_backend.fair.dto.FairInviteRequest;
import com.example.bilkentio_backend.fair.dto.FairResponseDTO;
import com.example.bilkentio_backend.fair.entity.Fair;
import com.example.bilkentio_backend.fair.service.FairService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
    @PreAuthorize("hasAnyRole('ADMIN', 'PRESIDENT')")
    public ResponseEntity<List<FairResponseDTO>> getAllFairs(
            @RequestParam(required = false) String status,
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

    @PutMapping("/{fairId}/assign/{guideId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FairResponseDTO> assignGuide(
            @PathVariable Long fairId,
            @PathVariable Long guideId) {
        Fair fair = fairService.assignGuide(fairId, guideId);
        return ResponseEntity.ok(FairResponseDTO.fromEntity(fair));
    }

    @PutMapping("/{fairId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FairResponseDTO> updateStatus(
            @PathVariable Long fairId,
            @RequestParam String status) {
        Fair fair = fairService.updateFairStatus(fairId, status);
        return ResponseEntity.ok(FairResponseDTO.fromEntity(fair));
    }
}