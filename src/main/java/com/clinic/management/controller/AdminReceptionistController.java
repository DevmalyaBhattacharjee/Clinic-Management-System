package com.clinic.management.controller;

import com.clinic.management.dto.CreateReceptionistRequest;
import com.clinic.management.dto.ReceptionistDTO;
import com.clinic.management.dto.UpdateReceptionistRequest;
import com.clinic.management.service.AdminReceptionistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/receptionists")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminReceptionistController {

    private final AdminReceptionistService adminReceptionistService;

    @PostMapping
    public ResponseEntity<ReceptionistDTO> createReceptionist(@Valid @RequestBody CreateReceptionistRequest request) {
        ReceptionistDTO receptionist = adminReceptionistService.createReceptionist(request);
        return new ResponseEntity<>(receptionist, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ReceptionistDTO>> getAllReceptionists() {
        List<ReceptionistDTO> receptionists = adminReceptionistService.getAllReceptionists();
        return ResponseEntity.ok(receptionists);
    }

    @GetMapping("/active")
    public ResponseEntity<List<ReceptionistDTO>> getActiveReceptionists() {
        List<ReceptionistDTO> receptionists = adminReceptionistService.getActiveReceptionists();
        return ResponseEntity.ok(receptionists);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReceptionistDTO> getReceptionistById(@PathVariable Long id) {
        ReceptionistDTO receptionist = adminReceptionistService.getReceptionistById(id);
        return ResponseEntity.ok(receptionist);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReceptionistDTO> updateReceptionist(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReceptionistRequest request) {
        ReceptionistDTO receptionist = adminReceptionistService.updateReceptionist(id, request);
        return ResponseEntity.ok(receptionist);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReceptionist(@PathVariable Long id) {
        adminReceptionistService.deleteReceptionist(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<Void> activateReceptionist(@PathVariable Long id) {
        adminReceptionistService.activateReceptionist(id);
        return ResponseEntity.ok().build();
    }
}