"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, Loader2, AlertTriangle, Copy, Layers, Plus, Trash, Info, Mic2, Music, Download } from "lucide-react"
import { vibes, type Vibe } from "@/lib/chain-data"
import type { AudioAnalysisResult } from "@/lib/audio-interpretation"
import { buildDawPrompts } from "@/lib/daw-prompts"
import { stemRoleMeta, stemRoleToInstrumentRole, type StemRole } from "@/lib/stem-roles"
import { vocalTuningRecs } from "@/lib/vocal-tuning-recs"

const MAX_STEMS = 6

interface TranscribedNote {
  start_sec: number
  end_sec: number
  pitch_midi: number
  note_name: string
  confidence: number
}

interface StemEntry {
  id: string
  role: StemRole
  vibe: Vibe
  file: File | null
  fileName: string | null
  analyzing: boolean
  result: AudioAnalysisResult | null
  error: string | null
  transcribing: boolean
  transcribeError: string | null
  notes: TranscribedNote[] | null
  midiBase64: string | null
}

let nextId = 0
function makeStem(role: StemRole): StemEntry {
  nextId += 1
  return {
    id: `stem-${nextId}`,
    role,
    vibe: "psych-trip-hop",
    file: null,
    fileName: null,
    analyzing: false,
    result: null,
    error: null,
    transcribing: false,
    transcribeError: null,
    notes: null,
    midiBase64: null,
  }
}

function CopyPromptBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }
  return (
    <div className="rounded-lg border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Rebuild prompt</span>
        <Button size="sm" variant="outline" onClick={copy} className="gap-1.5">
          <Copy className="h-3.5 w-3.5" /> {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground bg-muted/40 rounded-md p-2">{text}</p>
    </div>
  )
}

function VocalTuningBlock() {
  return (
    <div className="rounded-lg border-2 border-pink-500/40 bg-pink-500/5 p-3 space-y-2">
      <div className="flex items-center gap-2 font-medium text-sm">
        <Mic2 className="h-4 w-4 text-pink-600" /> Vocal Tuning Recommendations (from your plugins)
      </div>
      {vocalTuningRecs.map((r) => (
        <div key={r.plugin} className="text-sm">
          <span className="font-medium">{r.plugin}</span>
          <span className="text-muted-foreground"> — {r.role}. {r.tip}</span>
        </div>
      ))}
    </div>
  )
}

function downloadMidi(base64: string, filename: string) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const blob = new Blob([bytes], { type: "audio/midi" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// Default 6 slots — Drums added since it's in virtually every track; FX moved to optional (add manually).
const DEFAULT_ROLES: StemRole[] = ["vocals", "drums", "bass", "guitar-electric", "synths", "other"]

export default function ReverseEngineerPage() {
  const [stems, setStems] = useState<StemEntry[]>(DEFAULT_ROLES.map(makeStem))

  function updateStem(id: string, patch: Partial<StemEntry>) {
    setStems((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  function addStem() {
    if (stems.length >= MAX_STEMS) return
    setStems((prev) => [...prev, makeStem("other")])
  }

  function removeStem(id: string) {
    setStems((prev) => prev.filter((s) => s.id !== id))
  }

  async function handleFile(id: string, file: File) {
    updateStem(id, {
      file,
      fileName: file.name,
      analyzing: true,
      error: null,
      result: null,
      notes: null,
      midiBase64: null,
      transcribeError: null,
    })
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/analyze-audio", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok || data.error) {
        updateStem(id, { analyzing: false, error: data.error || "Analysis failed" })
      } else {
        updateStem(id, { analyzing: false, result: data })
      }
    } catch (err) {
      updateStem(id, { analyzing: false, error: err instanceof Error ? err.message : "Analysis failed" })
    }
  }

  async function transcribe(stem: StemEntry) {
    if (!stem.file) return
    updateStem(stem.id, { transcribing: true, transcribeError: null, notes: null, midiBase64: null })
    try {
      const formData = new FormData()
      formData.append("file", stem.file)
      const res = await fetch("/api/transcribe-midi", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok || data.error) {
        updateStem(stem.id, { transcribing: false, transcribeError: data.error || "Transcription failed" })
      } else {
        updateStem(stem.id, { transcribing: false, notes: data.notes, midiBase64: data.midiBase64 })
      }
    } catch (err) {
      updateStem(stem.id, {
        transcribing: false,
        transcribeError: err instanceof Error ? err.message : "Transcription failed",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-6 space-y-2">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to FX Chain Builder
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Layers className="h-7 w-7 text-orange-600" /> Stem Reverse-Engineer
        </h1>
        <p className="text-muted-foreground">
          Upload up to 6 stems (Vocals, Drums, Bass, Guitar, Synths, Other — add FX manually if you have it).
          Get the key/tempo/tone profile, real note-by-note MIDI transcription, a Siren/DrumGPT rebuild prompt,
          and vocal tuning recs — all from your own gear.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16 space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            This analyzes and helps you rebuild each part — it does not process, modify, or strip anything from
            the original file. The goal is a fresh human performance in Logic, referencing what's detected here.
          </AlertDescription>
        </Alert>

        <Card className="border-2 border-slate-400/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Suno Import Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">WAV, not MIDI, for upload.</span> Suno generates
              audio, not symbolic/MIDI data — upload the .wav stems here.
            </p>
            <p>
              <span className="font-medium text-foreground">Want to hand notes to other musicians, or trigger Siren/DrumGPT/Rando?</span>{" "}
              Use "Transcribe to MIDI" below on any stem — it runs a real audio-to-MIDI model and gives you
              actual note pitches/timing, plus a downloadable .mid file.
            </p>
            <p>
              <span className="font-medium text-foreground">Tempo drift/lock:</span> Suno audio often isn't
              locked to a strict grid. In Logic, use <span className="font-medium text-foreground">Smart Tempo
              in "Adaptive" mode</span> to build a tempo map that follows the source's actual drift, rather than
              force-warping the audio (which causes artifacts). Do this before relying heavily on the
              transcription's timing for a click-locked arrangement.
            </p>
            <p>
              <span className="font-medium text-foreground">Don't have a perfect stem to rebuild from?</span> Your
              Landr sample library is a legitimate alternate source — load a similar-character sample into Rando
              instead of synthesizing from scratch.
            </p>
          </CardContent>
        </Card>

        {stems.map((stem) => {
          const roleMeta = stemRoleMeta.find((r) => r.id === stem.role)!
          const isVocalStem = stem.role === "vocals" || stem.role === "backing-vocals"
          const instrumentRole = stemRoleToInstrumentRole(stem.role)
          const dawPrompt =
            roleMeta.hasDawPrompt && stem.result && instrumentRole
              ? buildDawPrompts(
                  stem.vibe,
                  "drums",
                  `Detected key: ${stem.result.key.detected ?? "unknown"}. Detected tempo: ${
                    stem.result.tempo_estimate_bpm ?? "unknown"
                  } BPM.`,
                  [instrumentRole]
                )[0]
              : null

          return (
            <Card key={stem.id} className="border-2 border-orange-500/40">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-base">Stem</CardTitle>
                  <Button size="sm" variant="ghost" onClick={() => removeStem(stem.id)} className="gap-1.5 text-muted-foreground">
                    <Trash className="h-3.5 w-3.5" /> Remove
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Select value={stem.role} onValueChange={(v) => updateStem(stem.id, { role: v as StemRole })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {stemRoleMeta.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {roleMeta.hasDawPrompt && (
                    <Select value={stem.vibe} onValueChange={(v) => updateStem(stem.id, { vibe: v as Vibe })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {vibes.map((v) => (
                          <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{roleMeta.note}</p>

                <input
                  type="file"
                  id={`file-${stem.id}`}
                  accept="audio/*,.wav,.aiff,.mp3,.flac"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleFile(stem.id, f)
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById(`file-${stem.id}`)?.click()}
                    disabled={stem.analyzing}
                    className="gap-2"
                  >
                    {stem.analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {stem.analyzing ? "Analyzing..." : stem.fileName ? "Replace stem file" : "Upload stem"}
                  </Button>
                  {stem.file && (
                    <Button
                      variant="outline"
                      onClick={() => transcribe(stem)}
                      disabled={stem.transcribing}
                      className="gap-2"
                    >
                      {stem.transcribing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Music className="h-4 w-4" />}
                      {stem.transcribing ? "Transcribing..." : "Transcribe to MIDI"}
                    </Button>
                  )}
                </div>
                {stem.fileName && !stem.analyzing && <p className="text-xs text-muted-foreground">{stem.fileName}</p>}

                {stem.error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Couldn't analyze this stem</AlertTitle>
                    <AlertDescription>{stem.error}</AlertDescription>
                  </Alert>
                )}

                {stem.transcribeError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Couldn't transcribe this stem</AlertTitle>
                    <AlertDescription>{stem.transcribeError}</AlertDescription>
                  </Alert>
                )}

                {stem.result && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <StatBox label="Key" value={stem.result.key.detected ?? "—"} />
                      <StatBox label="Tempo" value={stem.result.tempo_estimate_bpm ? `${stem.result.tempo_estimate_bpm} BPM` : "—"} />
                      <StatBox label="LUFS" value={stem.result.loudness.integrated_lufs ?? "—"} />
                      <StatBox label="Crest Factor" value={`${stem.result.dynamics.crest_factor_db} dB`} />
                    </div>
                    {dawPrompt && <CopyPromptBlock text={dawPrompt.prompt} />}
                    {isVocalStem && <VocalTuningBlock />}
                  </div>
                )}

                {stem.notes && stem.midiBase64 && (
                  <div className="rounded-lg border-2 border-emerald-500/40 bg-emerald-500/5 p-3 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-sm font-medium">
                        {stem.notes.length} notes transcribed
                      </span>
                      <Button
                        size="sm"
                        onClick={() => downloadMidi(stem.midiBase64!, `${stem.role}-transcribed.mid`)}
                        className="gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5" /> Download .mid
                      </Button>
                    </div>
                    <div className="max-h-40 overflow-y-auto text-xs font-mono bg-background rounded p-2 space-y-0.5">
                      {stem.notes.slice(0, 40).map((n, i) => (
                        <div key={i} className="text-muted-foreground">
                          {n.start_sec.toFixed(2)}s — {n.note_name} (conf {(n.confidence * 100).toFixed(0)}%)
                        </div>
                      ))}
                      {stem.notes.length > 40 && (
                        <div className="text-muted-foreground italic">
                          + {stem.notes.length - 40} more (full list in the downloaded MIDI file)
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Drag the downloaded .mid into Logic to see/hear the notes, or hand it to another musician
                      as a reference for what's being played.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}

        <Button onClick={addStem} variant="outline" className="gap-2 w-full" disabled={stems.length >= MAX_STEMS}>
          <Plus className="h-4 w-4" />
          {stems.length >= MAX_STEMS ? "Maximum 6 stems reached" : `Add another stem (${stems.length}/${MAX_STEMS})`}
        </Button>
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border p-2 text-center">
      <p className="text-sm font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
