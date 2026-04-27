# 🏥 AI-Enabled Clinic Management System 

## 📌 Overview

The **AI-Enabled Hospital Management System (HMS)** is a full-stack web application designed to streamline hospital operations by managing patients, doctors, and administrative workflows efficiently.

This system supports **role-based access (Patient, Doctor, Admin)** and provides features like appointment booking, prescription management, and medical record tracking.
An AI layer will be integrated in future phases to enhance automation and decision-making.

---

## 🚀 Features

### 👤 Patient

* Register & Login
* View doctors & availability
* Book appointments
* View appointment history
* Access basic health records
* Download prescriptions (PDF)

### 👨‍⚕️ Doctor

* View appointments
* Access patient details & history
* Add diagnosis & notes
* Generate prescriptions

### 🧑‍💼 Admin

* Manage doctors
* Manage doctor availability
* View all appointments
* Monitor system activity

### 📅 Appointment System

* Slot-based booking
* Prevent double booking
* Appointment status tracking

### 📄 Prescription

* Create and store prescriptions
* Generate downloadable PDF

### 🔐 Authentication & Security

* JWT-based authentication
* Role-Based Access Control (RBAC)
* Secure password hashing

---

## 🛠️ Tech Stack

### Backend

* Java + Spring Boot
* Spring Security (JWT)
* JPA / Hibernate
* PostgreSQL

### Frontend

* React.js

### AI (Planned)

* OpenAI API (via Spring AI)

---

## 🧩 Project Structure

### Backend

```
com.hms
 ├── controller
 ├── service
 ├── repository
 ├── entity
 ├── dto
 ├── security
 ├── config
 └── exception
```

### Frontend

```
src/
 ├── pages/
 ├── components/
 ├── services/api/
 ├── hooks/
 ├── context/
 └── utils/
```

---

## ⚙️ Setup Instructions

### Prerequisites

* Java 17+
* Maven
* PostgreSQL
* Node.js & npm

---

### 🔧 Backend Setup

1. Clone the repository
2. Configure `application.properties`:

```
spring.datasource.url=jdbc:postgresql://localhost:5432/hms
spring.datasource.username=your_username
spring.datasource.password=your_password

jwt.secret=your_secret_key
```

3. Run the application:

```
mvn spring-boot:run
```

---

### 💻 Frontend Setup

```
cd frontend
npm install
npm start
```

---

## 🔑 API Modules

* Auth APIs (`/auth`)
* Patient APIs (`/patients`)
* Doctor APIs (`/doctor`)
* Admin APIs (`/admin`)
* Appointment APIs (`/appointments`)
* Prescription APIs (`/prescriptions`)

---

## 📊 Database Design (High-Level)

* Users (role-based)
* Patients
* Doctors
* Appointments
* Availability
* Prescriptions

---

## 🤖 AI Features (Upcoming)

* Symptom-based chatbot
* AI-generated prescription assistance
* Voice-to-text prescription generation
* Doctor recommendation system

---

## 🔮 Future Enhancements

* Telemedicine (video consultation)
* Payment integration
* Email/SMS notifications
* Advanced analytics dashboard
* Export reports (PDF/Excel)
* Multi-hospital support

---

## 🔐 Security Considerations

* JWT authentication
* Password encryption (BCrypt)
* Role-based access control
* Secure API endpoints

---

## 🧪 Testing

* Use Postman for API testing
* Validate all role-based flows

---

## 📌 Status

🚧 MVP in development
🔜 AI integration planned

---

## 🤝 Contribution

Contributions are welcome! Feel free to fork the repo and submit pull requests.

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙌 Acknowledgement

Built as a full-stack project to solve real-world hospital workflow challenges and to integrate AI-driven healthcare solutions.

## Author
Debolina Roy
Devmalya Bhattacharjee
---
