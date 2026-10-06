# Lumina Luxe Salon Enterprise ERP

A full-stack Salon Management ERP web application designed for multi-branch salons, spa chains, and haute coiffure enterprises. Built with **React 19**, **Vite**, **FastAPI**, **SQLAlchemy**, and **MySQL / SQLite**.

---

## 🌟 Key Features

- **Dashboard & Analytics**: Real-time sales, appointment conversion, branch performance, and service distribution metrics.
- **Appointment Scheduling**: Interactive booking grid with server-side conflict detection, stylist allocation, and reminder queuing.
- **POS Billing & Checkout**: Multi-payment support (Cash, Card, UPI), automated tax calculations (`18%`), transactional stock deduction, and sequential invoice numbering (`INV-YYYY-XXXX`).
- **Inventory & Stock Management**: Product catalog, batch tracking, supplier purchase orders, and automated low-stock alerts.
- **Employee & Attendance Management**: Shift clock-in/clock-out, leave approvals, role permissions, and salary/payroll processing.
- **Customer CRM & Loyalty**: Client history, VIP tiers, visit counts, total spent tracking, and loyalty point rewards.
- **Security & Authorization**: JWT token-based authentication (`/api/auth/login`), PBKDF2 password hashing, and role-based access control (`Super Admin`, `Branch Manager`, `Senior Stylist`, `Receptionist`, `Customer`).
- **Immutable Audit Logging**: Automatic server-side tracking of user actions, module operations, timestamps, and IP addresses.

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Modern CSS variables, glassmorphism, dark/light theme engine
- **State Management**: Domain Contexts (`AuthContext`, `SalonContext`) wired directly to `apiService`

### Backend
- **Framework**: Python FastAPI
- **ORM & Database**: SQLAlchemy 2.0 + PyMySQL (MySQL / SQLite fallback for development)
- **Security**: PyJWT (`HS256`), Passlib (`pbkdf2_sha256`)
- **Validation**: Pydantic v2 schemas with `from_attributes`

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18+`
- **Python**: `v3.10+`

---

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure Environment Variables (`.env`):
   ```env
   ENVIRONMENT=development
   SECRET_KEY=your_production_secret_key_here
   MYSQL_USER=root
   MYSQL_PASSWORD=root
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_DB=lumina_salon
   FRONTEND_URL=http://localhost:5173
   ```

4. Run the FastAPI Server:
   ```bash
   python main.py
   ```
   *The server will start at `http://localhost:8000`. OpenAPI documentation is available at `http://localhost:8000/docs`.*

---

### Frontend Setup

1. Install Node dependencies:
   ```bash
   npm install
   ```

2. Configure Environment Variables (`.env`):
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

3. Run the Development Server:
   ```bash
   npm run dev
   ```

4. Build for Production:
   ```bash
   npm run build
   ```

---

## 🔐 Default Credentials (Development Seed)

| Username | Password | Role |
| :--- | :--- | :--- |
| `admin` | `password123` | **Super Admin** |
| `manager` | `password123` | **Branch Manager** |
| `stylist` | `password123` | **Senior Stylist** |
| `receptionist` | `password123` | **Receptionist** |
| `customer` | `password123` | **Customer** |

---

## 🧪 Testing & Verification

- **Frontend Production Build**: `npm run build`
- **Backend Compilation Test**: `python -m compileall backend`
- **Backend Health Check**: `GET http://localhost:8000/api/health`
- **Database Readiness**: `GET http://localhost:8000/api/ready`
