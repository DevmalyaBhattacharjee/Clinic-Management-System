package com.clinic.management.repository;

import com.clinic.management.entity.Appointment;
import com.clinic.management.entity.Doctor;
import com.clinic.management.entity.Patient;
import com.clinic.management.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatient(Patient patient);

    List<Appointment> findByDoctor(Doctor doctor);

    List<Appointment> findByAppointmentDate(LocalDate date);

    List<Appointment> findByStatus(AppointmentStatus status);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :date")
    List<Appointment> findByDoctorIdAndDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId AND a.status = :status")
    List<Appointment> findByPatientIdAndStatus(@Param("patientId") Long patientId, @Param("status") AppointmentStatus status);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :date AND a.status != 'CANCELLED'")
    Long countByDoctorIdAndDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);
}