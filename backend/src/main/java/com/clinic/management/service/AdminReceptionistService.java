package com.clinic.management.service;

import com.clinic.management.dto.CreateReceptionistRequest;
import com.clinic.management.dto.ReceptionistDTO;
import com.clinic.management.dto.UpdateReceptionistRequest;
import com.clinic.management.entity.Receptionist;
import com.clinic.management.entity.User;
import com.clinic.management.enums.Role;
import com.clinic.management.enums.UserStatus;
import com.clinic.management.exception.ResourceNotFoundException;
import com.clinic.management.repository.ReceptionistRepository;
import com.clinic.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminReceptionistService {

    private final ReceptionistRepository receptionistRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public ReceptionistDTO createReceptionist(CreateReceptionistRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Check if employee ID already exists
        if (receptionistRepository.existsByEmployeeId(request.getEmployeeId())) {
            throw new IllegalArgumentException("Employee ID already exists");
        }

        // Create User
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .address(request.getAddress())
                .role(Role.RECEPTIONIST)
                .status(UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);

        // Create Receptionist
        Receptionist receptionist = Receptionist.builder()
                .user(user)
                .employeeId(request.getEmployeeId())
                .shiftStart(request.getShiftStart())
                .shiftEnd(request.getShiftEnd())
                .build();

        receptionist = receptionistRepository.save(receptionist);

        return mapToDTO(receptionist);
    }

    public List<ReceptionistDTO> getAllReceptionists() {
        return receptionistRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ReceptionistDTO> getActiveReceptionists() {
        return receptionistRepository.findAllActiveReceptionists().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ReceptionistDTO getReceptionistById(Long id) {
        Receptionist receptionist = receptionistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receptionist not found with id: " + id));
        return mapToDTO(receptionist);
    }

    @Transactional
    public ReceptionistDTO updateReceptionist(Long id, UpdateReceptionistRequest request) {
        Receptionist receptionist = receptionistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receptionist not found with id: " + id));

        User user = receptionist.getUser();

        // Update User fields if provided
        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        // Update Receptionist fields if provided
        if (request.getShiftStart() != null) {
            receptionist.setShiftStart(request.getShiftStart());
        }
        if (request.getShiftEnd() != null) {
            receptionist.setShiftEnd(request.getShiftEnd());
        }

        userRepository.save(user);
        receptionist = receptionistRepository.save(receptionist);

        return mapToDTO(receptionist);
    }

    @Transactional
    public void deleteReceptionist(Long id) {
        Receptionist receptionist = receptionistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receptionist not found with id: " + id));

        // Soft delete
        receptionist.getUser().setStatus(UserStatus.INACTIVE);
        userRepository.save(receptionist.getUser());
    }

    @Transactional
    public void activateReceptionist(Long id) {
        Receptionist receptionist = receptionistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receptionist not found with id: " + id));

        receptionist.getUser().setStatus(UserStatus.ACTIVE);
        userRepository.save(receptionist.getUser());
    }

    private ReceptionistDTO mapToDTO(Receptionist receptionist) {
        return ReceptionistDTO.builder()
                .id(receptionist.getId())
                .userId(receptionist.getUser().getId())
                .name(receptionist.getUser().getName())
                .email(receptionist.getUser().getEmail())
                .phone(receptionist.getUser().getPhone())
                .address(receptionist.getUser().getAddress())
                .employeeId(receptionist.getEmployeeId())
                .shiftStart(receptionist.getShiftStart())
                .shiftEnd(receptionist.getShiftEnd())
                .status(receptionist.getUser().getStatus())
                .createdAt(receptionist.getCreatedAt())
                .build();
    }
}