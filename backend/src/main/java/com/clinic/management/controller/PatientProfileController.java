package com.clinic.management.controller;

import com.clinic.management.dto.PatientDTO;
import com.clinic.management.dto.UpdatePatientProfileRequest;
import com.clinic.management.service.PatientProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patient/profile")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class PatientProfileController {

    private final PatientProfileService profileService;

    @GetMapping
    public ResponseEntity<PatientDTO> getMyProfile() {
        PatientDTO profile = profileService.getMyProfile();
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<PatientDTO> updateMyProfile(@Valid @RequestBody UpdatePatientProfileRequest request) {
        PatientDTO profile = profileService.updateMyProfile(request);
        return ResponseEntity.ok(profile);
    }
}