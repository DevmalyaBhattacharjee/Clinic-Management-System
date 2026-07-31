package com.clinic.management.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "medical_records", indexes = {
        @Index(name = "idx_medical_patient", columnList = "patient_id"),
        @Index(name = "idx_medical_doctor", columnList = "doctor_id"),
        @Index(name = "idx_medical_appointment", columnList = "appointment_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalRecord extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @OneToOne
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @Column(name = "visit_date", nullable = false)
    private LocalDate visitDate;

    @Column(nullable = false, length = 500)
    private String chiefComplaint;

    @Column(length = 2000)
    private String symptoms;

    @Column(length = 2000)
    private String diagnosis;

    @Column(length = 2000)
    private String treatmentPlan;

    @Column(length = 1000)
    private String labTests;

    @Column(length = 1000)
    private String vitalSigns; // JSON format: {"bp":"120/80","temp":"98.6","pulse":"72"}

    @Column(length = 2000)
    private String notes;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;
}