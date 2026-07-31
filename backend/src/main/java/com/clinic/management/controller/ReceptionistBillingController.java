package com.clinic.management.controller;

import com.clinic.management.dto.BillDTO;
import com.clinic.management.dto.CreateBillRequest;
import com.clinic.management.dto.UpdateBillPaymentRequest;
import com.clinic.management.service.ReceptionistBillingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/receptionist/bills")
@RequiredArgsConstructor
@PreAuthorize("hasRole('RECEPTIONIST')")
public class ReceptionistBillingController {

    private final ReceptionistBillingService billingService;

    @PostMapping
    public ResponseEntity<BillDTO> createBill(@Valid @RequestBody CreateBillRequest request) {
        BillDTO bill = billingService.createBill(request);
        return new ResponseEntity<>(bill, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BillDTO>> getAllBills() {
        List<BillDTO> bills = billingService.getAllBills();
        return ResponseEntity.ok(bills);
    }

    @GetMapping("/today")
    public ResponseEntity<List<BillDTO>> getTodayBills() {
        List<BillDTO> bills = billingService.getTodayBills();
        return ResponseEntity.ok(bills);
    }

    @GetMapping("/unpaid")
    public ResponseEntity<List<BillDTO>> getUnpaidBills() {
        List<BillDTO> bills = billingService.getUnpaidBills();
        return ResponseEntity.ok(bills);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<BillDTO>> getBillsByPatient(@PathVariable Long patientId) {
        List<BillDTO> bills = billingService.getBillsByPatient(patientId);
        return ResponseEntity.ok(bills);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BillDTO> getBillById(@PathVariable Long id) {
        BillDTO bill = billingService.getBillById(id);
        return ResponseEntity.ok(bill);
    }

    @GetMapping("/number/{billNumber}")
    public ResponseEntity<BillDTO> getBillByNumber(@PathVariable String billNumber) {
        BillDTO bill = billingService.getBillByNumber(billNumber);
        return ResponseEntity.ok(bill);
    }

    @PutMapping("/{id}/payment")
    public ResponseEntity<BillDTO> updatePaymentStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBillPaymentRequest request) {
        BillDTO bill = billingService.updatePaymentStatus(id, request);
        return ResponseEntity.ok(bill);
    }

    @GetMapping("/patient/{patientId}/outstanding")
    public ResponseEntity<Double> getPatientOutstanding(@PathVariable Long patientId) {
        Double outstanding = billingService.getPatientOutstanding(patientId);
        return ResponseEntity.ok(outstanding);
    }
}