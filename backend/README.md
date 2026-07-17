# UniPort Student Risk System - Backend

## Overview

Express backend for the UniPort Student Risk System with authentication, prediction API routing, report generation, and communication with the Python ML service.

## Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Install Python dependencies:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Create `.env` from `.env.example` and configure values.
4. Start the server:
   ```bash
   npm run dev
   ```
5. Start the ML service:
   ```bash
   npm run ml
   ```

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/refresh`
- `POST /api/ml/predict`
- `POST /api/ml/train`
- `POST /api/ml/retrain`
- `GET /api/ml/metrics`
- `GET /api/health`
- `POST /api/predictions`
- `GET /api/predictions`
- `POST /api/reports`
- `GET /api/reports`
# student-risk-system
