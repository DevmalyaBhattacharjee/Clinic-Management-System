package com.clinic.management.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender javaMailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.mail.from:MediCure <noreply@medicure.com>}")
    private String fromAddress;

    @Value("${app.name:MediCure}")
    private String appName;

    @Async
    public void sendPasswordResetEmail(String name, String email,
                                       String resetUrl, int expiryMinutes) {
        Context ctx = new Context();
        ctx.setVariable("name",          name);
        ctx.setVariable("resetUrl",      resetUrl);
        ctx.setVariable("expiryMinutes", expiryMinutes);
        ctx.setVariable("appName",       appName);
        sendHtml(email, "Reset your " + appName + " password",
                 templateEngine.process("password-reset", ctx));
    }

    @Async
    public void sendGoogleAccountNotice(String name, String email) {
        Context ctx = new Context();
        ctx.setVariable("name",    name);
        ctx.setVariable("appName", appName);
        sendHtml(email, "Sign in to " + appName + " with Google",
                 templateEngine.process("google-account-notice", ctx));
    }

    private void sendHtml(String to, String subject, String html) {
        try {
            MimeMessage msg = javaMailSender.createMimeMessage();
            MimeMessageHelper h = new MimeMessageHelper(msg, true, "UTF-8");
            h.setFrom(fromAddress);
            h.setTo(to);
            h.setSubject(subject);
            h.setText(html, true);
            javaMailSender.send(msg);
            log.info("Email sent to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
