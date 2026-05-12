from fastapi import FastAPI

app = FastAPI(title="APEX-F1 Production-Grade Debug")

@app.get("/")
def root():
    return {"status": "ok", "mode": "gunicorn-uvicorn"}

@app.get("/health")
def health():
    return {"status": "ok"}