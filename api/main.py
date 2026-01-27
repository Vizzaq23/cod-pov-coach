from __future__ import annotations

import json
import subprocess
from fractions import Fraction
from pathlib import Path
from typing import Any, Dict

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="CoD POV Coach API", version="0.1.0")

# Allow local Next.js dev server to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> Dict[str, Any]:
    return {"ok": True, "service": "cod-pov-coach-api"}


def _get_uploads_dir() -> Path:
    """Return the outputs/uploads directory, creating it if needed.

    The directory is created at the repo root: ./outputs/uploads
    """
    # api/main.py -> repo_root / "outputs" / "uploads"
    repo_root = Path(__file__).resolve().parent.parent
    uploads_dir = repo_root / "outputs" / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    return uploads_dir


def _probe_video_metadata(path: Path) -> Dict[str, Any]:
    """Use ffprobe to extract duration, resolution, and fps for a video file."""
    try:
        result = subprocess.run(
            [
                "ffprobe",
                "-v",
                "error",
                "-select_streams",
                "v:0",
                "-show_entries",
                "stream=width,height,r_frame_rate",
                "-show_entries",
                "format=duration",
                "-of",
                "json",
                str(path),
            ],
            capture_output=True,
            text=True,
            check=True,
        )
    except FileNotFoundError:
        raise HTTPException(
            status_code=500,
            detail="ffprobe not found. Make sure FFmpeg is installed and in PATH.",
        )
    except subprocess.CalledProcessError as exc:
        raise HTTPException(
            status_code=500,
            detail=f"ffprobe failed: {exc.stderr.strip() or 'Unknown error'}",
        )

    try:
        info = json.loads(result.stdout)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse ffprobe output.")

    streams = info.get("streams") or []
    if not streams:
        raise HTTPException(status_code=400, detail="No video stream found in file.")

    stream = streams[0]
    width = stream.get("width")
    height = stream.get("height")

    # r_frame_rate is usually a fraction like "30000/1001"
    r_frame_rate = stream.get("r_frame_rate") or "0/1"
    try:
        fps = float(Fraction(r_frame_rate))
    except (ValueError, ZeroDivisionError):
        fps = 0.0

    fmt = info.get("format") or {}
    try:
        duration = float(fmt.get("duration", 0.0))
    except (TypeError, ValueError):
        duration = 0.0

    return {
        "duration": duration,
        "width": width,
        "height": height,
        "fps": fps,
    }


@app.post("/upload")
async def upload_video(file: UploadFile = File(...)) -> Dict[str, Any]:
    """Accept an MP4 upload, save it, and return basic metadata."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file name provided.")

    # Basic content type / extension sanity check (not bulletproof but fine here)
    if not (
        (file.content_type and file.content_type.startswith("video/"))
        or file.filename.lower().endswith(".mp4")
    ):
        raise HTTPException(status_code=400, detail="Only MP4 video files are allowed.")

    uploads_dir = _get_uploads_dir()

    # Simple, readable video_id based on filename; could be swapped for UUID later
    safe_name = Path(file.filename).name
    video_id = safe_name.rsplit(".", 1)[0]

    # Ensure unique path by prefixing with an increment if needed
    target_path = uploads_dir / safe_name
    counter = 1
    while target_path.exists():
        stem = target_path.stem
        suffix = target_path.suffix
        target_path = uploads_dir / f"{stem}_{counter}{suffix}"
        counter += 1

    # Save the uploaded file
    contents = await file.read()
    try:
        target_path.write_bytes(contents)
    except OSError as exc:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {exc}")

    metadata = _probe_video_metadata(target_path)

    return {
        "video_id": video_id,
        "file_name": target_path.name,
        "metadata": metadata,
    }
