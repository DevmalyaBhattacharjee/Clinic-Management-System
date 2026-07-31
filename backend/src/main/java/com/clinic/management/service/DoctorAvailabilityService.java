package com.clinic.management.service;

import com.clinic.management.dto.DoctorAvailabilityDTO;
import com.clinic.management.dto.UpdateAvailabilityRequest;
import com.clinic.management.entity.Doctor;
import com.clinic.management.entity.DoctorAvailability;
import com.clinic.management.exception.ResourceNotFoundException;
import com.clinic.management.repository.DoctorAvailabilityRepository;
import com.clinic.management.repository.DoctorRepository;
import com.clinic.management.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorAvailabilityService {

    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorRepository doctorRepository;

    private Doctor getCurrentDoctor() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        return doctorRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
    }

    @Transactional
    public DoctorAvailabilityDTO updateAvailability(UpdateAvailabilityRequest request) {
        Doctor doctor = getCurrentDoctor();

        // Check if availability already exists for this date
        DoctorAvailability availability = availabilityRepository
                .findByDoctorAndDate(doctor, request.getDate())
                .orElse(DoctorAvailability.builder()
                        .doctor(doctor)
                        .date(request.getDate())
                        .build());

        availability.setDayOfWeek(request.getDayOfWeek());
        availability.setStartTime(request.getStartTime());
        availability.setEndTime(request.getEndTime());
        availability.setIsAvailable(request.getIsAvailable());
        availability.setReason(request.getReason());

        availability = availabilityRepository.save(availability);

        return mapToDTO(availability);
    }

    public List<DoctorAvailabilityDTO> getMyAvailability() {
        Doctor doctor = getCurrentDoctor();
        return availabilityRepository.findByDoctor(doctor).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<DoctorAvailabilityDTO> getUpcomingAvailability() {
        Doctor doctor = getCurrentDoctor();
        LocalDate today = LocalDate.now();
        return availabilityRepository.findUpcomingAvailability(doctor.getId(), today).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public DoctorAvailabilityDTO getAvailabilityByDate(LocalDate date) {
        Doctor doctor = getCurrentDoctor();
        DoctorAvailability availability = availabilityRepository.findByDoctorAndDate(doctor, date)
                .orElseThrow(() -> new ResourceNotFoundException("Availability not found for date: " + date));

        return mapToDTO(availability);
    }

    @Transactional
    public void deleteAvailability(Long id) {
        Doctor doctor = getCurrentDoctor();

        DoctorAvailability availability = availabilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Availability not found"));

        if (!availability.getDoctor().getId().equals(doctor.getId())) {
            throw new IllegalArgumentException("You can only delete your own availability");
        }

        availabilityRepository.delete(availability);
    }

    private DoctorAvailabilityDTO mapToDTO(DoctorAvailability availability) {
        return DoctorAvailabilityDTO.builder()
                .id(availability.getId())
                .doctorId(availability.getDoctor().getId())
                .doctorName(availability.getDoctor().getUser().getName())
                .date(availability.getDate())
                .dayOfWeek(availability.getDayOfWeek())
                .startTime(availability.getStartTime())
                .endTime(availability.getEndTime())
                .isAvailable(availability.getIsAvailable())
                .reason(availability.getReason())
                .build();
    }
}