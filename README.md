<!-- README presentation: Vizzaq23 portfolio palette -->
<p align="center">
  <a href="https://github.com/Vizzaq23"><img src="https://img.shields.io/badge/Vizzaq23%20%C2%B7%20VIDEO%20INGESTION%20PROTOTYPE-101722?style=flat-square&amp;labelColor=101722&amp;color=D7B877" alt="Vizzaq23 · VIDEO INGESTION PROTOTYPE" /></a>
</p>

<h1 align="center">CoD POV Coach</h1>

<p align="center"><strong>The first step toward gameplay review: upload a clip and inspect its metadata.</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-101722?style=flat-square&amp;labelColor=101722&amp;color=85CFE8" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-101722?style=flat-square&amp;labelColor=101722&amp;color=D7B877" alt="FastAPI" />
  <img src="https://img.shields.io/badge/FFprobe-101722?style=flat-square&amp;labelColor=101722&amp;color=B8A1E3" alt="FFprobe" />
</p>

<p align="center">
  <a href="https://quintinvizza.dev">Portfolio</a> · <a href="https://github.com/Vizzaq23">GitHub profile</a>
</p>

<p align="center">
  <a href="#overview">Overview</a> · <a href="#request-flow">Request flow</a> · <a href="#run-locally">Quick start</a> · <a href="#code-map">Code map</a> · <a href="#limitations-and-next-steps">Limitations</a>
</p>

<img src="https://raw.githubusercontent.com/Vizzaq23/Vizzaq23/main/assets/divider.svg" width="100%" alt="" />

## Overview

A Next.js interface and FastAPI backend for uploading a local gameplay video and inspecting its duration, resolution, and frame rate with FFprobe.

**Status:** early ingestion prototype. The current code extracts video metadata; gameplay coaching, event detection, and tactical analysis are not implemented.

## Request flow

```text
Next.js upload form → POST /upload → local video file → FFprobe → metadata response
```

The API also exposes `GET /health`. Uploaded files are written to `outputs/uploads/`.

## Run locally

Install Python, Node.js, and FFmpeg with `ffprobe` on PATH.

```sh
git clone https://github.com/Vizzaq23/cod-pov-coach.git
cd cod-pov-coach
python -m venv .venv
```

Activate the environment, then install the API's direct dependencies:

```sh
python -m pip install fastapi uvicorn python-multipart
python -m uvicorn api.main:app --reload --port 8000
```

In a second terminal:

```sh
cd web
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000). Select a local MP4 and submit it. The frontend currently points directly to `http://localhost:8000/upload`.

## Code map

- [api/main.py](api/main.py): upload handling, local storage, metadata extraction, and CORS.
- [web/src/app/page.tsx](web/src/app/page.tsx): upload form, loading/error states, and metadata display.

## Limitations and next steps

The prototype has no authentication, retention policy, upload-size cap, or automated gameplay analysis. It reads each upload into memory and keeps files locally. Before public deployment, add bounded streaming uploads, cleanup, configured API origins, dependency locks, and automated API tests.

The project name describes the intended direction; the implemented milestone is video ingestion and metadata inspection.

[Quintin Vizza — engineering portfolio](https://www.quintinvizza.dev/)

<img src="https://raw.githubusercontent.com/Vizzaq23/Vizzaq23/main/assets/divider.svg" width="100%" alt="" />

<p align="center"><sub>Built by <a href="https://github.com/Vizzaq23">Quintin Vizza</a> · <a href="https://quintinvizza.dev">Explore my work</a></sub></p>
