import os
import uvicorn
from fastapi import FastAPI

app = FastAPI(title="APEX-F1 Entry Debug")

@app.get("/")
async def root():
    return {"status": "ok", "mode": "minimal"}

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"DEBUG: Starting uvicorn on 0.0.0.0:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)