package com.clinic.management.repository;

import com.clinic.management.entity.Bill;
import com.clinic.management.entity.Patient;
import com.clinic.management.enums.BillStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {

    Optional<Bill> findByBillNumber(String billNumber);

    List<Bill> findByPatient(Patient patient);

    List<Bill> findByPatientOrderByBillDateDesc(Patient patient);

    List<Bill> findByPatientAndStatus(Patient patient, BillStatus status);

    @Query("SELECT b FROM Bill b WHERE b.patient.id = :patientId ORDER BY b.billDate DESC")
    List<Bill> findByPatientIdOrderByDateDesc(@Param("patientId") Long patientId);

    @Query("SELECT b FROM Bill b WHERE b.patient.id = :patientId AND b.status = :status")
    List<Bill> findByPatientIdAndStatus(@Param("patientId") Long patientId, @Param("status") BillStatus status);

    @Query("SELECT SUM(b.finalAmount) FROM Bill b WHERE b.patient.id = :patientId AND b.status = 'UNPAID'")
    Double getTotalOutstandingAmount(@Param("patientId") Long patientId);

    boolean existsByBillNumber(String billNumber);
}