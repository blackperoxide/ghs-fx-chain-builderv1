"use client"

import { useState, useRef, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, Loader2, AlertTriangle, CheckCircle, Target, ArrowRightLeft } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Legend } from "recharts"
import type { AudioAnalysisResult } from "@/lib/audio-interpretation"
import { compareAnalyses, abSeverityRank, type AbFinding, type AbSeverity } from "@/lib/ab-compare"

const severityStyle: Record<AbSeverity, { badge: string; icon: JSX.Element }> = {
  priority: { badge: "bg-red-600 text-white hover:bg-red-600", icon: <AlertTriangle className="h-4 w-4" /> },
  notable: { badge: "bg-amber-500 text-white hover:bg-amber-500", icon: <Target className="h-4 w-4" /> },
  match: { badge: "bg-emerald-600 text-white hover:bg-emerald-600", icon: <CheckCircle className="h-4 w-4" /> },
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

async function analyzeFile(file: File): Promise<{ result?: AudioAnalysisResult; error?: string }> {
  const formData = new FormData()
  formData.append("file", file)
  const res = await fetch("/api/analyze-audio", { method: "POST", body: formData })
  const data = await res.json()
  if (!res.ok || data.error) return { error: data.error || "Analysis failed" }
  return { result: data }
}

function UploadSlot({
  label,
  fileName,
  analyzing,
  onFile,
}: {
  label: string
  fileName: string | null
  analyzing: boolean
  onFile: (file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*,.wav,.aiff,.mp3,.flac"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
        }}
      />
      <Button onClick={() => inputRef.current?.click()} disabled={analyzing} variant="outline" className="gap-2 w-full">
        {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {analyzing ? "Analyzing..." : fileName ? "Replace file" : "Upload"}
      </Button>
      {fileName && !analyzing && <p className="text-xs text-muted-foreground truncate">{fileName}</p>}
    </div>
  )
}

export function AudioAbCompare() {
  const [mineResult, setMineResult] = useState<AudioAnalysisResult | null>(null)
  const [refResult, setRefResult] = useState<AudioAnalysisResult | null>(null)
  const [mineName, setMineName] = useState<string | null>(null)
  const [refName, setRefName] = useState<string | null>(null)
  const [analyzingMine, setAnalyzingMine] = useState(false)
  const [analyzingRef, setAnalyzingRef] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleMineFile(file: File) {
    setMineName(file.name)
    setAnalyzingMine(true)
    setError(null)
    const { result, error: err } = await analyzeFile(file)
    if (err) setError(err)
    else setMineResult(result!)
    setAnalyzingMine(false)
  }

  async function handleRefFile(file: File) {
    setRefName(file.name)
    setAnalyzingRef(true)
    setError(null)
    const { result, error: err } = await analyzeFile(file)
    if (err) setError(err)
    else setRefResult(result!)
    setAnalyzingRef(false)
  }

  const findings: AbFinding[] = useMemo(() => {
    if (!mineResult || !refResult) return []
    return compareAnalyses(mineResult, refResult).sort((a, b) => abSeverityRank(a.severity) - abSeverityRank(b.severity))
  }, [mineResult, refResult])

  const chartData = useMemo(() => {
    if (!mineResult || !refResult) return []
    return Object.keys(refResult.spectral_balance_pct).map((band) => ({
      band: bandLabels[band] || band,
      Yours: mineResult.spectral_balance_pct[band] ?? 0,
      Reference: refResult.spectral_balance_pct[band] ?? 0,
    }))
  }, [mineResult, refResult])

  return (
    <Card className="border-2 border-teal-500/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ArrowRightLeft className="h-5 w-5 text-teal-600" />
          A/B Reference Compare
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload your reproduction attempt and a reference track (Suno render, commercial track, anything). Get
          the exact gap between them and which of your plugins closes it — reverse-engineering, not guessing.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <UploadSlot label="Your Reproduction" fileName={mineName} analyzing={analyzingMine} onFile={handleMineFile} />
          <UploadSlot label="Reference Track" fileName={refName} analyzing={analyzingRef} onFile={handleRefFile} />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Couldn't analyze a file</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {mineResult && refResult && (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-medium mb-2">Spectral Balance — Yours vs Reference</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="band" angle={-35} textAnchor="end" interval={0} height={60} tick={{ fontSize: 11 }} />
                  <YAxis unit="%" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Yours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Reference" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Gap Analysis — ranked by priority to fix</p>
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
              {findings.length === 0 && (
                <p className="text-sm text-muted-foreground italic">Very close match — no significant gaps found.</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
