package com.clinic.management.dto;

import com.clinic.management.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReceptionistDTO {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String employeeId;
    private LocalTime shiftStart;
    private LocalTime shiftEnd;
    private UserStatus status;
    private LocalDateTime createdAt;
}