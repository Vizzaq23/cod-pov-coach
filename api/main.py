from fastapi import FastAPI

app = FastAPI(title="CoD POV Coach API", version="0.1.0")


@app.get("/health")
def health():
    return {"ok": True, "service": "cod-pov-coach-api"}
