# 🏥 MediCure - Clinic Management System

A modern full-stack **Clinic Management System** built with **Spring Boot**, **React**, and **MySQL** to streamline clinic operations. The application provides secure role-based access for **Admin**, **Doctor**, **Patient**, and **Receptionist**, along with appointment scheduling, patient record management, digital prescriptions, authentication, and an architecture ready for seamline healthcare features.

---

# 📖 Overview

The Clinic Management System is designed to simplify and digitize day-to-day clinic workflows by providing a centralized platform for managing appointments, patients, doctors, prescriptions, billing, and administrative operations.

The backend is fully developed using **Spring Boot**, while the frontend is built with **React**. Future releases will introduce AI-powered healthcare assistance using **Spring AI** and **OpenAI APIs**.

---

# ✨ Features

## 👤 Patient

- Secure Registration & Login
- Google OAuth Login
- Forgot & Reset Password
- Book Appointments
- View Appointment History
- View Medical Records
- Download Prescriptions
- Profile Management

---

## 👨‍⚕️ Doctor

- Doctor Dashboard
- Manage Availability
- View Assigned Appointments
- Access Patient Medical History
- Create Prescriptions
- Update Patient Records
- Profile Management

---

## 🧑‍💼 Admin

- Dashboard Analytics
- Manage Doctors
- Manage Patients
- Manage Receptionists
- Manage Appointments
- System Settings
- User Management

---

## 🏥 Receptionist

- Register Patients
- Schedule Appointments
- Billing Management
- Manage Patient Records
- View Doctor Availability

---

## 📅 Appointment Management

- Slot-Based Appointment Booking
- Doctor Availability Scheduling
- Appointment Status Tracking
- Prevent Double Booking
- Appointment History

---

## 💊 Prescription Management

- Digital Prescription Generation
- Patient Prescription History
- Download Prescriptions
- Doctor Notes

---

## 🔐 Authentication & Security

- JWT Authentication
- Google OAuth 2.0 Login
- Role-Based Access Control (RBAC)
- BCrypt Password Encryption
- Email-based Password Reset
- Secure REST APIs

---

# 🛠️ Tech Stack

## Backend

- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- MySQL
- JWT Authentication
- OAuth2 Client
- Spring Mail
- Maven

---

## Frontend

- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Context API

---

## AI (Upcoming)

- Spring AI
- OpenAI API
- Medical Assistant Chatbot
- AI Doctor Recommendation
- Symptom Analysis
- AI-powered Clinical Assistance

---

# 📁 Repository Structure

```text
Clinic-Management-System
│
├── backend
│   ├── src
│   ├── pom.xml
│   ├── mvnw
│   └── .mvn
│
├── frontend
│   ├── src
│   ├── public
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── .gitignore
```

---

# 🏗️ Backend Architecture

```text
backend/src/main/java/com/clinic/management
│
├── config
├── controller
├── dto
├── entity
├── repository
├── security
├── service
├── exception
└── util
```

---

# 🎨 Frontend Architecture

```text
frontend/src
│
├── api
├── assets
├── components
├── context
├── hooks
├── pages
├── routes
├── services
└── utils
```

---

# ⚙️ Prerequisites

- Java 17+
- Maven
- MySQL 8+
- Node.js 18+
- npm

---

# 🚀 Backend Setup

Clone the repository:

```bash
git clone https://github.com/<your-username>/Clinic-Management-System.git
```

Navigate to the backend:

```bash
cd Clinic-Management-System/backend
```

Configure environment variables:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/clinic_db
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}

jwt:
  secret: ${JWT_SECRET}
```

Run the backend:

```bash
./mvnw spring-boot:run
```

Windows:

```bash
mvnw.cmd spring-boot:run
```

---

# 💻 Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

The frontend runs at:

```
http://localhost:5173
```

---

# 🔑 REST API Modules

| Module | Endpoint |
|---------|----------|
| Authentication | `/api/auth` |
| Patients | `/api/patients` |
| Doctors | `/api/doctors` |
| Receptionists | `/api/receptionists` |
| Admin | `/api/admin` |
| Appointments | `/api/appointments` |
| Prescriptions | `/api/prescriptions` |

---

# 🗄️ Database Modules

- Users
- Patients
- Doctors
- Receptionists
- Appointments
- Doctor Availability
- Medical Records
- Prescriptions
- Password Reset Tokens

---

# 🤖 Planned AI Features

- AI Medical Chatbot
- Symptom Checker
- AI Prescription Assistance
- Doctor Recommendation Engine
- Medical Report Summarization
- Voice-to-Text Prescription Generation

---

# 📈 Future Enhancements

- Telemedicine
- Online Payments
- SMS & Email Notifications
- Inventory Management
- Laboratory Module
- Multi-Clinic Support
- AI Analytics Dashboard
- PDF & Excel Reports

---

# 🔒 Security Features

- JWT Authentication
- Google OAuth2 Login
- BCrypt Password Encryption
- Role-Based Authorization
- Secure Password Reset
- Environment Variable Configuration
- Protected REST APIs

---

# 🧪 Testing

- REST API Testing using Postman
- Authentication & Authorization Testing
- Role-Based Access Testing
- Frontend Integration Testing

---

# 📌 Current Project Status

### ✅ Completed

- Spring Boot Backend
- RESTful APIs
- JWT Authentication
- Google OAuth Login
- Password Reset via Email
- Role-Based Access Control
- Appointment Management
- User Management
- React Frontend
- Responsive Dashboard UI

### 🚧 In Progress

- Frontend–Backend Integration
- Billing Module
- Email Notifications
- AI Integration

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/your-feature
```

3. Commit your changes.

```bash
git commit -m "Add new feature"
```

4. Push to your branch.

```bash
git push origin feature/your-feature
```

5. Open a Pull Request.

---

# 👨‍💻 Authors

- **Debolina Roy**
- **Devmalya Bhattacharjee**

---

# 📄 License

This project is licensed under the **MIT License**.

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.
