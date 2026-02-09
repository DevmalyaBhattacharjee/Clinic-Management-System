package com.clinic.management.controller;

import com.clinic.management.dto.CreateMedicalRecordRequest;
import com.clinic.management.dto.MedicalRecordDTO;
import com.clinic.management.dto.UpdateMedicalRecordRequest;
import com.clinic.management.service.DoctorMedicalRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctor/medical-records")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorMedicalRecordController {

    private final DoctorMedicalRecordService medicalRecordService;

    @PostMapping
    public ResponseEntity<MedicalRecordDTO> createMedicalRecord(
            @Valid @RequestBody CreateMedicalRecordRequest request) {
        MedicalRecordDTO medicalRecord = medicalRecordService.createMedicalRecord(request);
        return new ResponseEntity<>(medicalRecord, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<MedicalRecordDTO>> getMyMedicalRecords() {
        List<MedicalRecordDTO> records = medicalRecordService.getMyMedicalRecords();
        return ResponseEntity.ok(records);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalRecordDTO> getMedicalRecordById(@PathVariable Long id) {
        MedicalRecordDTO record = medicalRecordService.getMedicalRecordById(id);
        return ResponseEntity.ok(record);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicalRecordDTO>> getPatientMedicalRecords(@PathVariable Long patientId) {
        List<MedicalRecordDTO> records = medicalRecordService.getPatientMedicalRecords(patientId);
        return ResponseEntity.ok(records);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicalRecordDTO> updateMedicalRecord(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMedicalRecordRequest request) {
        MedicalRecordDTO record = medicalRecordService.updateMedicalRecord(id, request);
        return ResponseEntity.ok(record);
    }
}