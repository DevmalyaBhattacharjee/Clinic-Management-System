package com.clinic.management.service;

import com.clinic.management.dto.AppointmentDTO;
import com.clinic.management.entity.Appointment;
import com.clinic.management.entity.Doctor;
import com.clinic.management.enums.AppointmentStatus;
import com.clinic.management.exception.ResourceNotFoundException;
import com.clinic.management.repository.AppointmentRepository;
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
public class DoctorAppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;

    private Doctor getCurrentDoctor() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        return doctorRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
    }

    public List<AppointmentDTO> getMyAppointments() {
        Doctor doctor = getCurrentDoctor();
        return appointmentRepository.findByDoctor(doctor).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getMyTodayAppointments() {
        Doctor doctor = getCurrentDoctor();
        LocalDate today = LocalDate.now();
        return appointmentRepository.findByDoctorIdAndDate(doctor.getId(), today).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getMyAppointmentsByDate(LocalDate date) {
        Doctor doctor = getCurrentDoctor();
        return appointmentRepository.findByDoctorIdAndDate(doctor.getId(), date).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getMyUpcomingAppointments() {
        Doctor doctor = getCurrentDoctor();
        LocalDate today = LocalDate.now();

        return appointmentRepository.findByDoctor(doctor).stream()
                .filter(a -> a.getAppointmentDate().isAfter(today) || a.getAppointmentDate().isEqual(today))
                .filter(a -> a.getStatus() == AppointmentStatus.SCHEDULED || a.getStatus() == AppointmentStatus.CONFIRMED)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AppointmentDTO updateAppointmentStatus(Long appointmentId, AppointmentStatus status) {
        Doctor doctor = getCurrentDoctor();

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        // Ensure this appointment belongs to the current doctor
        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            throw new IllegalArgumentException("You can only update your own appointments");
        }

        appointment.setStatus(status);
        appointment = appointmentRepository.save(appointment);

        return mapToDTO(appointment);
    }

    @Transactional
    public AppointmentDTO addAppointmentNotes(Long appointmentId, String notes) {
        Doctor doctor = getCurrentDoctor();

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            throw new IllegalArgumentException("You can only update your own appointments");
        }

        appointment.setNotes(notes);
        appointment = appointmentRepository.save(appointment);

        return mapToDTO(appointment);
    }

    private AppointmentDTO mapToDTO(Appointment appointment) {
        return AppointmentDTO.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatient().getId())
                .patientName(appointment.getPatient().getUser().getName())
                .patientNumber(appointment.getPatient().getPatientNumber())
                .doctorId(appointment.getDoctor().getId())
                .doctorName(appointment.getDoctor().getUser().getName())
                .doctorSpecialization(appointment.getDoctor().getSpecialization())
                .appointmentDate(appointment.getAppointmentDate())
                .appointmentTime(appointment.getAppointmentTime())
                .status(appointment.getStatus())
                .reason(appointment.getReason())
                .notes(appointment.getNotes())
                .tokenNumber(appointment.getTokenNumber())
                .createdAt(appointment.getCreatedAt())
                .build();
    }
}