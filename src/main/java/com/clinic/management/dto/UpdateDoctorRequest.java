package com.clinic.management.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalTime;

@Data
public class UpdateDoctorRequest {

    @Size(min = 3, max = 100, message = "Name must be between 3 and 100 characters")
    private String name;

    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone number must be between 10 and 15 digits")
    private String phone;

    private String address;

    private String specialization;

    private String qualification;

    @Min(value = 0, message = "Years of experience cannot be negative")
    private Integer yearsOfExperience;

    @DecimalMin(value = "0.0", inclusive = false, message = "Consultation fee must be greater than 0")
    private Double consultationFee;

    private LocalTime availableFrom;

    private LocalTime availableTo;

    private String availableDays;

    private String biography;
}