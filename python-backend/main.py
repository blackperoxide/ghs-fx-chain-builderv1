import base64
import os
import tempfile

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from analyze_audio import analyze
from transcribe_to_midi import transcribe

app = FastAPI(title="Grand Healing Studio — Audio DSP Backend")

# Vercel preview URLs are unpredictable (per-branch/per-PR subdomains), and this
# backend does no auth of its own yet — restrict via ALLOWED_ORIGIN in production
# if that becomes a concern. Wide open for now since it only does read-only DSP.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze-audio")
async def analyze_audio_endpoint(file: UploadFile = File(...)):
    suffix = os.path.splitext(file.filename or "")[1] or ".wav"
    fd, tmp_path = tempfile.mkstemp(suffix=suffix)
    try:
        with os.fdopen(fd, "wb") as tmp:
            tmp.write(await file.read())
        return analyze(tmp_path)
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


@app.post("/transcribe-midi")
async def transcribe_midi_endpoint(file: UploadFile = File(...)):
    suffix = os.path.splitext(file.filename or "")[1] or ".wav"
    fd, input_path = tempfile.mkstemp(suffix=suffix)
    output_path = input_path + ".mid"
    try:
        with os.fdopen(fd, "wb") as tmp:
            tmp.write(await file.read())

        summary = transcribe(input_path, output_path)

        with open(output_path, "rb") as f:
            midi_bytes = f.read()

        return {
            "noteCount": summary["note_count"],
            "notes": summary["notes"],
            "midiBase64": base64.b64encode(midi_bytes).decode("ascii"),
        }
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))
    finally:
        for p in (input_path, output_path):
            if os.path.exists(p):
                os.unlink(p)
