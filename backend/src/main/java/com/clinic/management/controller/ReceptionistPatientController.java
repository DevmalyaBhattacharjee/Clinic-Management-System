package com.clinic.management.controller;

import com.clinic.management.dto.PatientDTO;
import com.clinic.management.dto.WalkInPatientRegistrationRequest;
import com.clinic.management.service.ReceptionistPatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/receptionist/patients")
@RequiredArgsConstructor
@PreAuthorize("hasRole('RECEPTIONIST')")
public class ReceptionistPatientController {

    private final ReceptionistPatientService patientService;

    @PostMapping("/register")
    public ResponseEntity<PatientDTO> registerWalkInPatient(
            @Valid @RequestBody WalkInPatientRegistrationRequest request) {
        PatientDTO patient = patientService.registerWalkInPatient(request);
        return new ResponseEntity<>(patient, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PatientDTO>> getAllPatients() {
        List<PatientDTO> patients = patientService.getAllPatients();
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/search")
    public ResponseEntity<List<PatientDTO>> searchPatientsByName(@RequestParam String name) {
        List<PatientDTO> patients = patientService.searchPatientsByName(name);
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientDTO> getPatientById(@PathVariable Long id) {
        PatientDTO patient = patientService.getPatientById(id);
        return ResponseEntity.ok(patient);
    }

    @GetMapping("/number/{patientNumber}")
    public ResponseEntity<PatientDTO> getPatientByPatientNumber(@PathVariable String patientNumber) {
        PatientDTO patient = patientService.getPatientByPatientNumber(patientNumber);
        return ResponseEntity.ok(patient);
    }
}