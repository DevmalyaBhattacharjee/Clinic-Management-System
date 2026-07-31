package com.clinic.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TodayAppointmentSummaryDTO {
    private Long totalAppointments;
    private Long scheduledAppointments;
    private Long confirmedAppointments;
    private Long inProgressAppointments;
    private Long completedAppointments;
    private Long cancelledAppointments;
    private Long noShowAppointments;
}