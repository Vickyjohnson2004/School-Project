# UniPort Student Risk System

A full-stack production-ready student risk prediction and intervention platform for the University of Port Harcourt.

## Structure

- `frontend/`: Next.js application with responsive landing page, auth flows, and dashboard UI.
- `backend/`: Express API server with role authentication, ML integration, PDF reports, and MongoDB models.
- `backend/src/ml/`: FastAPI machine learning microservice for training, prediction, and model metrics.

## Setup

1. Install frontend dependencies:
   ```bash
   cd student-risk-system/frontend
   npm install
   ```
2. Install backend dependencies:
   ```bash
   cd ../backend
   npm install
   ```
3. Install Python dependencies for the ML service:
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` in `backend/` and set values.
5. Start backend server:
   ```bash
   npm run dev
   ```
6. Start ML service:
   ```bash
   npm run ml
   ```

## Deployment

- Use Docker Compose or separate container deployment for backend and ML service.
- Configure MongoDB connection and email credentials in environment variables.
- Use production-ready proxies and TLS.
# School-Project
