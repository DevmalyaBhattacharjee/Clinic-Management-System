package com.clinic.management.service;

import com.clinic.management.dto.MedicalRecordDTO;
import com.clinic.management.entity.MedicalRecord;
import com.clinic.management.entity.Patient;
import com.clinic.management.exception.ResourceNotFoundException;
import com.clinic.management.repository.MedicalRecordRepository;
import com.clinic.management.repository.PatientRepository;
import com.clinic.management.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientMedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientRepository patientRepository;

    private Patient getCurrentPatient() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        return patientRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
    }

    public List<MedicalRecordDTO> getMyMedicalRecords() {
        Patient patient = getCurrentPatient();
        return medicalRecordRepository.findByPatientOrderByVisitDateDesc(patient).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public MedicalRecordDTO getMedicalRecordById(Long id) {
        Patient patient = getCurrentPatient();

        MedicalRecord medicalRecord = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found"));

        // Ensure this record belongs to the current patient
        if (!medicalRecord.getPatient().getId().equals(patient.getId())) {
            throw new IllegalArgumentException("You can only view your own medical records");
        }

        return mapToDTO(medicalRecord);
    }

    private MedicalRecordDTO mapToDTO(MedicalRecord record) {
        return MedicalRecordDTO.builder()
                .id(record.getId())
                .patientId(record.getPatient().getId())
                .patientName(record.getPatient().getUser().getName())
                .patientNumber(record.getPatient().getPatientNumber())
                .doctorId(record.getDoctor().getId())
                .doctorName(record.getDoctor().getUser().getName())
                .appointmentId(record.getAppointment() != null ? record.getAppointment().getId() : null)
                .visitDate(record.getVisitDate())
                .chiefComplaint(record.getChiefComplaint())
                .symptoms(record.getSymptoms())
                .diagnosis(record.getDiagnosis())
                .treatmentPlan(record.getTreatmentPlan())
                .labTests(record.getLabTests())
                .vitalSigns(record.getVitalSigns())
                .notes(record.getNotes())
                .followUpDate(record.getFollowUpDate())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
    }
}