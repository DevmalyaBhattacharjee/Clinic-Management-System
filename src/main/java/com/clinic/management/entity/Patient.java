package com.clinic.management.entity;

import com.clinic.management.enums.Gender;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "patients", indexes = {
        @Index(name = "idx_patient_user_id", columnList = "user_id"),
        @Index(name = "idx_patient_number", columnList = "patient_number")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "patient_number", unique = true, nullable = false, length = 20)
    private String patientNumber;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Gender gender;

    @Column(name = "blood_group", length = 5)
    private String bloodGroup;

    @Column(name = "emergency_contact", length = 15)
    private String emergencyContact;

    @Column(name = "emergency_contact_name", length = 100)
    private String emergencyContactName;

    @Column(name = "medical_history", length = 2000)
    private String medicalHistory;

    @Column(length = 500)
    private String allergies;
}