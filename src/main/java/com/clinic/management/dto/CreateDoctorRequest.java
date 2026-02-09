package com.clinic.management.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalTime;

@Data
public class CreateDoctorRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 100, message = "Name must be between 3 and 100 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone number must be between 10 and 15 digits")
    private String phone;

    private String address;

    @NotBlank(message = "Specialization is required")
    private String specialization;

    @NotBlank(message = "Qualification is required")
    private String qualification;

    @NotBlank(message = "License number is required")
    private String licenseNumber;

    @Min(value = 0, message = "Years of experience cannot be negative")
    private Integer yearsOfExperience;

    @DecimalMin(value = "0.0", inclusive = false, message = "Consultation fee must be greater than 0")
    private Double consultationFee;

    private LocalTime availableFrom;

    private LocalTime availableTo;

    private String availableDays;

    private String biography;
}