package com.clinic.management.service;

import com.clinic.management.dto.PatientDTO;
import com.clinic.management.dto.WalkInPatientRegistrationRequest;
import com.clinic.management.entity.Patient;
import com.clinic.management.entity.User;
import com.clinic.management.enums.Role;
import com.clinic.management.enums.UserStatus;
import com.clinic.management.exception.ResourceNotFoundException;
import com.clinic.management.repository.PatientRepository;
import com.clinic.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReceptionistPatientService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public PatientDTO registerWalkInPatient(WalkInPatientRegistrationRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Generate temporary password
        String tempPassword = generateTemporaryPassword();

        // Create User
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(tempPassword))
                .phone(request.getPhone())
                .address(request.getAddress())
                .role(Role.PATIENT)
                .status(UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);

        // Generate unique patient number
        String patientNumber = generatePatientNumber();

        // Create Patient
        Patient patient = Patient.builder()
                .user(user)
                .patientNumber(patientNumber)
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .bloodGroup(request.getBloodGroup())
                .emergencyContact(request.getEmergencyContact())
                .emergencyContactName(request.getEmergencyContactName())
                .medicalHistory(request.getMedicalHistory())
                .allergies(request.getAllergies())
                .build();

        patient = patientRepository.save(patient);

        // TODO: Send email/SMS with temporary password to patient

        return mapToDTO(patient);
    }

    public List<PatientDTO> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<PatientDTO> searchPatientsByName(String name) {
        return patientRepository.findAll().stream()
                .filter(p -> p.getUser().getName().toLowerCase().contains(name.toLowerCase()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public PatientDTO getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        return mapToDTO(patient);
    }

    public PatientDTO getPatientByPatientNumber(String patientNumber) {
        Patient patient = patientRepository.findByPatientNumber(patientNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with number: " + patientNumber));
        return mapToDTO(patient);
    }

    private String generateTemporaryPassword() {
        // Generate a random 8-character password
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String generatePatientNumber() {
        String prefix = "PT";
        String year = String.valueOf(LocalDate.now().getYear());
        String unique = UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        String patientNumber = prefix + year + unique;

        // Ensure uniqueness
        while (patientRepository.existsByPatientNumber(patientNumber)) {
            unique = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
            patientNumber = prefix + year + unique;
        }

        return patientNumber;
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