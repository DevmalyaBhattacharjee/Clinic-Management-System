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
public class DoctorDTO {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String specialization;
    private String qualification;
    private String licenseNumber;
    private Integer yearsOfExperience;
    private Double consultationFee;
    private LocalTime availableFrom;
    private LocalTime availableTo;
    private String availableDays;
    private String biography;
    private UserStatus status;
    private LocalDateTime createdAt;
}