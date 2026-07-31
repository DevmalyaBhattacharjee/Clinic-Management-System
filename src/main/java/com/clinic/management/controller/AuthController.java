package com.clinic.management.controller;

import com.clinic.management.dto.AuthRequest;
import com.clinic.management.dto.AuthResponse;
import com.clinic.management.dto.ForgotPasswordRequest;
import com.clinic.management.dto.ResetPasswordRequest;
import com.clinic.management.service.AuthService;
import com.clinic.management.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AuthController
 *
 * Public REST endpoints — all permitted in SecurityConfig via /api/auth/**.
 *
 * POST /api/auth/login            — email/password login → JWT
 * POST /api/auth/forgot-password  — sends reset link to email
 * POST /api/auth/reset-password   — validates token + updates password
 *
 * Google OAuth2 is NOT handled here.
 * It starts at: GET /oauth2/authorization/google  (managed by Spring Security)
 * and ends at OAuth2SuccessHandler which redirects to React with the JWT.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService          authService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Always returns 200 regardless of whether the email exists,
     * preventing user-enumeration attacks.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.initiateReset(request);
        return ResponseEntity.ok(Map.of(
            "message", "If that email is registered, a reset link has been sent."
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        try {
            passwordResetService.resetPassword(request);
            return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
