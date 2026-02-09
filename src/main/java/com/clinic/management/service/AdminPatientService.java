package com.clinic.management.service;

import com.clinic.management.dto.PatientDTO;
import com.clinic.management.entity.Patient;
import com.clinic.management.enums.UserStatus;
import com.clinic.management.exception.ResourceNotFoundException;
import com.clinic.management.repository.PatientRepository;
import com.clinic.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminPatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public List<PatientDTO> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<PatientDTO> getActivePatients() {
        return patientRepository.findAllActivePatients().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public PatientDTO getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
        return mapToDTO(patient);
    }

    public PatientDTO getPatientByPatientNumber(String patientNumber) {
        Patient patient = patientRepository.findByPatientNumber(patientNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with number: " + patientNumber));
        return mapToDTO(patient);
    }

    @Transactional
    public void deactivatePatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));

        patient.getUser().setStatus(UserStatus.INACTIVE);
        userRepository.save(patient.getUser());
    }

    @Transactional
    public void activatePatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));

        patient.getUser().setStatus(UserStatus.ACTIVE);
        userRepository.save(patient.getUser());
    }

    private PatientDTO mapToDTO(Patient patient) {
        return PatientDTO.builder()
                .id(patient.getId())
                .userId(patient.getUser().getId())
                .name(patient.getUser().getName())
                .email(patient.getUser().getEmail())
                .phone(patient.getUser().getPhone())
                .address(patient.getUser().getAddress())
                .patientNumber(patient.getPatientNumber())
                .dateOfBirth(patient.getDateOfBirth())
                .gender(patient.getGender())
                .bloodGroup(patient.getBloodGroup())
                .emergencyContact(patient.getEmergencyContact())
                .emergencyContactName(patient.getEmergencyContactName())
                .medicalHistory(patient.getMedicalHistory())
                .allergies(patient.getAllergies())
                .status(patient.getUser().getStatus())
                .createdAt(patient.getCreatedAt())
                .build();
    }
}