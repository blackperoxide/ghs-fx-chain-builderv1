// The audio-analysis / MIDI-transcription DSP (librosa, pyloudnorm, basic-pitch) can't run
// in a Vercel serverless function, so it lives in a separate FastAPI service on Railway
// (see python-backend/). These two API routes proxy to it over HTTP.
export function getPythonBackendUrl(path: string): string {
  const base = process.env.PYTHON_BACKEND_URL
  if (!base) {
    throw new Error("PYTHON_BACKEND_URL is not configured")
  }
  return `${base.replace(/\/$/, "")}${path}`
}
