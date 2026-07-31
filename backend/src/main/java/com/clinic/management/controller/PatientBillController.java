package com.clinic.management.controller;

import com.clinic.management.dto.BillDTO;
import com.clinic.management.service.PatientBillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patient/bills")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class PatientBillController {

    private final PatientBillService billService;

    @GetMapping
    public ResponseEntity<List<BillDTO>> getMyBills() {
        List<BillDTO> bills = billService.getMyBills();
        return ResponseEntity.ok(bills);
    }

    @GetMapping("/unpaid")
    public ResponseEntity<List<BillDTO>> getUnpaidBills() {
        List<BillDTO> bills = billService.getMyUnpaidBills();
        return ResponseEntity.ok(bills);
    }

    @GetMapping("/paid")
    public ResponseEntity<List<BillDTO>> getPaidBills() {
        List<BillDTO> bills = billService.getMyPaidBills();
        return ResponseEntity.ok(bills);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BillDTO> getBillById(@PathVariable Long id) {
        BillDTO bill = billService.getBillById(id);
        return ResponseEntity.ok(bill);
    }

    @GetMapping("/number/{billNumber}")
    public ResponseEntity<BillDTO> getBillByNumber(@PathVariable String billNumber) {
        BillDTO bill = billService.getBillByNumber(billNumber);
        return ResponseEntity.ok(bill);
    }

    @GetMapping("/outstanding")
    public ResponseEntity<Double> getOutstandingAmount() {
        Double amount = billService.getMyOutstandingAmount();
        return ResponseEntity.ok(amount);
    }
}