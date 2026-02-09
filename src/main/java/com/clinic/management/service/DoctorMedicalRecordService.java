package com.clinic.management.service;

import com.clinic.management.dto.CreateMedicalRecordRequest;
import com.clinic.management.dto.MedicalRecordDTO;
import com.clinic.management.dto.UpdateMedicalRecordRequest;
import com.clinic.management.entity.*;
import com.clinic.management.enums.AppointmentStatus;
import com.clinic.management.exception.ResourceNotFoundException;
import com.clinic.management.repository.*;
import com.clinic.management.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorMedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;

    private Doctor getCurrentDoctor() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        return doctorRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
    }

    @Transactional
    public MedicalRecordDTO createMedicalRecord(CreateMedicalRecordRequest request) {
        Doctor doctor = getCurrentDoctor();

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        // Verify the appointment belongs to this doctor
        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            throw new IllegalArgumentException("You can only create records for your own appointments");
        }

        // Verify the appointment is for this patient
        if (!appointment.getPatient().getId().equals(patient.getId())) {
            throw new IllegalArgumentException("Appointment does not belong to the specified patient");
        }

        MedicalRecord medicalRecord = MedicalRecord.builder()
                .patient(patient)
                .doctor(doctor)
                .appointment(appointment)
                .visitDate(request.getVisitDate())
                .chiefComplaint(request.getChiefComplaint())
                .symptoms(request.getSymptoms())
                .diagnosis(request.getDiagnosis())
                .treatmentPlan(request.getTreatmentPlan())
                .labTests(request.getLabTests())
                .vitalSigns(request.getVitalSigns())
                .notes(request.getNotes())
                .followUpDate(request.getFollowUpDate())
                .build();

        medicalRecord = medicalRecordRepository.save(medicalRecord);

        // Update appointment status to COMPLETED
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);

        return mapToDTO(medicalRecord);
    }

    public List<MedicalRecordDTO> getMyMedicalRecords() {
        Doctor doctor = getCurrentDoctor();
        return medicalRecordRepository.findByDoctorOrderByVisitDateDesc(doctor).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<MedicalRecordDTO> getPatientMedicalRecords(Long patientId) {
        Doctor doctor = getCurrentDoctor();

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        // Get records created by this doctor for this patient
        return medicalRecordRepository.findByPatientIdAndDoctorId(patientId, doctor.getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public MedicalRecordDTO getMedicalRecordById(Long id) {
        Doctor doctor = getCurrentDoctor();

        MedicalRecord medicalRecord = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found"));

        // Verify this record belongs to the current doctor
        if (!medicalRecord.getDoctor().getId().equals(doctor.getId())) {
            throw new IllegalArgumentException("You can only view your own medical records");
        }

        return mapToDTO(medicalRecord);
    }

    @Transactional
    public MedicalRecordDTO updateMedicalRecord(Long id, UpdateMedicalRecordRequest request) {
        Doctor doctor = getCurrentDoctor();

        MedicalRecord medicalRecord = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found"));

        if (!medicalRecord.getDoctor().getId().equals(doctor.getId())) {
            throw new IllegalArgumentException("You can only update your own medical records");
        }

        // Update fields if provided
        if (request.getChiefComplaint() != null) {
            medicalRecord.setChiefComplaint(request.getChiefComplaint());
        }
        if (request.getSymptoms() != null) {
            medicalRecord.setSymptoms(request.getSymptoms());
        }
        if (request.getDiagnosis() != null) {
            medicalRecord.setDiagnosis(request.getDiagnosis());
        }
        if (request.getTreatmentPlan() != null) {
            medicalRecord.setTreatmentPlan(request.getTreatmentPlan());
        }
        if (request.getLabTests() != null) {
            medicalRecord.setLabTests(request.getLabTests());
        }
        if (request.getVitalSigns() != null) {
            medicalRecord.setVitalSigns(request.getVitalSigns());
        }
        if (request.getNotes() != null) {
            medicalRecord.setNotes(request.getNotes());
        }
        if (request.getFollowUpDate() != null) {
            medicalRecord.setFollowUpDate(request.getFollowUpDate());
        }

        medicalRecord = medicalRecordRepository.save(medicalRecord);

        return mapToDTO(medicalRecord);
    }

    private MedicalRecordDTO mapToDTO(MedicalRecord record) {
        return MedicalRecordDTO.builder()
                .id(record.getId())
                .patientId(record.getPatient().getId())
                .patientName(record.getPatient().getUser().getName())
                .patientNumber(record.getPatient().getPatientNumber())
                .doctorId(record.getDoctor().getId())
                .doctorName(record.getDoctor().getUser().getName())
                .appointmentId(record.getAppointment() != null ? record.getAppointment().getId() : null)
                .visitDate(record.getVisitDate())
                .chiefComplaint(record.getChiefComplaint())
                .symptoms(record.getSymptoms())
                .diagnosis(record.getDiagnosis())
                .treatmentPlan(record.getTreatmentPlan())
                .labTests(record.getLabTests())
                .vitalSigns(record.getVitalSigns())
                .notes(record.getNotes())
                .followUpDate(record.getFollowUpDate())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
    }
}