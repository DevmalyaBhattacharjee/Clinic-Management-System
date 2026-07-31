package com.clinic.management.controller;

import com.clinic.management.dto.PrescriptionDTO;
import com.clinic.management.service.PatientPrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patient/prescriptions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class PatientPrescriptionController {

    private final PatientPrescriptionService prescriptionService;

    @GetMapping
    public ResponseEntity<List<PrescriptionDTO>> getMyPrescriptions() {
        List<PrescriptionDTO> prescriptions = prescriptionService.getMyPrescriptions();
        return ResponseEntity.ok(prescriptions);
    }

    @GetMapping("/active")
    public ResponseEntity<List<PrescriptionDTO>> getActivePrescriptions() {
        List<PrescriptionDTO> prescriptions = prescriptionService.getMyActivePrescriptions();
        return ResponseEntity.ok(prescriptions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrescriptionDTO> getPrescriptionById(@PathVariable Long id) {
        PrescriptionDTO prescription = prescriptionService.getPrescriptionById(id);
        return ResponseEntity.ok(prescription);
    }
}