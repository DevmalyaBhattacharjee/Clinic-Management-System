package com.clinic.management.service;

import com.clinic.management.dto.BillDTO;
import com.clinic.management.dto.CreateBillRequest;
import com.clinic.management.dto.UpdateBillPaymentRequest;
import com.clinic.management.entity.Appointment;
import com.clinic.management.entity.Bill;
import com.clinic.management.entity.Patient;
import com.clinic.management.enums.BillStatus;
import com.clinic.management.exception.ResourceNotFoundException;
import com.clinic.management.repository.AppointmentRepository;
import com.clinic.management.repository.BillRepository;
import com.clinic.management.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReceptionistBillingService {

    private final BillRepository billRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;

    @Transactional
    public BillDTO createBill(CreateBillRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        Appointment appointment = null;
        if (request.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(request.getAppointmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        }

        // Generate unique bill number
        String billNumber = generateBillNumber();

        // Calculate amounts
        double consultationFee = request.getConsultationFee() != null ? request.getConsultationFee() : 0.0;
        double medicationCost = request.getMedicationCost() != null ? request.getMedicationCost() : 0.0;
        double labCharges = request.getLabCharges() != null ? request.getLabCharges() : 0.0;
        double otherCharges = request.getOtherCharges() != null ? request.getOtherCharges() : 0.0;

        double totalAmount = consultationFee + medicationCost + labCharges + otherCharges;

        double discount = request.getDiscount() != null ? request.getDiscount() : 0.0;
        double tax = request.getTax() != null ? request.getTax() : 0.0;

        double finalAmount = totalAmount - discount + tax;

        Bill bill = Bill.builder()
                .billNumber(billNumber)
                .patient(patient)
                .appointment(appointment)
                .billDate(request.getBillDate())
                .consultationFee(consultationFee)
                .medicationCost(medicationCost)
                .labCharges(labCharges)
                .otherCharges(otherCharges)
                .totalAmount(totalAmount)
                .discount(discount)
                .tax(tax)
                .finalAmount(finalAmount)
                .status(BillStatus.UNPAID)
                .notes(request.getNotes())
                .build();

        bill = billRepository.save(bill);

        return mapToDTO(bill);
    }

    public List<BillDTO> getAllBills() {
        return billRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<BillDTO> getTodayBills() {
        LocalDate today = LocalDate.now();
        return billRepository.findAll().stream()
                .filter(b -> b.getBillDate().equals(today))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<BillDTO> getUnpaidBills() {
        return billRepository.findAll().stream()
                .filter(b -> b.getStatus() == BillStatus.UNPAID || b.getStatus() == BillStatus.PARTIALLY_PAID)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<BillDTO> getBillsByPatient(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        return billRepository.findByPatientOrderByBillDateDesc(patient).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public BillDTO getBillById(Long id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));
        return mapToDTO(bill);
    }

    public BillDTO getBillByNumber(String billNumber) {
        Bill bill = billRepository.findByBillNumber(billNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with number: " + billNumber));
        return mapToDTO(bill);
    }

    @Transactional
    public BillDTO updatePaymentStatus(Long id, UpdateBillPaymentRequest request) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));

        bill.setStatus(request.getStatus());

        if (request.getPaymentMethod() != null) {
            bill.setPaymentMethod(request.getPaymentMethod());
        }

        if (request.getPaymentDate() != null) {
            bill.setPaymentDate(request.getPaymentDate());
        } else if (request.getStatus() == BillStatus.PAID) {
            bill.setPaymentDate(LocalDate.now());
        }

        if (request.getTransactionId() != null) {
            bill.setTransactionId(request.getTransactionId());
        }

        if (request.getNotes() != null) {
            bill.setNotes(request.getNotes());
        }

        bill = billRepository.save(bill);

        return mapToDTO(bill);
    }

    public Double getPatientOutstanding(Long patientId) {
        Double amount = billRepository.getTotalOutstandingAmount(patientId);
        return amount != null ? amount : 0.0;
    }

    private String generateBillNumber() {
        String prefix = "BILL";
        String year = String.valueOf(LocalDate.now().getYear());
        String month = String.format("%02d", LocalDate.now().getMonthValue());
        String unique = UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        String billNumber = prefix + year + month + unique;

        // Ensure uniqueness
        while (billRepository.existsByBillNumber(billNumber)) {
            unique = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
            billNumber = prefix + year + month + unique;
        }

        return billNumber;
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