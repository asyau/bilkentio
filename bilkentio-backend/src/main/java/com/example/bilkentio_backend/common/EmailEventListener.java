package com.example.bilkentio_backend.common;

import com.example.bilkentio_backend.common.event.EmailEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class EmailEventListener {
    private final EmailService emailService;
    private static final Logger logger = LoggerFactory.getLogger(EmailEventListener.class);

    public EmailEventListener(EmailService emailService) {
        this.emailService = emailService;
    }

    @EventListener
    @Async
    public void handleEmailEvent(EmailEvent event) {
        try {
            emailService.sendEmail(event.getTo(), event.getSubject(), event.getContent());
        } catch (Exception e) {
            logger.error("Failed to send email: " + e.getMessage());
        }
    }
} 