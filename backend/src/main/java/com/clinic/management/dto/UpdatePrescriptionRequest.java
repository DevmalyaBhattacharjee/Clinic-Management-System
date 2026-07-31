package com.clinic.management.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdatePrescriptionRequest {

    @Size(max = 100, message = "Dosage cannot exceed 100 characters")
    private String dosage;

    @Size(max = 200, message = "Frequency cannot exceed 200 characters")
    private String frequency;

    @Min(value = 1, message = "Duration must be at least 1 day")
    private Integer duration;

    @Size(max = 1000, message = "Instructions cannot exceed 1000 characters")
    private String instructions;

    @Size(max = 500, message = "Precautions cannot exceed 500 characters")
    private String precautions;

    private Boolean isActive;
}