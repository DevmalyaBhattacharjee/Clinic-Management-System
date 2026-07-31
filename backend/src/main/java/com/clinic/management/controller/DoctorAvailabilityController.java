package com.clinic.management.controller;

import com.clinic.management.dto.DoctorAvailabilityDTO;
import com.clinic.management.dto.UpdateAvailabilityRequest;
import com.clinic.management.service.DoctorAvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctor/availability")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorAvailabilityController {

    private final DoctorAvailabilityService availabilityService;

    @PostMapping
    public ResponseEntity<DoctorAvailabilityDTO> updateAvailability(
            @Valid @RequestBody UpdateAvailabilityRequest request) {
        DoctorAvailabilityDTO availability = availabilityService.updateAvailability(request);
        return ResponseEntity.ok(availability);
    }

    @GetMapping
    public ResponseEntity<List<DoctorAvailabilityDTO>> getMyAvailability() {
        List<DoctorAvailabilityDTO> availability = availabilityService.getMyAvailability();
        return ResponseEntity.ok(availability);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<DoctorAvailabilityDTO>> getUpcomingAvailability() {
        List<DoctorAvailabilityDTO> availability = availabilityService.getUpcomingAvailability();
        return ResponseEntity.ok(availability);
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<DoctorAvailabilityDTO> getAvailabilityByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        DoctorAvailabilityDTO availability = availabilityService.getAvailabilityByDate(date);
        return ResponseEntity.ok(availability);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAvailability(@PathVariable Long id) {
        availabilityService.deleteAvailability(id);
        return ResponseEntity.noContent().build();
    }
}