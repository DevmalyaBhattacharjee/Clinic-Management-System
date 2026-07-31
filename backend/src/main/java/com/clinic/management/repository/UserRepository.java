package com.clinic.management.repository;

import com.clinic.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByResetToken(String resetToken);

    Optional<User> findByGoogleId(String googleId);

    @Modifying
    @Query("UPDATE User u SET u.resetToken = NULL, u.resetTokenExpiry = NULL " +
           "WHERE u.resetTokenExpiry IS NOT NULL AND u.resetTokenExpiry < :now")
    int purgeExpiredTokens(LocalDateTime now);
}
