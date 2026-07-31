package com.clinic.management.dto;

import com.clinic.management.enums.DayOfWeek;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class UpdateAvailabilityRequest {

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotNull(message = "Day of week is required")
    private DayOfWeek dayOfWeek;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotNull(message = "Availability status is required")
    private Boolean isAvailable;

    private String reason;
}