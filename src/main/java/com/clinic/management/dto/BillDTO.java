package com.clinic.management.dto;

import com.clinic.management.enums.BillStatus;
import com.clinic.management.enums.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillDTO {
    private Long id;
    private String billNumber;
    private Long patientId;
    private String patientName;
    private String patientNumber;
    private Long appointmentId;
    private LocalDate billDate;
    private Double consultationFee;
    private Double medicationCost;
    private Double labCharges;
    private Double otherCharges;
    private Double totalAmount;
    private Double discount;
    private Double tax;
    private Double finalAmount;
    private BillStatus status;
    private PaymentMethod paymentMethod;
    private LocalDate paymentDate;
    private String transactionId;
    private String notes;
    private LocalDateTime createdAt;
}