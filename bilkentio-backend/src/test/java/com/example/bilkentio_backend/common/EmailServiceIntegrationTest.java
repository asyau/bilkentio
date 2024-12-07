package com.example.bilkentio_backend.common;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
public class EmailServiceIntegrationTest {

    @Autowired
    private EmailService emailService;

    @Test
    void testSendRealEmail() {
        emailService.sendEmail(
            "eren.eraslan@ug.bilkent.edu.tr",
            "BİLKENTTEN 100 BİN TL KAZANDINIZ ŞARTLAR İÇİN TIKLAYIN",
            "AATB"
        );
    }
} 