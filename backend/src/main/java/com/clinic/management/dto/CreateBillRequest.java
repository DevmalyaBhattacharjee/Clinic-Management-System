package com.clinic.management.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateBillRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private Long appointmentId;

    @NotNull(message = "Bill date is required")
    private LocalDate billDate;

    @DecimalMin(value = "0.0", message = "Consultation fee cannot be negative")
    private Double consultationFee;

    @DecimalMin(value = "0.0", message = "Medication cost cannot be negative")
    private Double medicationCost;

    @DecimalMin(value = "0.0", message = "Lab charges cannot be negative")
    private Double labCharges;

    @DecimalMin(value = "0.0", message = "Other charges cannot be negative")
    private Double otherCharges;

    @DecimalMin(value = "0.0", message = "Discount cannot be negative")
    private Double discount;

    @DecimalMin(value = "0.0", message = "Tax cannot be negative")
    private Double tax;

    private String notes;
}