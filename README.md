# 🏥 AI-Enabled Clinic Management System

A modern full-stack **Clinic Management System** built with **Spring Boot**, **React**, and **MySQL**, designed to digitize and streamline clinic operations. The application provides secure role-based access for **Admin**, **Doctor**, **Patient**, and **Receptionist**, along with modern authentication, appointment management, and AI-ready architecture.

---

# 📖 Overview

The AI-Enabled Clinic Management System simplifies healthcare workflows by enabling efficient management of appointments, patient records, doctors, billing, and administrative tasks.

The application is built with a scalable architecture and is designed for future AI integration using **Spring AI** and **OpenAI APIs**.

---

# ✨ Features

## 👤 Patient

- Secure Registration & Login
- Google OAuth Login
- Book Appointments
- View Appointment History
- Access Medical Records
- View & Download Prescriptions
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
- Monitor Appointments
- System Settings
- User Management

---

## 🏥 Receptionist

- Register Patients
- Schedule Appointments
- Billing Management
- Manage Patient Information
- View Doctor Availability

---

## 📅 Appointment Management

- Slot-based Appointment Booking
- Doctor Availability Management
- Appointment Status Tracking
- Prevent Double Booking
- Appointment History

---

## 💊 Prescription Management

- Digital Prescription Generation
- Patient Prescription History
- Download Prescription
- Doctor Notes

---

## 🔐 Authentication & Security

- JWT Authentication
- Google OAuth 2.0 Login
- Role-Based Access Control (RBAC)
- BCrypt Password Encryption
- Forgot Password via Email
- Password Reset using Secure Token
- Protected REST APIs

---

# 🛠️ Tech Stack

## Backend

- Java 17
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

## AI (Planned)

- Spring AI
- OpenAI API
- AI Medical Assistant
- Doctor Recommendation
- Symptom Analysis

---

# 📁 Project Structure

```
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

```
src/main/java/com/clinic/management
│
├── config
├── controller
├── dto
├── entity
├── exception
├── repository
├── security
├── service
└── util
```

---

# 🎨 Frontend Architecture

```
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
- Node.js 18+
- npm
- MySQL 8+

---

# 🚀 Backend Setup

```bash
git clone https://github.com/<your-username>/Clinic-Management-System.git

cd Clinic-Management-System/backend
```

Configure your environment variables or `application.yml`.

Example:

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

The frontend will run on:

```
http://localhost:5173
```

---

# 🔑 Main API Modules

| Module | Endpoint |
|---------|----------|
| Authentication | `/api/auth` |
| Patients | `/api/patients` |
| Doctors | `/api/doctors` |
| Admin | `/api/admin` |
| Receptionists | `/api/receptionists` |
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

# 🤖 Upcoming AI Features

- AI Medical Chatbot
- Symptom Analysis
- AI Prescription Suggestions
- Doctor Recommendation Engine
- Medical Report Summarization
- Voice-to-Text Prescription Generation

---

# 📈 Future Enhancements

- Video Consultation
- Payment Gateway Integration
- SMS & Email Notifications
- AI-powered Appointment Scheduling
- Multi-Clinic Support
- Inventory Management
- Laboratory Module
- PDF & Excel Reports
- Analytics Dashboard

---

# 🔒 Security Features

- JWT Authentication
- OAuth2 Login
- BCrypt Password Hashing
- Secure Password Reset
- Role-Based Authorization
- CORS Configuration
- Protected REST APIs
- Environment Variable Configuration

---

# 🧪 Testing

- Postman API Testing
- Role-based Authentication Testing
- Integration Testing
- Frontend Component Testing

---

# 🚧 Project Status

**Current Phase:** MVP Development

### Completed

- Backend REST APIs
- React Frontend
- JWT Authentication
- Google OAuth Login
- Password Reset via Email
- Role-Based Access Control
- Appointment Management
- Dashboard UI

### In Progress

- Billing Module
- Notifications
- AI Integration

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

3. Commit changes

```bash
git commit -m "Add new feature"
```

4. Push

```bash
git push origin feature/your-feature
```

5. Open a Pull Request

---

# 👨‍💻 Authors

- **Debolina Roy**
- **Devmalya Bhattacharjee**

---

# 📄 License

This project is licensed under the **MIT License**.

---

# ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub.
