package com.clinic.management.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreatePrescriptionRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private Long medicalRecordId;

    @NotNull(message = "Prescription date is required")
    private LocalDate prescriptionDate;

    @NotBlank(message = "Medication name is required")
    @Size(max = 200, message = "Medication name cannot exceed 200 characters")
    private String medicationName;

    @NotBlank(message = "Dosage is required")
    @Size(max = 100, message = "Dosage cannot exceed 100 characters")
    private String dosage;

    @NotBlank(message = "Frequency is required")
    @Size(max = 200, message = "Frequency cannot exceed 200 characters")
    private String frequency;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 day")
    private Integer duration;

    @Size(max = 100, message = "Route cannot exceed 100 characters")
    private String route;

    @Size(max = 1000, message = "Instructions cannot exceed 1000 characters")
    private String instructions;

    @Size(max = 500, message = "Precautions cannot exceed 500 characters")
    private String precautions;
}