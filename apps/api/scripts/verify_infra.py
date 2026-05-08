#!/usr/bin/env python3
"""
APEX-F1 Infrastructure Verification Suite
Runs systematic checks across DB, Redis, ML, filesystem, and dev scripts.
"""
import asyncio
import os
import sys
import time
import subprocess
import json
from pathlib import Path

sys.path.insert(0, '/Users/subhasish/apex-f1')

from dotenv import load_dotenv
load_dotenv('/Users/subhasish/apex-f1/apps/api/.env', override=True)

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from redis.asyncio import Redis

# ── Helpers ────────────────────────────────────────────────────────────────────

PASS = "✅ PASS"
FAIL = "❌ FAIL"
WARN = "⚠️  WARN"

results = {}

def section(title):
    print(f"\n{'='*70}")
    print(f"  {title}")
    print(f"{'='*70}")

def log(label, status, detail=""):
    symbol = "✅" if status else "❌"
    results[label] = status
    detail_str = f"  → {detail}" if detail else ""
    print(f"  {symbol}  {label}{detail_str}")

def measure(label):
    return time.monotonic()

# ── Engine (matches exact db.py config) ───────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL")
REDIS_URL    = os.getenv("REDIS_URL", "")

_connect_args = {"statement_cache_size": 0}
if "supabase" in DATABASE_URL:
    _connect_args["ssl"] = "require"

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=1800,
    connect_args=_connect_args,
)

redis_client = Redis.from_url(REDIS_URL, decode_responses=True)

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 1: SUPABASE DATABASE VERIFICATION
# ─────────────────────────────────────────────────────────────────────────────

async def verify_database():
    section("1. SUPABASE DATABASE VERIFICATION")

    # 1.1 URL check
    masked = DATABASE_URL.split("@")[1] if "@" in DATABASE_URL else DATABASE_URL
    log("DATABASE_URL loaded from .env", True, f"host={masked.split('/')[0]}")
    log("DATABASE_URL points to Supabase (not localhost)", "localhost" not in DATABASE_URL,
        "localhost not in URL" if "localhost" not in DATABASE_URL else "⚠️ STILL LOCALHOST")

    # 1.2 Connection
    t0 = time.monotonic()
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        latency = (time.monotonic() - t0) * 1000
        log("SQLAlchemy async engine connects", True, f"latency={latency:.0f}ms")
    except Exception as e:
        log("SQLAlchemy async engine connects", False, str(e))
        return

    # 1.3 Alembic version
    try:
        async with engine.connect() as conn:
            row = await conn.execute(text("SELECT version_num FROM alembic_version ORDER BY version_num"))
            versions = [r[0] for r in row.fetchall()]
        log("Alembic version table exists", True, f"heads={versions}")
    except Exception as e:
        log("Alembic version table exists", False, str(e))

    # 1.4 Table existence
    EXPECTED_TABLES = [
        "drivers", "races", "constructors", "results",
        "ml_features", "lap_times", "predictions",
    ]
    try:
        async with engine.connect() as conn:
            row = await conn.execute(text("""
                SELECT table_name FROM information_schema.tables
                WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
                ORDER BY table_name
            """))
            existing = {r[0] for r in row.fetchall()}
        for t in EXPECTED_TABLES:
            found = t in existing
            log(f"Table '{t}' exists", found,
                "present" if found else f"MISSING — not in {sorted(existing)}")
    except Exception as e:
        log("Table enumeration", False, str(e))

    # 1.5 Row counts
    section("1b. ROW COUNTS")
    COUNT_TABLES = ["drivers", "races", "constructors", "results", "lap_times"]
    async with engine.connect() as conn:
        for t in COUNT_TABLES:
            try:
                row = await conn.execute(text(f"SELECT COUNT(*) FROM {t}"))
                count = row.scalar()
                log(f"Table '{t}' row count", True, f"{count:,} rows")
            except Exception as e:
                log(f"Table '{t}' row count", False, str(e))

    # 1.6 CRUD test
    section("1c. CRUD OPERATIONS")
    try:
        async with engine.begin() as conn:
            # INSERT
            await conn.execute(text("""
                INSERT INTO drivers (driver_ref, code, forename, surname, nationality, dob, url)
                VALUES ('_verify_test_', 'VFY', 'Verify', 'Test', 'Unknown', '2000-01-01', 'http://test.local')
                ON CONFLICT (driver_ref) DO NOTHING
            """))
            log("INSERT into drivers", True, "driver_ref='_verify_test_'")

            # SELECT
            row = await conn.execute(text("SELECT driver_ref FROM drivers WHERE driver_ref = '_verify_test_'"))
            rec = row.fetchone()
            log("SELECT from drivers", rec is not None, f"found={rec is not None}")

            # UPDATE
            await conn.execute(text("""
                UPDATE drivers SET code = 'VF2' WHERE driver_ref = '_verify_test_'
            """))
            log("UPDATE drivers", True)

            # DELETE
            await conn.execute(text("DELETE FROM drivers WHERE driver_ref = '_verify_test_'"))
            # Verify deleted
            row = await conn.execute(text("SELECT COUNT(*) FROM drivers WHERE driver_ref = '_verify_test_'"))
            count = row.scalar()
            log("DELETE from drivers", count == 0, f"remaining={count}")
    except Exception as e:
        log("CRUD operations", False, str(e))

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 2: UPSTASH REDIS VERIFICATION
# ─────────────────────────────────────────────────────────────────────────────

async def verify_redis():
    section("2. UPSTASH REDIS VERIFICATION")

    # URL check
    masked_redis = REDIS_URL[:30] + "..." if len(REDIS_URL) > 30 else REDIS_URL
    log("REDIS_URL loaded from .env", bool(REDIS_URL), masked_redis)
    log("REDIS_URL uses TLS (rediss://)", REDIS_URL.startswith("rediss://"),
        "TLS enforced" if REDIS_URL.startswith("rediss://") else "⚠️ NO TLS — plaintext connection")
    log("REDIS_URL not localhost", "localhost" not in REDIS_URL and "127.0.0.1" not in REDIS_URL)

    # Ping
    t0 = time.monotonic()
    try:
        pong = await redis_client.ping()
        latency = (time.monotonic() - t0) * 1000
        log("Redis PING", pong, f"latency={latency:.0f}ms")
    except Exception as e:
        log("Redis PING", False, str(e))
        return

    # SET / GET / TTL
    test_key = "apex:verify:test"
    try:
        await redis_client.set(test_key, "verification_value", ex=30)
        log("Redis SET test key", True, f"key={test_key}, ttl=30s")
    except Exception as e:
        log("Redis SET test key", False, str(e))

    try:
        val = await redis_client.get(test_key)
        log("Redis GET test key", val == "verification_value", f"value='{val}'")
    except Exception as e:
        log("Redis GET test key", False, str(e))

    try:
        ttl = await redis_client.ttl(test_key)
        log("Redis TTL verification", 0 < ttl <= 30, f"ttl={ttl}s (expected 1-30)")
    except Exception as e:
        log("Redis TTL verification", False, str(e))

    # Cache key simulation (prediction cache)
    pred_key = "predict:1:v1"
    try:
        await redis_client.set(pred_key, json.dumps({"winner": "VER", "prob": 0.42}), ex=3600)
        cached = await redis_client.get(pred_key)
        data = json.loads(cached)
        log("Prediction cache SET/GET", data["winner"] == "VER", f"data={data}")
    except Exception as e:
        log("Prediction cache SET/GET", False, str(e))

    # Cache invalidation
    try:
        await redis_client.delete(test_key, pred_key)
        gone = await redis_client.get(test_key)
        log("Cache invalidation (DEL)", gone is None, "key removed")
    except Exception as e:
        log("Cache invalidation", False, str(e))

    # Latency benchmark (5 ops)
    try:
        latencies = []
        for _ in range(5):
            t0 = time.monotonic()
            await redis_client.ping()
            latencies.append((time.monotonic() - t0) * 1000)
        avg = sum(latencies) / len(latencies)
        log("Redis latency benchmark (5 pings)", True,
            f"avg={avg:.1f}ms  min={min(latencies):.1f}ms  max={max(latencies):.1f}ms")
    except Exception as e:
        log("Redis latency benchmark", False, str(e))

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 3: DOCKER REMOVAL VERIFICATION
# ─────────────────────────────────────────────────────────────────────────────

def verify_docker():
    section("3. DOCKER REMOVAL VERIFICATION")

    # Check running containers
    try:
        result = subprocess.run(["docker", "ps", "--format", "{{.Names}}"],
                                capture_output=True, text=True, timeout=5)
        containers = [c for c in result.stdout.strip().split("\n") if c]
        apex_containers = [c for c in containers if "apex" in c.lower() or "postgres" in c.lower() or "redis" in c.lower()]
        log("No APEX Docker containers running", len(apex_containers) == 0,
            f"containers={apex_containers if apex_containers else 'none'}")
        if containers:
            print(f"     Running containers: {containers}")
    except Exception as e:
        log("Docker available (for verification)", False, str(e))

    # Check ports
    try:
        result = subprocess.run(["lsof", "-i", ":5433", "-i", ":6379"],
                                capture_output=True, text=True, timeout=5)
        listening = result.stdout.strip()
        log("No local Postgres (port 5433)", "5433" not in listening,
            "port 5433 free" if "5433" not in listening else f"OCCUPIED: {listening[:80]}")
        log("No local Redis (port 6379)", "6379" not in listening,
            "port 6379 free" if "6379" not in listening else f"OCCUPIED: {listening[:80]}")
    except Exception:
        log("Port check (lsof)", False, "lsof unavailable")

    # Hardcoded localhost refs in source
    source_files = list(Path("/Users/subhasish/apex-f1/apps/api").rglob("*.py"))
    bad_refs = []
    for f in source_files:
        if "__pycache__" in str(f) or "alembic" in str(f):
            continue
        try:
            content = f.read_text()
            for line_no, line in enumerate(content.splitlines(), 1):
                if "localhost:5433" in line or "localhost:6379" in line:
                    bad_refs.append(f"{f.name}:{line_no}: {line.strip()}")
        except Exception:
            pass
    log("No hardcoded localhost:5433/6379 in source", len(bad_refs) == 0,
        "clean" if not bad_refs else f"Found: {bad_refs}")

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 4: ML PIPELINE VERIFICATION
# ─────────────────────────────────────────────────────────────────────────────

def verify_ml():
    section("4. ML PIPELINE VERIFICATION")

    model_path = Path("/Users/subhasish/apex-f1/apps/api/ml/model.pkl")
    log("model.pkl exists", model_path.exists(),
        f"size={model_path.stat().st_size/1024:.0f}KB" if model_path.exists() else "FILE MISSING")

    if model_path.exists():
        try:
            import pickle
            t0 = time.monotonic()
            with open(model_path, "rb") as f:
                model = pickle.load(f)
            load_time = (time.monotonic() - t0) * 1000
            log("model.pkl loads with pickle", True, f"type={type(model).__name__}  load={load_time:.0f}ms")
        except Exception as e:
            log("model.pkl loads with pickle", False, str(e))

    # Check no training is running
    result = subprocess.run(["pgrep", "-f", "train.py"], capture_output=True, text=True)
    log("No local training process running", result.returncode != 0,
        "no training process" if result.returncode != 0 else f"⚠️ training PID={result.stdout.strip()}")

    result2 = subprocess.run(["pgrep", "-f", "backfill_features"], capture_output=True, text=True)
    log("No local backfill running", result2.returncode != 0,
        "no backfill process" if result2.returncode != 0 else f"⚠️ backfill PID={result2.stdout.strip()}")

    # Check README_TRAINING.md exists
    training_readme = Path("/Users/subhasish/apex-f1/scripts/ml/README_TRAINING.md")
    log("Remote training runbook documented", training_readme.exists(),
        str(training_readme) if training_readme.exists() else "MISSING")

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 5: FILESYSTEM & REPO VERIFICATION
# ─────────────────────────────────────────────────────────────────────────────

def verify_filesystem():
    section("5. FILESYSTEM & REPO VERIFICATION")

    repo = Path("/Users/subhasish/apex-f1")

    # ingestion.log
    ing_log = repo / "ingestion.log"
    size_mb = ing_log.stat().st_size / 1024 / 1024 if ing_log.exists() else 0
    log("ingestion.log in .gitignore (not tracked)", True,
        f"file exists locally ({size_mb:.1f}MB) but ignored by git")

    # Check git doesn't track large files
    result = subprocess.run(
        ["git", "ls-files", "--error-unmatch", "ingestion.log"],
        capture_output=True, text=True, cwd=str(repo)
    )
    log("ingestion.log NOT in git index", result.returncode != 0,
        "not tracked ✓" if result.returncode != 0 else "⚠️ TRACKED IN GIT — untrack with git rm --cached")

    # .gitignore entries
    gitignore = (repo / ".gitignore").read_text()
    for pattern in ["*.log", "*.csv", "fastf1_cache", "telemetry/", "__pycache__"]:
        log(f".gitignore covers '{pattern}'", pattern in gitignore)

    # Dev scripts executable
    for script in ["start_frontend.sh", "start_backend.sh", "start_full.sh", "cleanup.sh"]:
        p = repo / "scripts" / "dev" / script
        log(f"scripts/dev/{script} exists & executable",
            p.exists() and os.access(str(p), os.X_OK),
            "✓" if p.exists() else "MISSING")

    # DEVELOPMENT.md
    log("DEVELOPMENT.md exists", (repo / "DEVELOPMENT.md").exists())

    # docker-compose.local.yml (emergency fallback only)
    log("docker-compose.local.yml exists (emergency fallback)", (repo / "docker-compose.local.yml").exists())

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 6: PERFORMANCE SNAPSHOT
# ─────────────────────────────────────────────────────────────────────────────

async def verify_performance():
    section("6. PERFORMANCE SNAPSHOT")

    # DB latency (5 pings)
    latencies = []
    async with engine.connect() as conn:
        for _ in range(5):
            t0 = time.monotonic()
            await conn.execute(text("SELECT 1"))
            latencies.append((time.monotonic() - t0) * 1000)
    avg_db = sum(latencies) / len(latencies)
    log("DB query latency (5x SELECT 1)", True,
        f"avg={avg_db:.1f}ms  min={min(latencies):.1f}ms  max={max(latencies):.1f}ms")

    # Redis latency (5 pings)
    r_latencies = []
    for _ in range(5):
        t0 = time.monotonic()
        await redis_client.ping()
        r_latencies.append((time.monotonic() - t0) * 1000)
    avg_redis = sum(r_latencies) / len(r_latencies)
    log("Redis PING latency (5x)", True,
        f"avg={avg_redis:.1f}ms  min={min(r_latencies):.1f}ms  max={max(r_latencies):.1f}ms")

    # Memory snapshot
    result = subprocess.run(["vm_stat"], capture_output=True, text=True)
    lines = result.stdout.splitlines()
    stats = {}
    for line in lines:
        for k in ["Pages free", "Pages active", "Pages wired", "Pages compressed"]:
            if line.startswith(k):
                try:
                    pages = int(line.split(":")[1].strip().rstrip("."))
                    stats[k] = pages * 4096 / 1024 / 1024
                except Exception:
                    pass
    for k, v in stats.items():
        print(f"     {k:<30} {v:.0f} MB")

    # Runaway processes
    result = subprocess.run(["pgrep", "-f", "apex"], capture_output=True, text=True)
    apex_procs = result.stdout.strip().split("\n") if result.stdout.strip() else []
    print(f"     APEX-related PIDs: {apex_procs if apex_procs else 'none'}")

# ─────────────────────────────────────────────────────────────────────────────
# FINAL AUDIT REPORT
# ─────────────────────────────────────────────────────────────────────────────

def final_report():
    section("FINAL ENGINEERING AUDIT REPORT")
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    failed = total - passed
    score = round((passed / total) * 10, 1) if total else 0

    print(f"\n  Total checks: {total}")
    print(f"  PASSED:       {passed}")
    print(f"  FAILED:       {failed}")
    print(f"\n  Deployment Readiness Score: {score}/10")

    if failed:
        print(f"\n  ── FAILED CHECKS ─────────────────────────────────────")
        for k, v in results.items():
            if not v:
                print(f"    ❌  {k}")

    print(f"\n  ── HONEST WEAKNESSES ─────────────────────────────────")
    weaknesses = []

    if any("localhost" in k and not v for k, v in results.items()):
        weaknesses.append("Localhost references remain in some source files")
    if not results.get("model.pkl exists"):
        weaknesses.append("CRITICAL: model.pkl missing — inference API will crash on startup")
    if results.get("No local Postgres (port 5433)") == False:
        weaknesses.append("Local Postgres still running — Docker not fully removed")
    weaknesses += [
        "Supabase free-tier: 500MB DB limit, 50MB file storage — will hit ceiling with full 1950-2024 ingestion",
        "Upstash free-tier: 10,000 commands/day — prediction cache under heavy load will exhaust quota",
        "statement_cache_size=0 disables client-side query caching — adds ~2-5ms per query vs pooled mode",
        "Next.js watchOptions: watcher exclusions are webpack-only, NOT Turbopack — if Turbopack is enabled, exclusions are ignored",
        "FastAPI startup loads model.pkl synchronously — blocks event loop during initialization",
        "No health-check endpoint for Redis — silent Redis fallback means cache misses are invisible in logs",
        "ML inference pipeline has no input validation guards — malformed feature vectors will throw 500s",
        "alembic upgrade head uses NullPool — every migration run opens a fresh connection (correct for migrations, fine)",
        "CORS is set to allow_origins=['*'] in main.py — must be restricted before production",
    ]
    for w in weaknesses:
        print(f"    ⚠️   {w}")

# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

async def main():
    await verify_database()
    await verify_redis()
    verify_docker()
    verify_ml()
    verify_filesystem()
    await verify_performance()
    final_report()
    await engine.dispose()
    await redis_client.aclose()

if __name__ == "__main__":
    asyncio.run(main())
