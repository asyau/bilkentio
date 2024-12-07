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
}
