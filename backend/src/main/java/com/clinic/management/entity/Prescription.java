package com.clinic.management.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "prescriptions", indexes = {
        @Index(name = "idx_prescription_patient", columnList = "patient_id"),
        @Index(name = "idx_prescription_doctor", columnList = "doctor_id"),
        @Index(name = "idx_prescription_medical_record", columnList = "medical_record_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prescription extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "medical_record_id")
    private MedicalRecord medicalRecord;

    @Column(name = "prescription_date", nullable = false)
    private LocalDate prescriptionDate;

    @Column(name = "medication_name", nullable = false, length = 200)
    private String medicationName;

    @Column(nullable = false, length = 100)
    private String dosage;

    @Column(nullable = false, length = 200)
    private String frequency;

    @Column(nullable = false)
    private Integer duration; // in days

    @Column(length = 100)
    private String route; // e.g., "Oral", "Topical", "Injection"

    @Column(length = 1000)
    private String instructions;

    @Column(length = 500)
    private String precautions;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;
}