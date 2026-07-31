package com.clinic.management.repository;

import com.clinic.management.entity.Doctor;
import com.clinic.management.entity.MedicalRecord;
import com.clinic.management.entity.Patient;
import com.clinic.management.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    List<Prescription> findByPatient(Patient patient);

    List<Prescription> findByDoctor(Doctor doctor);

    List<Prescription> findByMedicalRecord(MedicalRecord medicalRecord);

    List<Prescription> findByPatientAndIsActiveTrue(Patient patient);

    @Query("SELECT p FROM Prescription p WHERE p.doctor.id = :doctorId ORDER BY p.prescriptionDate DESC")
    List<Prescription> findByDoctorIdOrderByDateDesc(@Param("doctorId") Long doctorId);

    @Query("SELECT p FROM Prescription p WHERE p.patient.id = :patientId ORDER BY p.prescriptionDate DESC")
    List<Prescription> findByPatientIdOrderByDateDesc(@Param("patientId") Long patientId);
}