package com.clinic.management.security;

import com.clinic.management.entity.User;
import com.clinic.management.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil        jwtUtil;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest  request,
                                        HttpServletResponse response,
                                        Authentication      authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email   = oAuth2User.getAttribute("email");
        String picture = oAuth2User.getAttribute("picture");

        if (email == null) {
            log.error("OAuth2 success but email claim is null");
            response.sendRedirect(frontendUrl + "/login?oauth_error=missing_email");
            return;
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            log.error("User not found after OAuth2 success: {}", email);
            response.sendRedirect(frontendUrl + "/login?oauth_error=user_not_found");
            return;
        }

        // Build CustomUserDetails so JwtUtil generates the same token format as login
        CustomUserDetails userDetails = CustomUserDetails.build(user);
        String jwt = jwtUtil.generateToken(userDetails);

        String redirectUrl = UriComponentsBuilder
                .fromUriString(frontendUrl + "/oauth2/callback")
                .queryParam("token",   jwt)
                .queryParam("userId",  user.getId())
                .queryParam("name",    user.getName())
                .queryParam("email",   user.getEmail())
                .queryParam("role",    user.getRole().name())
                .queryParam("picture", picture != null ? picture : "")
                .build()
                .toUriString();

        log.info("OAuth2 login success: id={} role={}", user.getId(), user.getRole());
        clearAuthenticationAttributes(request);
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}