from fastapi import FastAPI
from fastapi.responses import Response

app = FastAPI(title="APEX-F1 Deployment Final Isolation")

@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/favicon.ico")
def favicon():
    return Response(content="", media_type="image/x-icon")