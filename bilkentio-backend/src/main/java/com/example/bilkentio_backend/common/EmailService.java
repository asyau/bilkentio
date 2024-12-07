package com.example.bilkentio_backend.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.sender.email}")
    private String senderEmail;

    public void sendEmail(String to, String subject, String text) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom(senderEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(createEmailTemplate(text), true);
            
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    public String createCredentialsEmailBody(String name, String username, String password, String role) {
        return String.format("""
            <h2 style="color: #041E42; margin-bottom: 20px;">Welcome to Bilkent IO</h2>
            
            <p style="color: #333333; font-size: 16px; line-height: 1.5;">Dear %s,</p>
            
            <p style="color: #333333; font-size: 16px; line-height: 1.5;">Your account has been created in the Bilkent IO system. Below are your credentials:</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Username:</strong> %s</p>
                <p style="margin: 5px 0;"><strong>Password:</strong> %s</p>
                <p style="margin: 5px 0;"><strong>Role:</strong> %s</p>
            </div>
            
            <p style="color: #333333; font-size: 16px; line-height: 1.5;">
                For security reasons, please change your password after your first login.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee;">
                <p style="color: #666666; font-size: 14px;">Best regards,</p>
                <p style="color: #666666; font-size: 14px;">Bilkent IO Team</p>
            </div>
            """, name, username, password, role);
    }

    private String createEmailTemplate(String content) {
        return String.format("""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #041E42; padding: 20px; text-align: center;">
                    <img src="https://w3.bilkent.edu.tr/logo/ing-amblem.png" 
                         alt="Bilkent Logo" 
                         style="max-width: 200px; height: auto;">
                </div>
                
                <div style="padding: 20px; background-color: #ffffff; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    %s
                </div>
                
                <div style="text-align: center; padding: 20px; background-color: #f5f5f5;">
                    <p style="color: #666666; font-size: 12px;">
                        This is an automated message, please do not reply to this email.
                    </p>
                    <p style="color: #666666; font-size: 12px;">
                        © 2024 Bilkent University. All rights reserved.
                    </p>
                </div>
            </div>
            """, content);
    }

    public String createFormSubmissionEmailBody(String name, String date, String time, 
            Integer groupSize, String schoolName, String contactPhone, String expectations,
            String specialRequirements, String groupLeaderRole, String groupLeaderPhone,
            String groupLeaderEmail, String visitorNotes, String city) {
        
        return String.format("""
            <h2 style="color: #041E42; margin-bottom: 20px;">Form Submission Confirmation</h2>
            
            <p style="color: #333333; font-size: 16px; line-height: 1.5;">Dear %s,</p>
            
            <p style="color: #333333; font-size: 16px; line-height: 1.5;">Your form has been successfully submitted. Here are the details:</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Date:</strong> %s</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> %s</p>
                <p style="margin: 5px 0;"><strong>Group Size:</strong> %d</p>
                <p style="margin: 5px 0;"><strong>School Name:</strong> %s</p>
                <p style="margin: 5px 0;"><strong>Contact Phone:</strong> %s</p>
                <p style="margin: 5px 0;"><strong>City:</strong> %s</p>
                
                <div style="margin-top: 15px;">
                    <p style="margin: 5px 0;"><strong>Group Leader Information:</strong></p>
                    <p style="margin: 5px 0; padding-left: 15px;">Role: %s</p>
                    <p style="margin: 5px 0; padding-left: 15px;">Phone: %s</p>
                    <p style="margin: 5px 0; padding-left: 15px;">Email: %s</p>
                </div>
                
                <div style="margin-top: 15px;">
                    <p style="margin: 5px 0;"><strong>Additional Information:</strong></p>
                    <p style="margin: 5px 0;"><strong>Expectations:</strong> %s</p>
                    <p style="margin: 5px 0;"><strong>Special Requirements:</strong> %s</p>
                    <p style="margin: 5px 0;"><strong>Visitor Notes:</strong> %s</p>
                </div>
            </div>
            
            <p style="color: #333333; font-size: 16px; line-height: 1.5;">
                We will review your form and notify you once a decision has been made.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee;">
                <p style="color: #666666; font-size: 14px;">Best regards,</p>
                <p style="color: #666666; font-size: 14px;">Bilkent IO Team</p>
            </div>
            """, name, date, time, groupSize, schoolName, contactPhone, city,
                groupLeaderRole, groupLeaderPhone, groupLeaderEmail,
                expectations, specialRequirements, visitorNotes);
    }

    public String createFormStatusUpdateEmailBody(String name, String date, String time, String status) {
        String statusColor = status.equals("APPROVED") ? "#28a745" : "#dc3545";
        String statusMessage = status.equals("APPROVED") ? 
            "You can proceed with your planned activity." : 
            "Unfortunately, your form has been denied.";
        
        return String.format("""
            <h2 style="color: #041E42; margin-bottom: 20px;">Form Status Update</h2>
            
            <p style="color: #333333; font-size: 16px; line-height: 1.5;">Dear %s,</p>
            
            <p style="color: #333333; font-size: 16px; line-height: 1.5;">
                Your form has been <span style="color: %s; font-weight: bold;">%s</span>. %s
            </p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Date:</strong> %s</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> %s</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee;">
                <p style="color: #666666; font-size: 14px;">Best regards,</p>
                <p style="color: #666666; font-size: 14px;">Bilkent IO Team</p>
            </div>
            """, name, statusColor, status, statusMessage, date, time);
    }
}
