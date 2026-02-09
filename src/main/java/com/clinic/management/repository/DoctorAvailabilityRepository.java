package com.clinic.management.repository;

import com.clinic.management.entity.Doctor;
import com.clinic.management.entity.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {

    List<DoctorAvailability> findByDoctor(Doctor doctor);

    Optional<DoctorAvailability> findByDoctorAndDate(Doctor doctor, LocalDate date);

    List<DoctorAvailability> findByDoctorAndDateBetween(Doctor doctor, LocalDate startDate, LocalDate endDate);

    @Query("SELECT da FROM DoctorAvailability da WHERE da.doctor.id = :doctorId AND da.date >= :startDate ORDER BY da.date")
    List<DoctorAvailability> findUpcomingAvailability(@Param("doctorId") Long doctorId, @Param("startDate") LocalDate startDate);

    @Query("SELECT da FROM DoctorAvailability da WHERE da.doctor.id = :doctorId AND da.date = :date AND da.isAvailable = true")
    Optional<DoctorAvailability> findAvailableSlot(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);
}