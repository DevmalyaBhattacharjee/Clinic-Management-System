# 🏥 Clinic Management SystemA full-stack **Clinic Management System** built with **Spring Boot + MySQL (Backend)** and **React + Tailwind CSS (Frontend)**.  This system supports multiple roles including **Admin, Doctor, Patient, and Receptionist** with secure JWT-based authentication.---## 🚀 Tech Stack### Backend- Java 17- Spring Boot- Spring Security (JWT Authentication)- Spring Data JPA- MySQL- Lombok- Swagger (OpenAPI)### Frontend- React (Vite)- Tailwind CSS- Axios- React Router---## 🔐 Features### Authentication- JWT-based login & registration- Role-based access control (RBAC)- Secure password encryption (BCrypt)### Roles & Capabilities#### 👨‍⚕️ Doctor- View today's appointments- Manage patient records- Update appointment status- View schedule#### 🧑‍💼 Admin- Manage doctors (CRUD)- System-level access- Monitor operations#### 🧑 Patient- Book appointments- View prescriptions- Access medical records- Track bills#### 🧾 Receptionist- Book appointments for patients- Manage appointment flow- Update statuses---## 📁 Project Structure (Monorepo)
clinic-management-system/
│
├── backend/   # Spring Boot Application
│
└── frontend/  # React Application
---## ⚙️ Backend Setup### 1. Clone Repository```bashgit clone https://github.com/your-username/clinic-management-system.gitcd backend
2. Configure MySQL
Create a database:
CREATE DATABASE clinic_db;
Update application.properties:
spring.datasource.url=jdbc:mysql://localhost:3306/clinic_dbspring.datasource.username=your_usernamespring.datasource.password=your_passwordspring.jpa.hibernate.ddl-auto=updatespring.jpa.show-sql=true
3. Run Backend
mvn clean installmvn spring-boot:run
Server runs on:
http://localhost:8080

📄 Swagger API Docs
After running backend:
http://localhost:8080/swagger-ui.html

🌐 Frontend Setup
1. Navigate to frontend
cd frontend
2. Install dependencies
npm install
3. Configure environment
Create .env file:
VITE_API_URL=http://localhost:8080
4. Run frontend
npm run dev
App runs on:
http://localhost:5173

🔗 API Integration
Frontend communicates with backend via:
http://localhost:8080/api/**
JWT Token is sent in headers:
Authorization: Bearer <token>

🧪 Testing APIs
Use:


Postman


cURL


Swagger UI


Example login request:
POST /api/auth/login
Body:
{  "email": "admin@clinic.com",  "password": "admin123"}

📌 Important Notes


Ensure MySQL is running before backend startup


Use Java 17 (NOT Java 24)


JWT token required for secured endpoints


Roles must match backend enum values



📈 Future Enhancements


Payment integration


Notifications system


Chatbot integration


Analytics dashboard


Deployment (Docker + Cloud)



👨‍💻 Author
Debolina Roy
Devmalya Bhattacharjee
B.Tech Computer Science
Aspiring Java Software Engineer

📜 License
This project is for educational purposes.
