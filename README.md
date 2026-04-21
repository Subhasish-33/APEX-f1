# 🏎️ Apex F1 Analytics Platform

## 📌 Overview

Apex F1 is a full-stack data platform designed to analyze Formula 1 race data, simulate race outcomes, and provide predictive insights.

This project is being built using a monorepo architecture with:

- FastAPI (backend API)
- Next.js (frontend — upcoming)
- PostgreSQL + Redis (data layer via Docker)

## ⚙️ Tech Stack

- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL
- **Cache:** Redis
- **Frontend:** Next.js (planned)
- **Package Manager:** pnpm
- **Containerization:** Docker

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd apex-f1
```

## 🐳 Running Database (PostgreSQL + Redis)

Make sure Docker is running.

```bash
docker-compose up -d
```

This will start:

- PostgreSQL → port 5432
- Redis → port 6379

## 🧠 Running Backend (FastAPI)

Navigate to backend folder:

```bash
cd apps/api
```

### Create virtual environment (recommended)

```bash
python3 -m venv venv
source venv/bin/activate   # Mac/Linux
```

### Install dependencies

```bash
pip install -r requirements.txt
```

### Start server

```bash
uvicorn main:app --reload --port 8000
```

## 🌐 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/` | Health check |
| `/test-db` | Test database connection |

## 🔌 Ports Used

| Service | Port |
|---------|------|
| FastAPI | 8000 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| Next.js (future) | 3000 |
