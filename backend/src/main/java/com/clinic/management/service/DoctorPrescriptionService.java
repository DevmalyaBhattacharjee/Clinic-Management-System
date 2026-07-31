package com.clinic.management.service;

import com.clinic.management.dto.CreatePrescriptionRequest;
import com.clinic.management.dto.PrescriptionDTO;
import com.clinic.management.dto.UpdatePrescriptionRequest;
import com.clinic.management.entity.Doctor;
import com.clinic.management.entity.MedicalRecord;
import com.clinic.management.entity.Patient;
import com.clinic.management.entity.Prescription;
import com.clinic.management.exception.ResourceNotFoundException;
import com.clinic.management.repository.DoctorRepository;
import com.clinic.management.repository.MedicalRecordRepository;
import com.clinic.management.repository.PatientRepository;
import com.clinic.management.repository.PrescriptionRepository;
import com.clinic.management.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorPrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final MedicalRecordRepository medicalRecordRepository;

    private Doctor getCurrentDoctor() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        return doctorRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
    }

    @Transactional
    public PrescriptionDTO createPrescription(CreatePrescriptionRequest request) {
        Doctor doctor = getCurrentDoctor();

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        MedicalRecord medicalRecord = null;
        if (request.getMedicalRecordId() != null) {
            medicalRecord = medicalRecordRepository.findById(request.getMedicalRecordId())
                    .orElseThrow(() -> new ResourceNotFoundException("Medical record not found"));

            // Verify the medical record belongs to this doctor
            if (!medicalRecord.getDoctor().getId().equals(doctor.getId())) {
                throw new IllegalArgumentException("Medical record does not belong to you");
            }
        }

        Prescription prescription = Prescription.builder()
                .patient(patient)
                .doctor(doctor)
                .medicalRecord(medicalRecord)
                .prescriptionDate(request.getPrescriptionDate())
                .medicationName(request.getMedicationName())
                .dosage(request.getDosage())
                .frequency(request.getFrequency())
                .duration(request.getDuration())
                .route(request.getRoute())
                .instructions(request.getInstructions())
                .precautions(request.getPrecautions())
                .isActive(true)
                .build();

        prescription = prescriptionRepository.save(prescription);

        return mapToDTO(prescription);
    }

    public List<PrescriptionDTO> getMyPrescriptions() {
        Doctor doctor = getCurrentDoctor();
        return prescriptionRepository.findByDoctorIdOrderByDateDesc(doctor.getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<PrescriptionDTO> getPatientPrescriptions(Long patientId) {
        Doctor doctor = getCurrentDoctor();

        // Verify this doctor has treated this patient
        List<Prescription> allPrescriptions = prescriptionRepository.findByPatientIdOrderByDateDesc(patientId);

        return allPrescriptions.stream()
                .filter(p -> p.getDoctor().getId().equals(doctor.getId()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public PrescriptionDTO getPrescriptionById(Long id) {
        Doctor doctor = getCurrentDoctor();

        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));

        if (!prescription.getDoctor().getId().equals(doctor.getId())) {
            throw new IllegalArgumentException("You can only view your own prescriptions");
        }

        return mapToDTO(prescription);
    }

    @Transactional
    public PrescriptionDTO updatePrescription(Long id, UpdatePrescriptionRequest request) {
        Doctor doctor = getCurrentDoctor();

        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));

        if (!prescription.getDoctor().getId().equals(doctor.getId())) {
            throw new IllegalArgumentException("You can only update your own prescriptions");
        }

        if (request.getDosage() != null) {
            prescription.setDosage(request.getDosage());
        }
        if (request.getFrequency() != null) {
            prescription.setFrequency(request.getFrequency());
        }
        if (request.getDuration() != null) {
            prescription.setDuration(request.getDuration());
        }
        if (request.getInstructions() != null) {
            prescription.setInstructions(request.getInstructions());
        }
        if (request.getPrecautions() != null) {
            prescription.setPrecautions(request.getPrecautions());
        }
        if (request.getIsActive() != null) {
            prescription.setIsActive(request.getIsActive());
        }

        prescription = prescriptionRepository.save(prescription);

        return mapToDTO(prescription);
    }

    @Transactional
    public void deactivatePrescription(Long id) {
        Doctor doctor = getCurrentDoctor();

        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));

        if (!prescription.getDoctor().getId().equals(doctor.getId())) {
            throw new IllegalArgumentException("You can only deactivate your own prescriptions");
        }

        prescription.setIsActive(false);
        prescriptionRepository.save(prescription);
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