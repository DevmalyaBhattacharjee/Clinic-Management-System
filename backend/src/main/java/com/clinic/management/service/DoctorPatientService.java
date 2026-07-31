package com.clinic.management.service;

import com.clinic.management.dto.PatientDTO;
import com.clinic.management.entity.Appointment;
import com.clinic.management.entity.Doctor;
import com.clinic.management.entity.Patient;
import com.clinic.management.exception.ResourceNotFoundException;
import com.clinic.management.repository.AppointmentRepository;
import com.clinic.management.repository.DoctorRepository;
import com.clinic.management.repository.PatientRepository;
import com.clinic.management.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorPatientService {

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;

    private Doctor getCurrentDoctor() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        return doctorRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
    }

    public List<PatientDTO> getMyPatients() {
        Doctor doctor = getCurrentDoctor();

        // Get all unique patients who have appointments with this doctor
        List<Appointment> appointments = appointmentRepository.findByDoctor(doctor);

        return appointments.stream()
                .map(Appointment::getPatient)
                .distinct()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public PatientDTO getPatientDetails(Long patientId) {
        Doctor doctor = getCurrentDoctor();

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        // Verify that this doctor has treated this patient
        boolean hasAppointment = appointmentRepository.findByDoctor(doctor).stream()
                .anyMatch(a -> a.getPatient().getId().equals(patientId));

        if (!hasAppointment) {
            throw new IllegalArgumentException("You can only view patients you have treated");
        }

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