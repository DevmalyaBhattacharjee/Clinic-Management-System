package com.clinic.management.repository;

import com.clinic.management.entity.Receptionist;
import com.clinic.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReceptionistRepository extends JpaRepository<Receptionist, Long> {

    Optional<Receptionist> findByUser(User user);

    Optional<Receptionist> findByUserId(Long userId);

    boolean existsByEmployeeId(String employeeId);

    @Query("SELECT r FROM Receptionist r WHERE r.user.status = 'ACTIVE'")
    List<Receptionist> findAllActiveReceptionists();
}