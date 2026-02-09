package com.clinic.management.dto;

import com.clinic.management.enums.Gender;
import com.clinic.management.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientDTO {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String patientNumber;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String bloodGroup;
    private String emergencyContact;
    private String emergencyContactName;
    private String medicalHistory;
    private String allergies;
    private UserStatus status;
    private LocalDateTime createdAt;
}