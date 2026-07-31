package com.clinic.management.security;

import com.clinic.management.enums.Role;
import com.clinic.management.entity.User;
import com.clinic.management.enums.UserStatus;
import com.clinic.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * CustomOAuth2UserService
 *
 * Spring Security calls this after Google returns a successful token exchange.
 * It receives the raw OAuth2 user attributes and is responsible for:
 *
 *   1. Extracting email, name, googleId, picture from Google's response
 *   2. Finding an existing user by googleId (returning user)
 *   3. Finding an existing LOCAL user by email (account linking)
 *   4. Creating a new PATIENT account on first Google login
 *   5. Returning the OAuth2User principal so Spring can complete authentication
 *
 * The returned OAuth2User is passed to OAuth2SuccessHandler, where the JWT
 * is generated and the frontend redirect is issued.
 *
 * NOTE: This service runs BEFORE OAuth2SuccessHandler.  Both are needed:
 *   - CustomOAuth2UserService → loads / creates the user in DB
 *   - OAuth2SuccessHandler    → generates JWT and redirects to React
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    /**
     * Called by Spring Security after receiving the Google access token.
     *
     * @param userRequest contains the access token and client registration info
     * @return the OAuth2User principal (Google's attributes map); we don't wrap it
     *         because OAuth2SuccessHandler re-reads the attributes directly
     * @throws OAuth2AuthenticationException if email is missing or account is disabled
     */
    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // Let the default service fetch user attributes from Google's userinfo endpoint
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String googleId  = oAuth2User.getAttribute("sub");
        String email     = oAuth2User.getAttribute("email");
        String name      = oAuth2User.getAttribute("name");
        String picture   = oAuth2User.getAttribute("picture");
        Boolean verified = oAuth2User.getAttribute("email_verified");

        log.debug("OAuth2 user loaded: email={}, googleId={}", email, googleId);

        if (email == null || googleId == null) {
            log.error("Google did not return email or sub. Attributes: {}",
                    oAuth2User.getAttributes().keySet());
            throw new OAuth2AuthenticationException("Google account must have a verified email address.");
        }

        processUser(googleId, email, name, picture, Boolean.TRUE.equals(verified));

        // Return the raw Google OAuth2User — OAuth2SuccessHandler will read it
        return oAuth2User;
    }

    /**
     * Resolves the user:
     *   1. By googleId      → returning Google user (update profile pic)
     *   2. By email         → existing LOCAL user (link Google to their account)
     *   3. None found       → create new PATIENT
     */
    private void processUser(String googleId, String email, String name,
                             String picture, boolean emailVerified) {

        // Case 1: already a Google user
        userRepository.findByGoogleId(googleId).ifPresent(u -> {
            if (picture != null) {
                u.setProfileImageUrl(picture);
                userRepository.save(u);
            }
            log.debug("Returning Google user: id={}", u.getId());
        });

        if (userRepository.findByGoogleId(googleId).isPresent()) return;

        // Case 2: existing LOCAL user with same email → link accounts
        userRepository.findByEmail(email).ifPresent(u -> {
            log.info("Linking Google account to existing user id={}", u.getId());
            u.setGoogleId(googleId);
            u.setEmailVerified(true);
            if (picture != null && u.getProfileImageUrl() == null) {
                u.setProfileImageUrl(picture);
            }
            userRepository.save(u);
        });

        if (userRepository.findByEmail(email).isPresent()) return;

        // Case 3: brand-new user → create PATIENT account
        log.info("Creating new PATIENT account for Google user: {}", email);
        User newUser = User.builder()
                .googleId(googleId)
                .email(email)
                .name(name != null && !name.isBlank() ? name : email.split("@")[0])
                // Unusable local-login password for Google-only accounts
                .password("{noop}GOOGLE_" + UUID.randomUUID())
                .role(Role.PATIENT)
                .status(UserStatus.ACTIVE)
                .provider("GOOGLE")
                .profileImageUrl(picture)
                .emailVerified(emailVerified)
                .build();
        userRepository.save(newUser);
    }
}