# 🎨 Pixel Art Editor

## 📌 Project Overview

**Pixel Art Editor** is an interactive pixel art editor that allows users to draw, edit, save, and share pixel art directly in their browser. The project supports both single-player and collaborative multiplayer modes, utilizing modern web technologies to ensure a seamless user experience and scalability.

- **Live Demo**: [Visit the Application](https://lively-island-0f6993c03.4.azurestaticapps.net)
- **Repository**: [GitHub](https://github.com/Joey111a1/sse_team_project)

---

## 👥 Team Members & Contributions

- **Frontend Development**: Tu Wenqing (**tt3024**) - [GitHub: abaabaATU](https://github.com/abaabaATU)
- **Backend Development**: Liu Xuetong (**xl3924**) - [GitHub: TiffanyLiu2035](https://github.com/TiffanyLiu2035)
- **Cloud Infrastructure & Deployment**: Zhou Qingyang (**qz824**) - [GitHub: Joey111a1](https://github.com/Joey111a1)

---

## 🚀 Key Features

### 🔐 User Management
- User registration, login, and authentication (JWT)
- Account management and security protection

### 🎨 Canvas Features
- Adjustable canvas size
- Drawing tools: adjustable brush size, color picker, and eyedropper tool
- Canvas operations: rotate, show/hide grid, clear, undo/redo (up to 20 steps)
- Image import (edges automatically rendered in black)

### 🤝 Collaboration Mode
- Supports turn-based multiplayer drawing
- Shared canvas functionality

### 📂 Artwork Storage & Sharing
- Save artwork history
- Generate shareable links and export PNG files

---

## 📂 Project Structure

```
SSE_TEAM_PROJECT
├── backend
│   ├── app
│   │   ├── routes  # API Routes
│   │   │   ├── collab.py      # Collaboration-related endpoints
│   │   │   ├── history.py     # Artwork storage endpoints
│   │   │   ├── share.py       # Sharing functionality
│   │   │   ├── users.py       # User management endpoints
│   │   ├── auth.py            # Authentication logic
│   │   ├── database.py        # Database connection
│   │   ├── main.py            # FastAPI entry point
│   │   ├── models.py          # Data models (SQLAlchemy)
│   │   ├── schemas.py         # Data validation (Pydantic)
│   ├── migrations             # Database migrations (Alembic)
│   ├── static/images          # Static resources
│   ├── .env                   # Environment variable configuration
│   ├── alembic.ini            # Alembic configuration
├── frontend
│   ├── assets/icons           # Frontend icon resources
│   ├── common/styles          # CSS styles
│   ├── pages                  # Main pages
│   │   ├── canvas             # Canvas page
│   │   │   ├── css            # Canvas-related styles
│   │   │   │   ├── canvas.css
│   │   │   │   ├── fonts.css
│   │   │   │   ├── modal.css
│   │   │   │   ├── overlay.css
│   │   │   ├── js             # Canvas-related scripts
│   │   │   │   ├── canvas.js
│   │   │   │   ├── history.js
│   │   │   │   ├── modal.js
│   │   │   │   ├── multiplayer.js
│   │   │   │   ├── share.js
│   │   │   │   ├── tools.js
│   │   │   │   ├── transform.js
│   │   │   │   ├── upload.js
│   │   │   ├── canvas.html
│   │   ├── login              # Login page
│   │   │   ├── login.css
│   │   │   ├── login.html
│   │   │   ├── login.js
│   │   ├── share              # Share page
│   │   │   ├── share-poster.html
│   │   ├── welcome            # Welcome page
│   │   │   ├── welcome.css
│   │   │   ├── welcome.html
│   │   │   ├── welcome.js
│── test                   # Automated tests
│   ├── test_database.py   # Tests for database interactions
│   ├── test_routes.py     # Tests for API routes
│   ├── .gitkeep           # Placeholder to retain directory in version 
├── .gitignore
├── README.md
├── requirements.txt       # Dependency file
```

---

## ⚙️ Developer Guide

### 1️⃣ Prerequisites
- **Python 3.9+**
- **PostgreSQL 13+**
- **Node.js + npm/yarn** (Frontend)
- **Git** (Version Control)

### 2️⃣ Setting Up the Backend
```sh
git clone https://github.com/Joey111a1/sse_team_project.git
cd sse_team_project/backend
python3 -m venv venv
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 3️⃣ Environment Variables
Create a `.env` file inside the `backend/` directory:
```sh
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pixelart
SECRET_KEY=your_secret_key
ALGORITHM=HS256
```

### 4️⃣ Database Migration
```sh
alembic upgrade head
```
If no migrations exist, run:
```sh
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### 5️⃣ Start the Backend Server
```sh
uvicorn app.main:app --reload
```
The API documentation is available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) (Auto-generated by FastAPI).

### 6️⃣ Start the Frontend Server
```sh
cd ../frontend
npm install
npm run dev  # Or yarn dev
```

---

## ⚙️ Testing

The project includes automated tests to ensure stability and correctness. The tests are located in the `test/` directory and cover:

- **Database Tests** (`test_database.py`):
  - Validates database connection and queries.
  - Ensures data integrity and schema consistency.

- **API Route Tests** (`test_routes.py`):
  - Tests key API endpoints for expected behavior.
  - Ensures authentication, data retrieval, and response correctness.

### Running Tests
To run all tests, use the following command:
```sh
pytest test/
```
For a specific test file:
```sh
pytest test/test_database.py
```
Ensure the environment variables and database are correctly set up before running tests.

---

## ☁️ Cloud Deployment

### Backend: Azure Functions
- **Serverless architecture**, billed per execution, ideal for low-traffic scenarios.
- **Auto-scaling**, no need for a dedicated server.

### Frontend: Azure Static Web Apps
- Free hosting for static files.
- Can be updated independently without affecting the backend.

### Data Storage
- **PostgreSQL (Azure Database)** for dynamic data.
- **Azure Blob Storage** for image storage.

### Cost Optimization
- **Utilizing the Azure for Students Plan** to achieve **near-zero operational costs**.
- **Scalable on demand** to minimize unnecessary expenses.

---

## 🔧 Performance Optimization & Security

### 🚀 Optimizations
- **Optimized database queries** (indexing, minimizing JOINs)
- **Asynchronous processing** (FastAPI + async/await)
- **Redis caching (potential future integration)**

### 🔒 Security Measures
- **JWT authentication** + **Password hashing (bcrypt)**
- **SQL Injection protection** (Parameterized queries)
- **Cross-Origin Resource Sharing (CORS) restrictions**

---

## 🤝 Contributing & Support

### 💡 Submit Issues / PRs
We welcome contributions! Feel free to submit issues and pull requests via [GitHub Issues](https://github.com/Joey111a1/sse_team_project/issues).

### 📜 License
[MIT License](./LICENSE)

**Thank you for using Pixel Art Editor! 🎨** 