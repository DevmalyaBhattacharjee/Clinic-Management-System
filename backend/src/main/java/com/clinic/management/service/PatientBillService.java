package com.clinic.management.service;

import com.clinic.management.dto.BillDTO;
import com.clinic.management.entity.Bill;
import com.clinic.management.entity.Patient;
import com.clinic.management.enums.BillStatus;
import com.clinic.management.exception.ResourceNotFoundException;
import com.clinic.management.repository.BillRepository;
import com.clinic.management.repository.PatientRepository;
import com.clinic.management.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientBillService {

    private final BillRepository billRepository;
    private final PatientRepository patientRepository;

    private Patient getCurrentPatient() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        return patientRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
    }

    public List<BillDTO> getMyBills() {
        Patient patient = getCurrentPatient();
        return billRepository.findByPatientOrderByBillDateDesc(patient).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<BillDTO> getMyUnpaidBills() {
        Patient patient = getCurrentPatient();
        return billRepository.findByPatientIdAndStatus(patient.getId(), BillStatus.UNPAID).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<BillDTO> getMyPaidBills() {
        Patient patient = getCurrentPatient();
        return billRepository.findByPatientIdAndStatus(patient.getId(), BillStatus.PAID).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public BillDTO getBillById(Long id) {
        Patient patient = getCurrentPatient();

        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));

        // Ensure this bill belongs to the current patient
        if (!bill.getPatient().getId().equals(patient.getId())) {
            throw new IllegalArgumentException("You can only view your own bills");
        }

        return mapToDTO(bill);
    }

    public BillDTO getBillByNumber(String billNumber) {
        Patient patient = getCurrentPatient();

        Bill bill = billRepository.findByBillNumber(billNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with number: " + billNumber));

        if (!bill.getPatient().getId().equals(patient.getId())) {
            throw new IllegalArgumentException("You can only view your own bills");
        }

        return mapToDTO(bill);
    }

    public Double getMyOutstandingAmount() {
        Patient patient = getCurrentPatient();
        Double amount = billRepository.getTotalOutstandingAmount(patient.getId());
        return amount != null ? amount : 0.0;
    }

    private BillDTO mapToDTO(Bill bill) {
        return BillDTO.builder()
                .id(bill.getId())
                .billNumber(bill.getBillNumber())
                .patientId(bill.getPatient().getId())
                .patientName(bill.getPatient().getUser().getName())
                .patientNumber(bill.getPatient().getPatientNumber())
                .appointmentId(bill.getAppointment() != null ? bill.getAppointment().getId() : null)
                .billDate(bill.getBillDate())
                .consultationFee(bill.getConsultationFee())
                .medicationCost(bill.getMedicationCost())
                .labCharges(bill.getLabCharges())
                .otherCharges(bill.getOtherCharges())
                .totalAmount(bill.getTotalAmount())
                .discount(bill.getDiscount())
                .tax(bill.getTax())
                .finalAmount(bill.getFinalAmount())
                .status(bill.getStatus())
                .paymentMethod(bill.getPaymentMethod())
                .paymentDate(bill.getPaymentDate())
                .transactionId(bill.getTransactionId())
                .notes(bill.getNotes())
                .createdAt(bill.getCreatedAt())
                .build();
    }
}