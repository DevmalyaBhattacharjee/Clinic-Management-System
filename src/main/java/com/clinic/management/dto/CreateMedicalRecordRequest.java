package com.clinic.management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateMedicalRecordRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    @NotNull(message = "Visit date is required")
    private LocalDate visitDate;

    @NotBlank(message = "Chief complaint is required")
    @Size(max = 500, message = "Chief complaint cannot exceed 500 characters")
    private String chiefComplaint;

    @Size(max = 2000, message = "Symptoms cannot exceed 2000 characters")
    private String symptoms;

    @NotBlank(message = "Diagnosis is required")
    @Size(max = 2000, message = "Diagnosis cannot exceed 2000 characters")
    private String diagnosis;

    @Size(max = 2000, message = "Treatment plan cannot exceed 2000 characters")
    private String treatmentPlan;

    @Size(max = 1000, message = "Lab tests cannot exceed 1000 characters")
    private String labTests;

    @Size(max = 1000, message = "Vital signs cannot exceed 1000 characters")
    private String vitalSigns;

    @Size(max = 2000, message = "Notes cannot exceed 2000 characters")
    private String notes;

    private LocalDate followUpDate;
}