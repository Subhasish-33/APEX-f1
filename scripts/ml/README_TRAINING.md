# ===========================================================================
# APEX-F1 ML Training — REMOTE EXECUTION ONLY
# ===========================================================================
#
# ⚠️  CRITICAL: NEVER run model training locally on a MacBook Air.
#
# The XGBoost training loop + Optuna hyperparameter search + feature backfills
# consume 4–8 CPU cores and 6–12GB RAM for 10–45 minutes.
# On a fanless MacBook Air this will cause:
#   - Thermal throttling within 5 minutes
#   - CPU clock-speed halving (1.2GHz from 3.5GHz)
#   - Swap exhaustion
#   - Terminal and browser crashes
#
# LOCAL RESPONSIBILITIES (✅ safe to run locally):
#   - Model INFERENCE (loading apps/api/ml/model.pkl + generating predictions)
#   - API route development
#   - Frontend development
#   - Data validation scripts
#
# ===========================================================================

## Recommended Remote Platforms

| Platform     | Use Case              | Cost       | Link |
|--------------|-----------------------|------------|------|
| **RunPod**   | GPU training (XGB)    | ~$0.20/hr  | https://runpod.io |
| **Paperspace** | Jupyter + GPU      | Free tier  | https://paperspace.com |
| **Vast.ai**  | Cheapest GPU/CPU      | ~$0.10/hr  | https://vast.ai |
| **EC2 Spot** | AWS production grade  | ~$0.05/hr  | https://aws.amazon.com/ec2/spot/ |
| **Google Colab** | Quick experiments | Free tier | https://colab.research.google.com |

---

## Workflow: Training on RunPod

```bash
# 1. SSH into your RunPod instance
ssh root@<your-runpod-ip> -p <port>

# 2. Clone the repo
git clone https://github.com/Subhasish-33/APEX-f1.git
cd APEX-f1

# 3. Set environment variables
export DATABASE_URL="postgresql+asyncpg://..."
export REDIS_URL="rediss://..."

# 4. Install dependencies (CPU-only torch not needed for XGBoost)
pip install -r apps/api/requirements.txt

# 5. Run feature backfill (if needed)
python scripts/ml/backfill_features.py

# 6. Train the model
python apps/api/ml/train.py

# 7. Copy the trained model back to your local machine
scp root@<ip>:<port>:~/APEX-f1/apps/api/ml/model.pkl ./apps/api/ml/model.pkl

# 8. Commit the updated model
git add apps/api/ml/model.pkl
git commit -m "chore: update trained model artifact"
git push
```

---

## Workflow: Training on Google Colab (Free)

```python
# Cell 1 — Setup
!git clone https://github.com/Subhasish-33/APEX-f1.git
%cd APEX-f1
!pip install -r apps/api/requirements.txt -q

# Cell 2 — Set secrets (use Colab Secrets panel, not plaintext)
import os
os.environ["DATABASE_URL"] = "postgresql+asyncpg://..."

# Cell 3 — Backfill features (if schema changed)
!python scripts/ml/backfill_features.py

# Cell 4 — Train
!python apps/api/ml/train.py

# Cell 5 — Download artifact
from google.colab import files
files.download("apps/api/ml/model.pkl")
```

---

## What Runs Remotely vs Locally

| Task | Run | Command |
|------|-----|---------|
| XGBoost training | ☁️ Remote | `python apps/api/ml/train.py` |
| Optuna HPO study | ☁️ Remote | `python apps/api/ml/train.py --tune` |
| Feature backfill (full history) | ☁️ Remote | `python scripts/ml/backfill_features.py` |
| Ingestion pipeline (historical) | ☁️ Remote | `python apps/api/ingestion/ingest.py` |
| Model inference | ✅ Local | runs via FastAPI startup |
| Feature engineering (single race) | ✅ Local | via API routes |
| Frontend dev | ✅ Local | `scripts/dev/start_frontend.sh` |
| API dev | ✅ Local | `scripts/dev/start_backend.sh` |

---

## Model Artifact Policy

- `apps/api/ml/model.pkl` is tracked in git (it is small, ~5MB, and is the inference artifact).
- Never commit partial/corrupt models — always train to completion before committing.
- If the model exceeds 50MB, migrate to **Supabase Storage** or **Cloudflare R2** and load it at API startup via HTTP.
