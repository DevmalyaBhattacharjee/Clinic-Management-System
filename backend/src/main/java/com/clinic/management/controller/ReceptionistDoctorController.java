package com.clinic.management.controller;

import com.clinic.management.dto.DoctorDTO;
import com.clinic.management.service.ReceptionistDoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/receptionist/doctors")
@RequiredArgsConstructor
@PreAuthorize("hasRole('RECEPTIONIST')")
public class ReceptionistDoctorController {

    private final ReceptionistDoctorService doctorService;

    @GetMapping
    public ResponseEntity<List<DoctorDTO>> getAllActiveDoctors() {
        List<DoctorDTO> doctors = doctorService.getAllActiveDoctors();
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/specialization/{specialization}")
    public ResponseEntity<List<DoctorDTO>> getDoctorsBySpecialization(@PathVariable String specialization) {
        List<DoctorDTO> doctors = doctorService.getDoctorsBySpecialization(specialization);
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorDTO> getDoctorById(@PathVariable Long id) {
        DoctorDTO doctor = doctorService.getDoctorById(id);
        return ResponseEntity.ok(doctor);
    }
}