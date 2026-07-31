package com.clinic.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Returned by the OAuth2 success callback as a redirect URL fragment
 * and also by the /api/auth/oauth2/me endpoint.
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class GoogleAuthResponse {
    private String token;
    private String type;
    private Long   userId;
    private String name;
    private String email;
    private String role;
    private String profileImageUrl;
    private boolean emailVerified;
}
