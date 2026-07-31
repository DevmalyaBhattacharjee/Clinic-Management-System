package com.clinic.management.controller;

import com.clinic.management.dto.AppointmentDTO;
import com.clinic.management.dto.BookAppointmentRequest;
import com.clinic.management.service.PatientAppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patient/appointments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class PatientAppointmentController {

    private final PatientAppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<AppointmentDTO> bookAppointment(@Valid @RequestBody BookAppointmentRequest request) {
        AppointmentDTO appointment = appointmentService.bookAppointment(request);
        return new ResponseEntity<>(appointment, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AppointmentDTO>> getMyAppointments() {
        List<AppointmentDTO> appointments = appointmentService.getMyAppointments();
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<AppointmentDTO>> getUpcomingAppointments() {
        List<AppointmentDTO> appointments = appointmentService.getMyUpcomingAppointments();
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/past")
    public ResponseEntity<List<AppointmentDTO>> getPastAppointments() {
        List<AppointmentDTO> appointments = appointmentService.getMyPastAppointments();
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDTO> getAppointmentById(@PathVariable Long id) {
        AppointmentDTO appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(appointment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelAppointment(@PathVariable Long id) {
        appointmentService.cancelAppointment(id);
        return ResponseEntity.noContent().build();
    }
}