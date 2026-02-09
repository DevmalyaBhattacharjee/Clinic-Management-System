package com.clinic.management.dto;

import com.clinic.management.enums.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateAppointmentStatusRequest {

    @NotNull(message = "Status is required")
    private AppointmentStatus status;

    private String notes;
}