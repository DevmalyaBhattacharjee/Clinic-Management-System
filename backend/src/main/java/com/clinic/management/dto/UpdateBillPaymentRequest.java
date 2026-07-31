package com.clinic.management.dto;

import com.clinic.management.enums.BillStatus;
import com.clinic.management.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateBillPaymentRequest {

    @NotNull(message = "Payment status is required")
    private BillStatus status;

    private PaymentMethod paymentMethod;

    private LocalDate paymentDate;

    private String transactionId;

    private String notes;
}