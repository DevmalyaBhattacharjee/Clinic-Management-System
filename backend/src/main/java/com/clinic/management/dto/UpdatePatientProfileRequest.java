package com.clinic.management.dto;

import com.clinic.management.enums.Gender;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdatePatientProfileRequest {

    @Size(min = 3, max = 100, message = "Name must be between 3 and 100 characters")
    private String name;

    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone number must be between 10 and 15 digits")
    private String phone;

    private String address;

    private LocalDate dateOfBirth;

    private Gender gender;

    private String bloodGroup;

    @Pattern(regexp = "^[0-9]{10,15}$", message = "Emergency contact must be between 10 and 15 digits")
    private String emergencyContact;

    private String emergencyContactName;

    private String medicalHistory;

    private String allergies;
}