package com.clinic.management.controller;

import com.clinic.management.dto.AppointmentDTO;
import com.clinic.management.enums.AppointmentStatus;
import com.clinic.management.service.DoctorAppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctor/appointments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorAppointmentController {

    private final DoctorAppointmentService appointmentService;

    @GetMapping
    public ResponseEntity<List<AppointmentDTO>> getMyAppointments() {
        List<AppointmentDTO> appointments = appointmentService.getMyAppointments();
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/today")
    public ResponseEntity<List<AppointmentDTO>> getTodayAppointments() {
        List<AppointmentDTO> appointments = appointmentService.getMyTodayAppointments();
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<AppointmentDTO>> getUpcomingAppointments() {
        List<AppointmentDTO> appointments = appointmentService.getMyUpcomingAppointments();
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AppointmentDTO> appointments = appointmentService.getMyAppointmentsByDate(date);
        return ResponseEntity.ok(appointments);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AppointmentDTO> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestParam AppointmentStatus status) {
        AppointmentDTO appointment = appointmentService.updateAppointmentStatus(id, status);
        return ResponseEntity.ok(appointment);
    }

    @PatchMapping("/{id}/notes")
    public ResponseEntity<AppointmentDTO> addNotes(
            @PathVariable Long id,
            @RequestParam String notes) {
        AppointmentDTO appointment = appointmentService.addAppointmentNotes(id, notes);
        return ResponseEntity.ok(appointment);
    }
}