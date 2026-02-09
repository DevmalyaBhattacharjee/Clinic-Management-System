package com.clinic.management.controller;

import com.clinic.management.dto.PatientDTO;
import com.clinic.management.dto.PatientRegistrationRequest;
import com.clinic.management.service.PatientRegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patient")
@RequiredArgsConstructor
public class PatientRegistrationController {

    private final PatientRegistrationService registrationService;

    @PostMapping("/register")
    public ResponseEntity<PatientDTO> register(@Valid @RequestBody PatientRegistrationRequest request) {
        PatientDTO patient = registrationService.registerPatient(request);
        return new ResponseEntity<>(patient, HttpStatus.CREATED);
    }
}