package com.clinic.management.service;

import com.clinic.management.dto.ForgotPasswordRequest;
import com.clinic.management.dto.ResetPasswordRequest;
import com.clinic.management.entity.User;
import com.clinic.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final UserRepository   userRepository;
    private final PasswordEncoder  passwordEncoder;
    private final EmailService     emailService;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    private static final int    TOKEN_BYTES    = 32;
    private static final int    EXPIRY_MINUTES = 30;
    private static final SecureRandom RANDOM   = new SecureRandom();

    @Transactional
    public void initiateReset(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        Optional<User> optUser = userRepository.findByEmail(email);

        if (optUser.isEmpty()) {
            simulateDelay();
            return;
        }

        User user = optUser.get();

        if ("GOOGLE".equals(user.getProvider()) &&
            (user.getPassword() == null || user.getPassword().startsWith("{noop}GOOGLE_"))) {
            emailService.sendGoogleAccountNotice(user.getName(), email);
            return;
        }

        String token    = generateToken();
        String resetUrl = frontendUrl + "/reset-password?token=" + token;

        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(EXPIRY_MINUTES));
        userRepository.save(user);

        emailService.sendPasswordResetEmail(user.getName(), email, resetUrl, EXPIRY_MINUTES);
        log.info("Password reset token issued for user id={}", user.getId());
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken().trim())
            .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset link."));

        if (user.getResetTokenExpiry() == null ||
            LocalDateTime.now().isAfter(user.getResetTokenExpiry())) {
            user.setResetToken(null);
            user.setResetTokenExpiry(null);
            userRepository.save(user);
            throw new IllegalArgumentException("This reset link has expired. Please request a new one.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
        log.info("Password successfully reset for user id={}", user.getId());
    }

    private String generateToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private void simulateDelay() {
        try { Thread.sleep(200 + RANDOM.nextInt(100)); }
        catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}
