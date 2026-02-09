package com.clinic.management.controller;

import com.clinic.management.dto.MedicalRecordDTO;
import com.clinic.management.service.PatientMedicalRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patient/medical-records")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class PatientMedicalRecordController {

    private final PatientMedicalRecordService medicalRecordService;

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
}