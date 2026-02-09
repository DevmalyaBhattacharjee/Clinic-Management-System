package com.clinic.management.repository;

import com.clinic.management.entity.Doctor;
import com.clinic.management.entity.MedicalRecord;
import com.clinic.management.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {

    List<MedicalRecord> findByPatient(Patient patient);

    List<MedicalRecord> findByDoctor(Doctor doctor);

    List<MedicalRecord> findByPatientOrderByVisitDateDesc(Patient patient);

    List<MedicalRecord> findByDoctorOrderByVisitDateDesc(Doctor doctor);

    @Query("SELECT mr FROM MedicalRecord mr WHERE mr.doctor.id = :doctorId AND mr.visitDate = :date")
    List<MedicalRecord> findByDoctorIdAndDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);

    @Query("SELECT mr FROM MedicalRecord mr WHERE mr.patient.id = :patientId AND mr.doctor.id = :doctorId ORDER BY mr.visitDate DESC")
    List<MedicalRecord> findByPatientIdAndDoctorId(@Param("patientId") Long patientId, @Param("doctorId") Long doctorId);
}