package com.clinic.management.dto;

import com.clinic.management.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private final String type = "Bearer";
    private Long userId;
    private String name;
    private String email;
    private Role role;
}