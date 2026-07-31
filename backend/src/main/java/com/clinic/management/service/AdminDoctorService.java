package com.clinic.management.service;

import com.clinic.management.dto.CreateDoctorRequest;
import com.clinic.management.dto.DoctorDTO;
import com.clinic.management.dto.UpdateDoctorRequest;
import com.clinic.management.entity.Doctor;
import com.clinic.management.entity.User;
import com.clinic.management.enums.Role;
import com.clinic.management.enums.UserStatus;
import com.clinic.management.exception.ResourceNotFoundException;
import com.clinic.management.repository.DoctorRepository;
import com.clinic.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public DoctorDTO createDoctor(CreateDoctorRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Check if license number already exists
        if (doctorRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new IllegalArgumentException("License number already exists");
        }

        // Create User
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .address(request.getAddress())
                .role(Role.DOCTOR)
                .status(UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);

        // Create Doctor
        Doctor doctor = Doctor.builder()
                .user(user)
                .specialization(request.getSpecialization())
                .qualification(request.getQualification())
                .licenseNumber(request.getLicenseNumber())
                .yearsOfExperience(request.getYearsOfExperience())
                .consultationFee(request.getConsultationFee())
                .availableFrom(request.getAvailableFrom())
                .availableTo(request.getAvailableTo())
                .availableDays(request.getAvailableDays())
                .biography(request.getBiography())
                .build();

        doctor = doctorRepository.save(doctor);

        return mapToDTO(doctor);
    }

    public List<DoctorDTO> getAllDoctors() {
        return doctorRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<DoctorDTO> getActiveDoctors() {
        return doctorRepository.findAllActiveDoctors().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public DoctorDTO getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));
        return mapToDTO(doctor);
    }

    public List<DoctorDTO> getDoctorsBySpecialization(String specialization) {
        return doctorRepository.findBySpecialization(specialization).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public DoctorDTO updateDoctor(Long id, UpdateDoctorRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));

        User user = doctor.getUser();

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

        // Update Doctor fields if provided
        if (request.getSpecialization() != null) {
            doctor.setSpecialization(request.getSpecialization());
        }
        if (request.getQualification() != null) {
            doctor.setQualification(request.getQualification());
        }
        if (request.getYearsOfExperience() != null) {
            doctor.setYearsOfExperience(request.getYearsOfExperience());
        }
        if (request.getConsultationFee() != null) {
            doctor.setConsultationFee(request.getConsultationFee());
        }
        if (request.getAvailableFrom() != null) {
            doctor.setAvailableFrom(request.getAvailableFrom());
        }
        if (request.getAvailableTo() != null) {
            doctor.setAvailableTo(request.getAvailableTo());
        }
        if (request.getAvailableDays() != null) {
            doctor.setAvailableDays(request.getAvailableDays());
        }
        if (request.getBiography() != null) {
            doctor.setBiography(request.getBiography());
        }

        userRepository.save(user);
        doctor = doctorRepository.save(doctor);

        return mapToDTO(doctor);
    }

    @Transactional
    public void deleteDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));

        // Soft delete by setting status to INACTIVE
        doctor.getUser().setStatus(UserStatus.INACTIVE);
        userRepository.save(doctor.getUser());
    }

    @Transactional
    public void activateDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));

        doctor.getUser().setStatus(UserStatus.ACTIVE);
        userRepository.save(doctor.getUser());
    }

    private DoctorDTO mapToDTO(Doctor doctor) {
        return DoctorDTO.builder()
                .id(doctor.getId())
                .userId(doctor.getUser().getId())
                .name(doctor.getUser().getName())
                .email(doctor.getUser().getEmail())
                .phone(doctor.getUser().getPhone())
                .address(doctor.getUser().getAddress())
                .specialization(doctor.getSpecialization())
                .qualification(doctor.getQualification())
                .licenseNumber(doctor.getLicenseNumber())
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