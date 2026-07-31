package com.clinic.management.repository;

import com.clinic.management.entity.Doctor;
import com.clinic.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByUser(User user);

    Optional<Doctor> findByUserId(Long userId);

    boolean existsByLicenseNumber(String licenseNumber);

    List<Doctor> findBySpecialization(String specialization);

    @Query("SELECT d FROM Doctor d WHERE d.user.status = 'ACTIVE'")
    List<Doctor> findAllActiveDoctors();
}