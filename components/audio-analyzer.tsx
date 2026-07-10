"use client"

import { useState, useRef, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Loader2, AlertTriangle, CheckCircle, AlertCircle, Activity } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts"
import { interpretAnalysis, severityRank, type AudioAnalysisResult, type Finding } from "@/lib/audio-interpretation"
import { genreProfiles, defaultGenreProfile } from "@/lib/genre-profiles"

const severityStyle: Record<string, { badge: string; icon: JSX.Element }> = {
  problem: { badge: "bg-red-600 text-white hover:bg-red-600", icon: <AlertCircle className="h-4 w-4" /> },
  watch: { badge: "bg-amber-500 text-white hover:bg-amber-500", icon: <AlertTriangle className="h-4 w-4" /> },
  good: { badge: "bg-emerald-600 text-white hover:bg-emerald-600", icon: <CheckCircle className="h-4 w-4" /> },
}

const bandLabels: Record<string, string> = {
  sub_bass: "Sub (20-60Hz)",
  bass: "Bass (60-250Hz)",
  low_mid: "Low-Mid (250-500Hz)",
  mid: "Mid (500-2k)",
  upper_mid: "Upper-Mid (2-4k)",
  presence: "Presence (4-6k)",
  brilliance: "Brilliance (6-10k)",
  air: "Air (10-16k)",
}

export function AudioAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AudioAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [profileId, setProfileId] = useState(defaultGenreProfile.id)
  const [airTarget, setAirTarget] = useState(defaultGenreProfile.airTargetPct)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const profile = genreProfiles.find((p) => p.id === profileId) ?? defaultGenreProfile

  const findings: Finding[] = useMemo(() => {
    if (!result) return []
    return interpretAnalysis(result, profile, airTarget).sort(
      (a, b) => severityRank(a.severity) - severityRank(b.severity)
    )
  }, [result, profile, airTarget])

  function handleProfileChange(id: string) {
    setProfileId(id)
    const p = genreProfiles.find((gp) => gp.id === id)
    if (p) setAirTarget(p.airTargetPct) // reset slider to the new profile's default, still adjustable after
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/analyze-audio", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error || "Analysis failed")
      } else {
        setResult(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed")
    } finally {
      setAnalyzing(false)
    }
  }

  const chartData = result
    ? Object.entries(result.spectral_balance_pct).map(([key, value]) => ({
        band: bandLabels[key] || key,
        pct: value,
      }))
    : []

  return (
    <Card className="border-2 border-sky-500/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-sky-600" />
          Audio Production Analyzer
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload a mix or master (WAV/AIFF/MP3). Get an objective, engineer-level read on LUFS loudness, true
          peak, dynamic range, muddiness, harshness, air, wasted frequency space, and bass mono-compatibility —
          measured, not guessed.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Genre profile (shifts what "good" means)</Label>
            <Select value={profileId} onValueChange={handleProfileChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {genreProfiles.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{profile.description}</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Air target: {airTarget}%</Label>
            </div>
            <Slider
              value={[airTarget]}
              onValueChange={([v]) => setAirTarget(v)}
              min={0}
              max={10}
              step={0.5}
            />
            <p className="text-xs text-muted-foreground">
              How much 10-16kHz brightness you want. Defaults per genre, drag to taste — re-scores instantly, no
              re-upload needed.
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.wav,.aiff,.mp3,.flac"
          className="hidden"
          onChange={handleFile}
        />
        <Button onClick={() => fileInputRef.current?.click()} disabled={analyzing} className="gap-2">
          {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {analyzing ? "Analyzing..." : "Upload track to analyze"}
        </Button>
        {fileName && !analyzing && <p className="text-sm text-muted-foreground">Last analyzed: {fileName}</p>}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Couldn't analyze this file</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <StatBox label="LUFS (Integrated)" value={result.loudness.integrated_lufs ?? "—"} />
              <StatBox label="True Peak" value={`${result.peaks.true_peak_dbtp} dBTP`} />
              <StatBox label="Loudness Range" value={`${result.loudness.loudness_range_lu} LU`} />
              <StatBox label="Crest Factor" value={`${result.dynamics.crest_factor_db} dB`} />
              <StatBox
                label={`Detected Key${result.key.confidence < 0.6 ? " (low confidence)" : ""}`}
                value={result.key.detected ?? "—"}
              />
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Spectral Balance</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="band" angle={-35} textAnchor="end" interval={0} height={60} tick={{ fontSize: 11 }} />
                  <YAxis unit="%" />
                  <Tooltip />
                  <Bar dataKey="pct" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">
                Findings <span className="text-muted-foreground font-normal">— scored against {profile.label}</span>
              </p>
              {findings.map((f) => (
                <div key={f.id} className="rounded-lg border p-3 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={severityStyle[f.severity].badge}>
                      <span className="flex items-center gap-1">
                        {severityStyle[f.severity].icon}
                        {f.severity.toUpperCase()}
                      </span>
                    </Badge>
                    <span className="font-medium">{f.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{f.detail}</p>
                  <p className="text-sm"><span className="font-medium">Fix: </span>{f.fix}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
