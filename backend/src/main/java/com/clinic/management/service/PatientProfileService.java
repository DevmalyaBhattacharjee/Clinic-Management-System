package com.clinic.management.service;

import com.clinic.management.dto.PatientDTO;
import com.clinic.management.dto.UpdatePatientProfileRequest;
import com.clinic.management.entity.Patient;
import com.clinic.management.entity.User;
import com.clinic.management.exception.ResourceNotFoundException;
import com.clinic.management.repository.PatientRepository;
import com.clinic.management.repository.UserRepository;
import com.clinic.management.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PatientProfileService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    private Patient getCurrentPatient() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        return patientRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
    }

    public PatientDTO getMyProfile() {
        Patient patient = getCurrentPatient();
        return mapToDTO(patient);
    }

    @Transactional
    public PatientDTO updateMyProfile(UpdatePatientProfileRequest request) {
        Patient patient = getCurrentPatient();
        User user = patient.getUser();

        // Update User fields if provided
        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        // Update Patient fields if provided
        if (request.getDateOfBirth() != null) {
            patient.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getGender() != null) {
            patient.setGender(request.getGender());
        }
        if (request.getBloodGroup() != null) {
            patient.setBloodGroup(request.getBloodGroup());
        }
        if (request.getEmergencyContact() != null) {
            patient.setEmergencyContact(request.getEmergencyContact());
        }
        if (request.getEmergencyContactName() != null) {
            patient.setEmergencyContactName(request.getEmergencyContactName());
        }
        if (request.getMedicalHistory() != null) {
            patient.setMedicalHistory(request.getMedicalHistory());
        }
        if (request.getAllergies() != null) {
            patient.setAllergies(request.getAllergies());
        }

        userRepository.save(user);
        patient = patientRepository.save(patient);

        return mapToDTO(patient);
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