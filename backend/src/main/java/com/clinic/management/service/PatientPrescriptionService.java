package com.clinic.management.service;

import com.clinic.management.dto.PrescriptionDTO;
import com.clinic.management.entity.Patient;
import com.clinic.management.entity.Prescription;
import com.clinic.management.exception.ResourceNotFoundException;
import com.clinic.management.repository.PatientRepository;
import com.clinic.management.repository.PrescriptionRepository;
import com.clinic.management.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientPrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository patientRepository;

    private Patient getCurrentPatient() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        return patientRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
    }

    public List<PrescriptionDTO> getMyPrescriptions() {
        Patient patient = getCurrentPatient();
        return prescriptionRepository.findByPatientIdOrderByDateDesc(patient.getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<PrescriptionDTO> getMyActivePrescriptions() {
        Patient patient = getCurrentPatient();
        return prescriptionRepository.findByPatientAndIsActiveTrue(patient).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public PrescriptionDTO getPrescriptionById(Long id) {
        Patient patient = getCurrentPatient();

        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));

        // Ensure this prescription belongs to the current patient
        if (!prescription.getPatient().getId().equals(patient.getId())) {
            throw new IllegalArgumentException("You can only view your own prescriptions");
        }

        return mapToDTO(prescription);
    }

    private PrescriptionDTO mapToDTO(Prescription prescription) {
        return PrescriptionDTO.builder()
                .id(prescription.getId())
                .patientId(prescription.getPatient().getId())
                .patientName(prescription.getPatient().getUser().getName())
                .doctorId(prescription.getDoctor().getId())
                .doctorName(prescription.getDoctor().getUser().getName())
                .medicalRecordId(prescription.getMedicalRecord() != null ? prescription.getMedicalRecord().getId() : null)
                .prescriptionDate(prescription.getPrescriptionDate())
                .medicationName(prescription.getMedicationName())
                .dosage(prescription.getDosage())
                .frequency(prescription.getFrequency())
                .duration(prescription.getDuration())
                .route(prescription.getRoute())
                .instructions(prescription.getInstructions())
                .precautions(prescription.getPrecautions())
                .isActive(prescription.getIsActive())
                .createdAt(prescription.getCreatedAt())
                .build();
    }
}