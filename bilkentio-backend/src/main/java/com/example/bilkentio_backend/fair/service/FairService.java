package com.example.bilkentio_backend.fair.service;

import com.example.bilkentio_backend.fair.entity.Fair;
import com.example.bilkentio_backend.fair.enums.FairStatus;
import com.example.bilkentio_backend.fair.repository.FairRepository;
import com.example.bilkentio_backend.common.EmailService;
import com.example.bilkentio_backend.fair.dto.FairInviteRequest;
import com.example.bilkentio_backend.school.service.SchoolService;
import com.example.bilkentio_backend.school.entity.School;
import com.example.bilkentio_backend.user.UserService;
import com.example.bilkentio_backend.user.entity.User;
import com.example.bilkentio_backend.fair.dto.FairRequestDTO;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FairService {

    @Autowired
    private FairRepository fairRepository;

    @Autowired
    private SchoolService schoolService;

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

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
        fair.setStatus(FairStatus.PENDING); // Changed from String to enum
        fair.setSubmissionDate(LocalDate.now());

        // Get school rank from processed_schools.csv data
        Optional<School> school = schoolService.findByName(request.getSchoolName());
        school.ifPresent(s -> fair.setSchoolRank(Double.valueOf(s.getPriorityRank())));

        return fairRepository.save(fair);
    }

    public List<Fair> getAllFairs() {
        return fairRepository.findAll();
    }

    public List<Fair> getFairsByStatus(FairStatus status) { // Changed from String to enum
        return fairRepository.findByStatus(status);
    }

    @Transactional
    public Fair assignGuide(Long fairId, Long guideId) {
        Fair fair = fairRepository.findById(fairId)
                .orElseThrow(() -> new EntityNotFoundException("Fair not found"));

        if (fair.getStatus() != FairStatus.PENDING) { // Changed from String comparison to enum
            throw new IllegalStateException("Can only assign guides to pending fairs");
        }

        User guide = userService.findById(guideId)
                .orElseThrow(() -> new EntityNotFoundException("Guide not found"));

        fair.setAssignedGuide(guide);
        fair.setStatus(FairStatus.GUIDE_ASSIGNED); // Changed from String to enum
        fair.setGuideAssignedAt(LocalDateTime.now());

        Fair savedFair = fairRepository.save(fair);

        // Send email notification to guide
        String subject = "New Fair Assignment";
        String body = String.format(
                """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    line-height: 1.6;
                                    margin: 0;
                                    padding: 0;
                                    background-color: #f4f4f4;
                                }
                                .container {
                                    max-width: 600px;
                                    margin: 20px auto;
                                    padding: 20px;
                                    background-color: #ffffff;
                                    border-radius: 8px;
                                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                                }
                                .header {
                                    background-color: #003366;
                                    color: white;
                                    padding: 20px;
                                    text-align: center;
                                    border-radius: 8px 8px 0 0;
                                    background-image: url('https://w3.bilkent.edu.tr/bilkent/wp-content/uploads/sites/2/2018/05/bilkent-universitesi-kampus-1.jpg');
                                    background-size: cover;
                                    background-position: center;
                                    position: relative;
                                }
                                .header::before {
                                    content: '';
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    right: 0;
                                    bottom: 0;
                                    background: rgba(0, 51, 102, 0.85);
                                    border-radius: 8px 8px 0 0;
                                }
                                .header h1 {
                                    position: relative;
                                    z-index: 1;
                                    margin: 0;
                                    font-size: 24px;
                                }
                                .content {
                                    padding: 20px;
                                }
                                .fair-details {
                                    background-color: #f8f9fa;
                                    padding: 15px;
                                    border-radius: 4px;
                                    margin: 15px 0;
                                }
                                .fair-details p {
                                    margin: 8px 0;
                                }
                                .contact-info {
                                    background-color: #e9ecef;
                                    padding: 15px;
                                    border-radius: 4px;
                                    margin: 15px 0;
                                }
                                .notes {
                                    background-color: #fff3cd;
                                    padding: 15px;
                                    border-radius: 4px;
                                    margin: 15px 0;
                                }
                                .footer {
                                    text-align: center;
                                    padding: 20px;
                                    color: #666;
                                    font-size: 14px;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>New Fair Assignment</h1>
                                </div>
                                <div class="content">
                                    <p>Dear <strong>%s</strong>,</p>
                                    <p>You have been assigned to a new fair. Please find the details below:</p>

                                    <div class="fair-details">
                                        <h3 style="margin-top: 0;">Fair Details</h3>
                                        <p><strong>School:</strong> %s</p>
                                        <p><strong>City:</strong> %s</p>
                                        <p><strong>Date:</strong> %s</p>
                                        <p><strong>Expected Students:</strong> %d</p>
                                    </div>

                                    <div class="contact-info">
                                        <h3 style="margin-top: 0;">Contact Information</h3>
                                        <p><strong>Contact Person:</strong> %s</p>
                                        <p><strong>Email:</strong> %s</p>
                                        <p><strong>Phone:</strong> %s</p>
                                    </div>

                                    <div class="notes">
                                        <h3 style="margin-top: 0;">Additional Notes</h3>
                                        <p>%s</p>
                                    </div>
                                </div>
                                <div class="footer">
                                    <p>Best regards,<br>Bilkent IO Team</p>
                                    <p style="font-size: 12px; color: #999;">This is an automated message, please do not reply.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                        """,
                guide.getNameSurname(),
                fair.getSchoolName(),
                fair.getCity(),
                fair.getDate(),
                fair.getExpectedStudents(),
                fair.getContactPerson(),
                fair.getContactEmail(),
                fair.getContactPhone(),
                fair.getNotes() != null ? fair.getNotes() : "No additional notes");

        emailService.sendEmail(guide.getEmail(), subject, body);

        return savedFair;
    }

    @Transactional
    public Fair handleGuideResponse(Long fairId, Long guideId, boolean accepted) {
        Fair fair = fairRepository.findById(fairId)
                .orElseThrow(() -> new EntityNotFoundException("Fair not found"));

        if (fair.getStatus() != FairStatus.GUIDE_ASSIGNED) {
            throw new IllegalStateException("Fair is not in GUIDE_ASSIGNED state");
        }

        if (!fair.getAssignedGuide().getId().equals(guideId)) {
            throw new IllegalStateException("Guide is not assigned to this fair");
        }

        fair.setGuideAccepted(accepted);
        fair.setGuideResponseAt(LocalDateTime.now());
        fair.setStatus(accepted ? FairStatus.GUIDE_ACCEPTED : FairStatus.GUIDE_REJECTED);

        return fairRepository.save(fair);
    }

    @Transactional
    public Fair updateFairStatus(Long fairId, FairStatus newStatus, String reason) {
        Fair fair = fairRepository.findById(fairId)
                .orElseThrow(() -> new EntityNotFoundException("Fair not found"));

        fair.setStatus(newStatus);
        if (newStatus == FairStatus.CANCELLED) {
            fair.setRejectionReason(reason);
        }
        return fairRepository.save(fair);
    }

    public List<Fair> getFairsBySchoolRankRange(Double minRank, Double maxRank) {
        return fairRepository.findBySchoolRankBetween(minRank, maxRank);
    }

    public List<Fair> getFairsByGuide(Long guideId) {
        User guide = userService.findById(guideId)
                .orElseThrow(() -> new EntityNotFoundException("Guide not found"));
        return fairRepository.findByAssignedGuide(guide);
    }

    private void sendGuideAssignmentEmail(User guide, Fair fair) {
        String subject = "New Fair Assignment";
        String body = String.format(
                """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    line-height: 1.6;
                                    margin: 0;
                                    padding: 0;
                                    background-color: #f4f4f4;
                                }
                                .container {
                                    max-width: 600px;
                                    margin: 20px auto;
                                    padding: 20px;
                                    background-color: #ffffff;
                                    border-radius: 8px;
                                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                                }
                                .header {
                                    background-color: #003366;
                                    color: white;
                                    padding: 20px;
                                    text-align: center;
                                    border-radius: 8px 8px 0 0;
                                    background-image: url('https://w3.bilkent.edu.tr/bilkent/wp-content/uploads/sites/2/2018/05/bilkent-universitesi-kampus-1.jpg');
                                    background-size: cover;
                                    background-position: center;
                                    position: relative;
                                }
                                .header::before {
                                    content: '';
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    right: 0;
                                    bottom: 0;
                                    background: rgba(0, 51, 102, 0.85);
                                    border-radius: 8px 8px 0 0;
                                }
                                .header h1 {
                                    position: relative;
                                    z-index: 1;
                                    margin: 0;
                                    font-size: 24px;
                                }
                                .content {
                                    padding: 20px;
                                }
                                .fair-details {
                                    background-color: #f8f9fa;
                                    padding: 15px;
                                    border-radius: 4px;
                                    margin: 15px 0;
                                }
                                .fair-details p {
                                    margin: 8px 0;
                                }
                                .contact-info {
                                    background-color: #e9ecef;
                                    padding: 15px;
                                    border-radius: 4px;
                                    margin: 15px 0;
                                }
                                .notes {
                                    background-color: #fff3cd;
                                    padding: 15px;
                                    border-radius: 4px;
                                    margin: 15px 0;
                                }
                                .footer {
                                    text-align: center;
                                    padding: 20px;
                                    color: #666;
                                    font-size: 14px;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>New Fair Assignment</h1>
                                </div>
                                <div class="content">
                                    <p>Dear <strong>%s</strong>,</p>
                                    <p>You have been assigned to the following fair. Please log in to the system to accept or reject this assignment.</p>

                                    <div class="fair-details">
                                        <h3 style="margin-top: 0;">Fair Details</h3>
                                        <p><strong>School:</strong> %s</p>
                                        <p><strong>Date:</strong> %s</p>
                                        <p><strong>City:</strong> %s</p>
                                        <p><strong>Expected Students:</strong> %d</p>
                                    </div>

                                    <div class="contact-info">
                                        <h3 style="margin-top: 0;">Contact Information</h3>
                                        <p><strong>Contact Person:</strong> %s</p>
                                        <p><strong>Email:</strong> %s</p>
                                        <p><strong>Phone:</strong> %s</p>
                                    </div>

                                    <div class="notes">
                                        <h3 style="margin-top: 0;">Additional Notes</h3>
                                        <p>%s</p>
                                    </div>
                                </div>
                                <div class="footer">
                                    <p>Best regards,<br>Bilkent University</p>
                                    <p style="font-size: 12px; color: #999;">This is an automated message, please do not reply.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                        """,
                guide.getNameSurname(),
                fair.getSchoolName(),
                fair.getDate(),
                fair.getCity(),
                fair.getExpectedStudents(),
                fair.getContactPerson(),
                fair.getContactEmail(),
                fair.getContactPhone(),
                fair.getNotes() != null ? fair.getNotes() : "No additional notes");

        emailService.sendEmail(guide.getEmail(), subject, body);
    }

    @Transactional
    public Fair createFairRequest(FairRequestDTO request) {
        User counselor = userService.findById(request.getCounselorId())
                .orElseThrow(() -> new EntityNotFoundException("Counselor not found"));

        Fair fair = new Fair();
        fair.setSchoolName(request.getSchoolName());
        fair.setCity(request.getCity());
        fair.setDate(request.getFairDate());
        fair.setContactPerson(request.getContactPerson());
        fair.setContactEmail(request.getContactEmail());
        fair.setContactPhone(request.getContactPhone());
        fair.setExpectedStudents(request.getExpectedStudents());
        fair.setNotes(request.getNotes());
        fair.setStatus(FairStatus.PENDING);
        fair.setSubmissionDate(LocalDate.now());
        fair.setRequestedBy(counselor);

        // Get school rank if available
        Optional<School> school = schoolService.findByName(request.getSchoolName());
        school.ifPresent(s -> fair.setSchoolRank(Double.valueOf(s.getPriorityRank())));

        return fairRepository.save(fair);
    }
}
