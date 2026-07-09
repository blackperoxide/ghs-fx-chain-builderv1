"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, Mic, MicOff, Lock, Unlock, Info, AlertTriangle } from "lucide-react"
import { accumulateChroma, estimateKeyFromChroma } from "@/lib/live-key-detect"

const FFT_SIZE = 8192
const DECAY = 0.95 // how much old chroma energy carries forward each frame — smooths flicker

function diagnoseMicError(err: unknown): { title: string; detail: string } {
  const name = err instanceof DOMException ? err.name : null

  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return {
      title: "Microphone permission was denied or blocked",
      detail:
        "Either you (or a previous visit) said no, or your browser/OS is blocking it silently without even showing a prompt. Fix: click the lock/info icon in your browser's address bar → find 'Microphone' → set it to 'Allow' → reload this page. On iPhone/Safari: Settings app → Safari → Camera & Microphone (or the site-specific toggle) → Allow, then reload.",
    }
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return {
      title: "No microphone was found",
      detail: "Your device didn't report any audio input. Check that a mic is actually connected/enabled, then reload.",
    }
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return {
      title: "Microphone is busy or unreadable",
      detail: "Another app (Logic, Zoom, another browser tab) may already be using the mic exclusively. Close other apps using it and try again.",
    }
  }
  if (name === "SecurityError") {
    return {
      title: "Blocked for security reasons",
      detail: "This page needs to be loaded over HTTPS at its own top-level address (not embedded inside another site/frame) for microphone access to work.",
    }
  }
  return {
    title: "Couldn't access the microphone",
    detail: `${err instanceof Error ? err.message : "Unknown error"}. Try: 1) check your OS-level microphone privacy settings have your browser enabled, 2) check the browser's own site permission for this page, 3) reload after fixing either.`,
  }
}

export default function KeyDetectorPage() {
  const [listening, setListening] = useState(false)
  const [locked, setLocked] = useState(false)
  const [detectedKey, setDetectedKey] = useState("—")
  const [confidence, setConfidence] = useState(0)
  const [error, setError] = useState<{ title: string; detail: string } | null>(null)
  const [permissionState, setPermissionState] = useState<string | null>(null)
  const [isSecureContext, setIsSecureContext] = useState(true)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const chromaRef = useRef<number[]>(new Array(12).fill(0))
  const lockedRef = useRef(false)

  useEffect(() => {
    setIsSecureContext(typeof window !== "undefined" ? window.isSecureContext : true)
    if (typeof navigator !== "undefined" && navigator.permissions) {
      navigator.permissions
        .query({ name: "microphone" as PermissionName })
        .then((status) => {
          setPermissionState(status.state)
          status.onchange = () => setPermissionState(status.state)
        })
        .catch(() => setPermissionState(null)) // some browsers (Safari) don't support querying mic permission
    }
  }, [])

  const tick = useCallback(() => {
    const analyser = analyserRef.current
    const ctx = audioCtxRef.current
    if (!analyser || !ctx) return

    const freqData = new Float32Array(analyser.frequencyBinCount)
    analyser.getFloatFrequencyData(freqData)

    const frameChroma = new Float32Array(12)
    accumulateChroma(frameChroma, freqData, ctx.sampleRate, FFT_SIZE)

    for (let i = 0; i < 12; i++) {
      chromaRef.current[i] = chromaRef.current[i] * DECAY + frameChroma[i]
    }

    if (!lockedRef.current) {
      const guess = estimateKeyFromChroma(chromaRef.current)
      setDetectedKey(guess.key)
      setConfidence(guess.confidence)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [])

  async function startListening() {
    setError(null)

    if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError({
        title: "This browser doesn't support microphone access here",
        detail: "Try opening this page directly in Chrome or Safari (not inside an embedded app view or an older browser).",
      })
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      })
      streamRef.current = stream
      const ctx = new AudioContext()
      audioCtxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = FFT_SIZE
      analyser.smoothingTimeConstant = 0
      source.connect(analyser)
      analyserRef.current = analyser
      chromaRef.current = new Array(12).fill(0)
      setListening(true)
      rafRef.current = requestAnimationFrame(tick)
    } catch (err) {
      setError(diagnoseMicError(err))
    }
  }

  function stopListening() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    audioCtxRef.current?.close()
    audioCtxRef.current = null
    analyserRef.current = null
    streamRef.current = null
    setListening(false)
    setLocked(false)
    lockedRef.current = false
  }

  function toggleLock() {
    const next = !locked
    setLocked(next)
    lockedRef.current = next
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto p-6 space-y-2">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to FX Chain Builder
        </Link>
        <h1 className="text-3xl font-bold">Live Key Detector</h1>
        <p className="text-muted-foreground">
          Listens through your microphone and guesses the key in real time — built for live/busking use when you
          can't hear the key by ear and don't have a DAW handy. Works right in this browser tab.
        </p>
      </div>

      <div className="max-w-xl mx-auto px-6 pb-16 space-y-6">
        {!isSecureContext && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>This page isn't loaded securely</AlertTitle>
            <AlertDescription>
              Microphone access requires HTTPS. Make sure you opened this exact link directly (not through a
              redirector or an insecure copy of the URL).
            </AlertDescription>
          </Alert>
        )}

        {permissionState === "denied" && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Microphone is currently set to "blocked" for this page</AlertTitle>
            <AlertDescription>
              Your browser won't even show the permission popup while it's set to blocked. Click the lock/info
              icon in the address bar → Microphone → Allow → then reload this page.
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-4 border-teal-500/60 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-lg">
              {listening ? (locked ? "Locked" : "Listening...") : "Not listening"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <p className="text-6xl font-bold tracking-tight">{detectedKey}</p>
              <p className="text-sm text-muted-foreground mt-3">
                Confidence: {(confidence * 100).toFixed(0)}%
                {confidence < 0.5 && confidence > 0 && " — play a clearer chord or a few more notes"}
              </p>
            </div>

            <div className="flex justify-center gap-3">
              {!listening ? (
                <Button size="lg" onClick={startListening} className="gap-2">
                  <Mic className="h-5 w-5" /> Start Listening
                </Button>
              ) : (
                <>
                  <Button size="lg" variant="outline" onClick={toggleLock} className="gap-2">
                    {locked ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                    {locked ? "Unlock" : "Lock this key"}
                  </Button>
                  <Button size="lg" variant="destructive" onClick={stopListening} className="gap-2">
                    <MicOff className="h-5 w-5" /> Stop
                  </Button>
                </>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{error.title}</AlertTitle>
                <AlertDescription>{error.detail}</AlertDescription>
              </Alert>
            )}

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Play a clear chord or a short scale run for a few seconds — it needs a moment of real harmonic
                content to lock onto a key. Once you're confident it's right, hit "Lock this key" so it stops
                updating while you keep playing (background noise/talking won't throw it off anymore).
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
