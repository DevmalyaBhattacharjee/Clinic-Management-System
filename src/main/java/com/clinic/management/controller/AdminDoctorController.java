package com.clinic.management.controller;

import com.clinic.management.dto.CreateDoctorRequest;
import com.clinic.management.dto.DoctorDTO;
import com.clinic.management.dto.UpdateDoctorRequest;
import com.clinic.management.service.AdminDoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/doctors")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDoctorController {

    private final AdminDoctorService adminDoctorService;

    @PostMapping
    public ResponseEntity<DoctorDTO> createDoctor(@Valid @RequestBody CreateDoctorRequest request) {
        DoctorDTO doctor = adminDoctorService.createDoctor(request);
        return new ResponseEntity<>(doctor, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<DoctorDTO>> getAllDoctors() {
        List<DoctorDTO> doctors = adminDoctorService.getAllDoctors();
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/active")
    public ResponseEntity<List<DoctorDTO>> getActiveDoctors() {
        List<DoctorDTO> doctors = adminDoctorService.getActiveDoctors();
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorDTO> getDoctorById(@PathVariable Long id) {
        DoctorDTO doctor = adminDoctorService.getDoctorById(id);
        return ResponseEntity.ok(doctor);
    }

    @GetMapping("/specialization/{specialization}")
    public ResponseEntity<List<DoctorDTO>> getDoctorsBySpecialization(@PathVariable String specialization) {
        List<DoctorDTO> doctors = adminDoctorService.getDoctorsBySpecialization(specialization);
        return ResponseEntity.ok(doctors);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoctorDTO> updateDoctor(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDoctorRequest request) {
        DoctorDTO doctor = adminDoctorService.updateDoctor(id, request);
        return ResponseEntity.ok(doctor);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDoctor(@PathVariable Long id) {
        adminDoctorService.deleteDoctor(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<Void> activateDoctor(@PathVariable Long id) {
        adminDoctorService.activateDoctor(id);
        return ResponseEntity.ok().build();
    }
}