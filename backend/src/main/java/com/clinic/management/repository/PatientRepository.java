package com.clinic.management.repository;

import com.clinic.management.entity.Patient;
import com.clinic.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByUser(User user);

    Optional<Patient> findByUserId(Long userId);

    Optional<Patient> findByPatientNumber(String patientNumber);

    boolean existsByPatientNumber(String patientNumber);

    @Query("SELECT p FROM Patient p WHERE p.user.status = 'ACTIVE'")
    List<Patient> findAllActivePatients();
}