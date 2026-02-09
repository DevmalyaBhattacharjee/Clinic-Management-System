package com.clinic.management.dto;

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
public class MedicalRecordDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private String patientNumber;
    private Long doctorId;
    private String doctorName;
    private Long appointmentId;
    private LocalDate visitDate;
    private String chiefComplaint;
    private String symptoms;
    private String diagnosis;
    private String treatmentPlan;
    private String labTests;
    private String vitalSigns;
    private String notes;
    private LocalDate followUpDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}