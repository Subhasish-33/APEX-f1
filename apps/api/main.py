import os
import uvicorn
from fastapi import FastAPI, Request
import time

app = FastAPI(title="APEX-F1 Deep Debug")

@app.get("/")
def root():
    return {"status": "ok", "mode": "deep-debug", "timestamp": time.time()}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"DEBUG: Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    print(f"DEBUG: Outgoing response: {response.status_code}")
    return response

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"DEBUG: Starting APEX-F1 on 0.0.0.0:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="debug")