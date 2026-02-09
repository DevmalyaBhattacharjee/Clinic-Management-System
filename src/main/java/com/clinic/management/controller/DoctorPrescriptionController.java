package com.clinic.management.controller;

import com.clinic.management.dto.CreatePrescriptionRequest;
import com.clinic.management.dto.PrescriptionDTO;
import com.clinic.management.dto.UpdatePrescriptionRequest;
import com.clinic.management.service.DoctorPrescriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctor/prescriptions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorPrescriptionController {

    private final DoctorPrescriptionService prescriptionService;

    @PostMapping
    public ResponseEntity<PrescriptionDTO> createPrescription(
            @Valid @RequestBody CreatePrescriptionRequest request) {
        PrescriptionDTO prescription = prescriptionService.createPrescription(request);
        return new ResponseEntity<>(prescription, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PrescriptionDTO>> getMyPrescriptions() {
        List<PrescriptionDTO> prescriptions = prescriptionService.getMyPrescriptions();
        return ResponseEntity.ok(prescriptions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrescriptionDTO> getPrescriptionById(@PathVariable Long id) {
        PrescriptionDTO prescription = prescriptionService.getPrescriptionById(id);
        return ResponseEntity.ok(prescription);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<PrescriptionDTO>> getPatientPrescriptions(@PathVariable Long patientId) {
        List<PrescriptionDTO> prescriptions = prescriptionService.getPatientPrescriptions(patientId);
        return ResponseEntity.ok(prescriptions);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PrescriptionDTO> updatePrescription(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePrescriptionRequest request) {
        PrescriptionDTO prescription = prescriptionService.updatePrescription(id, request);
        return ResponseEntity.ok(prescription);
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivatePrescription(@PathVariable Long id) {
        prescriptionService.deactivatePrescription(id);
        return ResponseEntity.ok().build();
    }
}