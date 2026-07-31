package com.clinic.management.controller;

import com.clinic.management.dto.PatientDTO;
import com.clinic.management.service.AdminPatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/patients")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminPatientController {

    private final AdminPatientService adminPatientService;

    @GetMapping
    public ResponseEntity<List<PatientDTO>> getAllPatients() {
        List<PatientDTO> patients = adminPatientService.getAllPatients();
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/active")
    public ResponseEntity<List<PatientDTO>> getActivePatients() {
        List<PatientDTO> patients = adminPatientService.getActivePatients();
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientDTO> getPatientById(@PathVariable Long id) {
        PatientDTO patient = adminPatientService.getPatientById(id);
        return ResponseEntity.ok(patient);
    }

    @GetMapping("/number/{patientNumber}")
    public ResponseEntity<PatientDTO> getPatientByPatientNumber(@PathVariable String patientNumber) {
        PatientDTO patient = adminPatientService.getPatientByPatientNumber(patientNumber);
        return ResponseEntity.ok(patient);
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivatePatient(@PathVariable Long id) {
        adminPatientService.deactivatePatient(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<Void> activatePatient(@PathVariable Long id) {
        adminPatientService.activatePatient(id);
        return ResponseEntity.ok().build();
    }
}