package com.clinic.management.service;

import com.clinic.management.dto.DoctorDTO;
import com.clinic.management.entity.Doctor;
import com.clinic.management.exception.ResourceNotFoundException;
import com.clinic.management.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorListService {

    private final DoctorRepository doctorRepository;

    public List<DoctorDTO> getAllActiveDoctors() {
        return doctorRepository.findAllActiveDoctors().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<DoctorDTO> getDoctorsBySpecialization(String specialization) {
        return doctorRepository.findBySpecialization(specialization).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public DoctorDTO getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        return mapToDTO(doctor);
    }

    private DoctorDTO mapToDTO(Doctor doctor) {
        return DoctorDTO.builder()
                .id(doctor.getId())
                .userId(doctor.getUser().getId())
                .name(doctor.getUser().getName())
                .email(doctor.getUser().getEmail())
                .phone(doctor.getUser().getPhone())
                .specialization(doctor.getSpecialization())
                .qualification(doctor.getQualification())
                .yearsOfExperience(doctor.getYearsOfExperience())
                .consultationFee(doctor.getConsultationFee())
                .availableFrom(doctor.getAvailableFrom())
                .availableTo(doctor.getAvailableTo())
                .availableDays(doctor.getAvailableDays())
                .biography(doctor.getBiography())
                .status(doctor.getUser().getStatus())
                .createdAt(doctor.getCreatedAt())
                .build();
    }
}