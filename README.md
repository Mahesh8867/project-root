# 🧩 Django + React (Vite) Fullstack Project

This is a fullstack web application built with **Django (Python)** for the backend and **React with Vite** for the frontend. The entire stack is containerized using Docker and can be deployed locally or to the cloud with ease.

---

## 📁 Project Structure

project-root/
├── backend/ # Django backend
│ ├── manage.py
│ ├── core/ # Django app
│ ├── requirements.txt
│ └── Dockerfile
├── frontend/ # React frontend (Vite)
│ ├── src/
│ ├── index.html
│ ├── package.json
│ ├── vite.config.js
│ ├── Dockerfile
│ └── nginx.conf
├── docker-compose.yml
└── README.md

---

## 🚀 Setup Instructions

### 1. Clone the Repository
git clone https://github.com/Mahesh8867/project-root/.git
cd project-root
2. Build & Start the App Using Docker Compose
docker-compose up --build
Frontend: http://localhost:3000
Backend API: http://localhost:8000
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
3 . Running Tests
To run backend (Django) tests:
docker-compose exec backend python manage.py test

🐳 Dockerized Services
| Service  | Description              | Port             |
| -------- | ------------------------ | ---------------- |
| frontend | React + Vite static site | `localhost:3000` |
| backend  | Django app + Gunicorn    | `localhost:8000` |


