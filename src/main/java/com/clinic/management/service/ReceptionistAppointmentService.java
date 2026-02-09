package com.clinic.management.service;

import com.clinic.management.dto.AppointmentDTO;
import com.clinic.management.dto.ReceptionistBookAppointmentRequest;
import com.clinic.management.dto.TodayAppointmentSummaryDTO;
import com.clinic.management.dto.UpdateAppointmentStatusRequest;
import com.clinic.management.entity.Appointment;
import com.clinic.management.entity.Doctor;
import com.clinic.management.entity.Patient;
import com.clinic.management.enums.AppointmentStatus;
import com.clinic.management.exception.ResourceNotFoundException;
import com.clinic.management.repository.AppointmentRepository;
import com.clinic.management.repository.DoctorRepository;
import com.clinic.management.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReceptionistAppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    @Transactional
    public AppointmentDTO bookAppointment(ReceptionistBookAppointmentRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

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
                .notes(request.getNotes())
                .status(AppointmentStatus.SCHEDULED)
                .tokenNumber(tokenNumber)
                .build();

        appointment = appointmentRepository.save(appointment);

        return mapToDTO(appointment);
    }

    public List<AppointmentDTO> getTodayAppointments() {
        LocalDate today = LocalDate.now();
        return appointmentRepository.findByAppointmentDate(today).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getAppointmentsByDate(LocalDate date) {
        return appointmentRepository.findByAppointmentDate(date).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public TodayAppointmentSummaryDTO getTodayAppointmentSummary() {
        LocalDate today = LocalDate.now();
        List<Appointment> todayAppointments = appointmentRepository.findByAppointmentDate(today);

        long total = todayAppointments.size();
        long scheduled = todayAppointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.SCHEDULED).count();
        long confirmed = todayAppointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.CONFIRMED).count();
        long inProgress = todayAppointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.IN_PROGRESS).count();
        long completed = todayAppointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED).count();
        long cancelled = todayAppointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.CANCELLED).count();
        long noShow = todayAppointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.NO_SHOW).count();

        return TodayAppointmentSummaryDTO.builder()
                .totalAppointments(total)
                .scheduledAppointments(scheduled)
                .confirmedAppointments(confirmed)
                .inProgressAppointments(inProgress)
                .completedAppointments(completed)
                .cancelledAppointments(cancelled)
                .noShowAppointments(noShow)
                .build();
    }

    public List<AppointmentDTO> getAppointmentsByPatient(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        return appointmentRepository.findByPatient(patient).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getAppointmentsByDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        return appointmentRepository.findByDoctor(doctor).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public AppointmentDTO getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        return mapToDTO(appointment);
    }

    @Transactional
    public AppointmentDTO updateAppointmentStatus(Long id, UpdateAppointmentStatusRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        appointment.setStatus(request.getStatus());

        if (request.getNotes() != null) {
            appointment.setNotes(request.getNotes());
        }

        appointment = appointmentRepository.save(appointment);

        return mapToDTO(appointment);
    }

    @Transactional
    public void cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

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