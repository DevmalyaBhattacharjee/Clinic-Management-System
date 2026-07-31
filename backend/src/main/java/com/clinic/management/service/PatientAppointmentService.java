package com.clinic.management.service;

import com.clinic.management.dto.AppointmentDTO;
import com.clinic.management.dto.BookAppointmentRequest;
import com.clinic.management.entity.Appointment;
import com.clinic.management.entity.Doctor;
import com.clinic.management.entity.Patient;
import com.clinic.management.enums.AppointmentStatus;
import com.clinic.management.exception.ResourceNotFoundException;
import com.clinic.management.repository.AppointmentRepository;
import com.clinic.management.repository.DoctorRepository;
import com.clinic.management.repository.PatientRepository;
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
public class PatientAppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    private Patient getCurrentPatient() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        return patientRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
    }

    @Transactional
    public AppointmentDTO bookAppointment(BookAppointmentRequest request) {
        Patient patient = getCurrentPatient();

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        // Check if doctor is available on the requested date
        // This can be enhanced with actual availability checking

        // Calculate token number
        Long appointmentCount = appointmentRepository.countByDoctorIdAndDate(
                doctor.getId(),
                request.getAppointmentDate()
        );
        int tokenNumber = appointmentCount.intValue() + 1;

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .reason(request.getReason())
                .status(AppointmentStatus.SCHEDULED)
                .tokenNumber(tokenNumber)
                .build();

        appointment = appointmentRepository.save(appointment);

        return mapToDTO(appointment);
    }

    public List<AppointmentDTO> getMyAppointments() {
        Patient patient = getCurrentPatient();
        return appointmentRepository.findByPatient(patient).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getMyUpcomingAppointments() {
        Patient patient = getCurrentPatient();
        LocalDate today = LocalDate.now();

        return appointmentRepository.findByPatient(patient).stream()
                .filter(a -> (a.getAppointmentDate().isAfter(today) || a.getAppointmentDate().isEqual(today))
                        && (a.getStatus() == AppointmentStatus.SCHEDULED || a.getStatus() == AppointmentStatus.CONFIRMED))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getMyPastAppointments() {
        Patient patient = getCurrentPatient();
        LocalDate today = LocalDate.now();

        return appointmentRepository.findByPatient(patient).stream()
                .filter(a -> a.getAppointmentDate().isBefore(today) || a.getStatus() == AppointmentStatus.COMPLETED)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public AppointmentDTO getAppointmentById(Long id) {
        Patient patient = getCurrentPatient();

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        // Ensure this appointment belongs to the current patient
        if (!appointment.getPatient().getId().equals(patient.getId())) {
            throw new IllegalArgumentException("You can only view your own appointments");
        }

        return mapToDTO(appointment);
    }

    @Transactional
    public void cancelAppointment(Long id) {
        Patient patient = getCurrentPatient();

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!appointment.getPatient().getId().equals(patient.getId())) {
            throw new IllegalArgumentException("You can only cancel your own appointments");
        }

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new IllegalArgumentException("Cannot cancel completed appointment");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
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