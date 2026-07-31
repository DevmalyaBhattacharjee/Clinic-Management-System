package com.clinic.management.entity;

import com.clinic.management.enums.BillStatus;
import com.clinic.management.enums.PaymentMethod;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "bills", indexes = {
        @Index(name = "idx_bill_patient", columnList = "patient_id"),
        @Index(name = "idx_bill_appointment", columnList = "appointment_id"),
        @Index(name = "idx_bill_status", columnList = "status"),
        @Index(name = "idx_bill_number", columnList = "bill_number")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bill extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bill_number", unique = true, nullable = false, length = 50)
    private String billNumber;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @OneToOne
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @Column(name = "bill_date", nullable = false)
    private LocalDate billDate;

    @Column(name = "consultation_fee")
    private Double consultationFee;

    @Column(name = "medication_cost")
    private Double medicationCost;

    @Column(name = "lab_charges")
    private Double labCharges;

    @Column(name = "other_charges")
    private Double otherCharges;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "discount")
    private Double discount;

    @Column(name = "tax")
    private Double tax;

    @Column(name = "final_amount", nullable = false)
    private Double finalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private BillStatus status = BillStatus.UNPAID;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 20)
    private PaymentMethod paymentMethod;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "transaction_id", length = 100)
    private String transactionId;

    @Column(length = 1000)
    private String notes;
}