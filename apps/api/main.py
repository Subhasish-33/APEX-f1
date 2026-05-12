from fastapi import FastAPI

app = FastAPI(title="APEX-F1 Debug Mode")

@app.get("/")
async def root():
    return {"message": "APEX-F1 API running"}

@app.get("/health")
async def health():
    return {"status": "ok"}