package com.clinic.management.controller;

import com.clinic.management.dto.PatientDTO;
import com.clinic.management.service.DoctorPatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctor/patients")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorPatientController {

    private final DoctorPatientService patientService;

    @GetMapping
    public ResponseEntity<List<PatientDTO>> getMyPatients() {
        List<PatientDTO> patients = patientService.getMyPatients();
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientDTO> getPatientDetails(@PathVariable Long id) {
        PatientDTO patient = patientService.getPatientDetails(id);
        return ResponseEntity.ok(patient);
    }
}