package com.clinic.management.controller;

import com.clinic.management.dto.AppointmentDTO;
import com.clinic.management.enums.AppointmentStatus;
import com.clinic.management.service.AdminAppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/appointments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAppointmentController {

    private final AdminAppointmentService adminAppointmentService;

    @GetMapping
    public ResponseEntity<List<AppointmentDTO>> getAllAppointments() {
        List<AppointmentDTO> appointments = adminAppointmentService.getAllAppointments();
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/today")
    public ResponseEntity<List<AppointmentDTO>> getTodayAppointments() {
        List<AppointmentDTO> appointments = adminAppointmentService.getTodayAppointments();
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AppointmentDTO> appointments = adminAppointmentService.getAppointmentsByDate(date);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByStatus(@PathVariable AppointmentStatus status) {
        List<AppointmentDTO> appointments = adminAppointmentService.getAppointmentsByStatus(status);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDTO> getAppointmentById(@PathVariable Long id) {
        AppointmentDTO appointment = adminAppointmentService.getAppointmentById(id);
        return ResponseEntity.ok(appointment);
    }
}