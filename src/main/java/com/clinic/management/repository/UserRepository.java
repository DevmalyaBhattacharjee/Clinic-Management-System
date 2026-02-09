package com.clinic.management.repository;

import com.clinic.management.entity.User;
import com.clinic.management.enums.Role;
import com.clinic.management.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(Role role);

    List<User> findByRoleAndStatus(Role role, UserStatus status);
}