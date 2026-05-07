# 🏎️ APEX-F1: High-Fidelity Hybrid Motorsport Analytics

APEX-F1 is a production-grade motorsport analytics platform that bridges the gap between **verified historical race data** and **AI-powered predictive simulations**. Featuring a state-of-the-art 3D interactive technical visualizer, it provides unprecedented depth into Formula 1 engineering and performance.

![APEX-F1 Preview](https://via.placeholder.com/1200x600/0a0a0f/ffffff?text=APEX-F1+NEXT-GEN+ANALYTICS)

## 🌟 Core Features

### 🏁 Hybrid Data Architecture
- **Verified Layer**: Robust ingestion of historical F1 data (1950–2024) via the Jolpica Ergast API.
- **Predictive Layer**: AI-driven race simulations and championship forecasts for the 2025 and 2026 seasons.

### 🏎️ 3D Technical Visualizer
- **Interactive Chassis**: High-fidelity 3D car models built with **React Three Fiber** and **Three.js**.
- **Camera Choreography**: Cinematic camera transitions that frame technical hotspots (MGU-K, Sidepods, DRS) during analysis.
- **Singleton Renderer**: Optimized WebGL context management allowing multiple 3D scenes to share a single GPU context.

### 📊 Precision Asset Pipeline
- **Automated Ingestion**: Python-based async pipelines for driver headshots, team logos, and 3D assets.
- **Optimization**: Automated WebP conversion and resizing for sub-100ms loading performance.
- **CI/CD Automation**: Weekly asset refreshes via GitHub Actions to maintain up-to-the-minute grid accuracy.

## ⚙️ Tech Stack

- **Frontend**: Next.js 16 (App Router), Tailwind CSS, Framer Motion
- **Graphics**: React Three Fiber, Three.js, @react-three/drei, @react-three/postprocessing
- **Backend**: FastAPI (Async), PostgreSQL (SQLAlchemy 2.0), Redis Caching
- **ML Engine**: Scikit-learn, XGBoost (Predictive modeling)
- **Infrastructure**: Docker, GitHub Actions

## 🚀 Quick Start

### 1. Infrastructure
Ensure Docker is running, then start the data layer:
```bash
docker-compose up -d
```

### 2. Backend (API)
```bash
cd apps/api
pip install -r requirements.txt
export PYTHONPATH=$PYTHONPATH:../..
uvicorn apps.api.main:app --reload --port 8001
```

### 3. Frontend (Web)
```bash
cd apps/web
pnpm install
pnpm dev
```

## 🔌 API Blueprint

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/drivers` | GET | Paginated historical and active driver roster |
| `/seasons/{year}/standings` | GET | Real-time standings with predictive deltas |
| `/predictions/{race_id}` | GET | AI-generated podium probabilities |
| `/constructors/{ref}/history` | GET | Deep-dive into technical engineering records |

## 🛠️ Performance Benchmarks
- **Lighthouse Score**: 95+ Performance
- **3D Render Latency**: <16ms (60FPS)
- **API Response**: <50ms (Cached)

---
*Developed by the APEX Engineering Team. Data provided by Jolpica Ergast API.*
