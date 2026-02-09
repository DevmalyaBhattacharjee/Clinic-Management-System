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
public class PrescriptionDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private Long medicalRecordId;
    private LocalDate prescriptionDate;
    private String medicationName;
    private String dosage;
    private String frequency;
    private Integer duration;
    private String route;
    private String instructions;
    private String precautions;
    private Boolean isActive;
    private LocalDateTime createdAt;
}