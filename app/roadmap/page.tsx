"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Volume2, ArrowRight, RotateCcw, CheckCircle, Map } from "lucide-react"
import { cn } from "@/lib/utils"
import { roadmapSteps } from "@/lib/roadmap-steps"

const INDEX_KEY = "ghs-roadmap-index"
const CHECKED_KEY = "ghs-roadmap-checked"
const AUTOREAD_KEY = "ghs-focus-autoread" // shared with Active Cue so the setting carries over
const RATE_KEY = "ghs-focus-speech-rate"
const DEFAULT_RATE = 0.9

const rateOptions = [
  { value: "0.75", label: "Slowest" },
  { value: "0.8", label: "Slower" },
  { value: "0.9", label: "Default (a little slow)" },
  { value: "1.0", label: "Normal speed" },
]

export default function RoadmapPage() {
  const [index, setIndex] = useState(0)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [autoRead, setAutoRead] = useState(false)
  const [rate, setRate] = useState(DEFAULT_RATE)
  const [speechSupported, setSpeechSupported] = useState(false)
  const hasMounted = useRef(false)

  useEffect(() => {
    setSpeechSupported(typeof window !== "undefined" && "speechSynthesis" in window)
    const storedIndex = window.localStorage.getItem(INDEX_KEY)
    const storedChecked = window.localStorage.getItem(CHECKED_KEY)
    const storedAutoRead = window.localStorage.getItem(AUTOREAD_KEY)
    const storedRate = window.localStorage.getItem(RATE_KEY)
    setIndex(storedIndex ? Math.min(parseInt(storedIndex, 10), roadmapSteps.length) : 0)
    setChecked(storedChecked ? JSON.parse(storedChecked) : {})
    setAutoRead(storedAutoRead !== null ? storedAutoRead === "true" : false)
    setRate(storedRate !== null ? parseFloat(storedRate) : DEFAULT_RATE)
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (!speechSupported) return
      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(text)
      utter.rate = rate
      window.speechSynthesis.speak(utter)
    },
    [speechSupported, rate]
  )

  const current = roadmapSteps[index]
  const isComplete = index >= roadmapSteps.length

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      return
    }
    if (!autoRead || !speechSupported) return
    if (isComplete) {
      speak("You've been through the whole song roadmap. Nice work.")
      return
    }
    if (current) {
      speak(`${current.title}. ${current.plain} Where: ${current.where}.`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  function persistIndex(next: number) {
    setIndex(next)
    window.localStorage.setItem(INDEX_KEY, String(next))
  }

  function persistChecked(next: Record<string, boolean>) {
    setChecked(next)
    window.localStorage.setItem(CHECKED_KEY, JSON.stringify(next))
  }

  function markDoneAndNext() {
    if (current) persistChecked({ ...checked, [current.id]: true })
    persistIndex(Math.min(index + 1, roadmapSteps.length))
  }

  function goBack() {
    persistIndex(Math.max(index - 1, 0))
  }

  function jumpTo(i: number) {
    persistIndex(i)
  }

  function repeat() {
    if (current) speak(`${current.title}. ${current.plain} Where: ${current.where}.`)
  }

  function toggleAutoRead(value: boolean) {
    setAutoRead(value)
    window.localStorage.setItem(AUTOREAD_KEY, String(value))
    if (value) speak("Voice cues turned on for the roadmap too.")
    else window.speechSynthesis?.cancel()
  }

  function changeRate(value: string) {
    const parsed = parseFloat(value)
    setRate(parsed)
    window.localStorage.setItem(RATE_KEY, String(parsed))
  }

  function startOver() {
    persistIndex(0)
    persistChecked({})
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6 space-y-2">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to FX Chain Builder
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Map className="h-7 w-7 text-indigo-600" /> Song Roadmap
        </h1>
        <p className="text-muted-foreground">
          The big picture, one step at a time. This is the whole path from idea to finished song — every tool
          has its place here.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-16">
        <Card className="border-4 border-indigo-500/60 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Where you are</CardTitle>
            <Progress value={isComplete ? 100 : (index / roadmapSteps.length) * 100} />
          </CardHeader>
          <CardContent className="space-y-4">
            {speechSupported && (
              <div className="rounded-lg border p-3 space-y-3 bg-muted/30">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="roadmap-autoread" className="font-medium">Voice cues</Label>
                    <Switch id="roadmap-autoread" checked={autoRead} onCheckedChange={toggleAutoRead} />
                  </div>
                  <span className="text-xs text-muted-foreground">Off by default</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Label className="text-sm text-muted-foreground">Pace:</Label>
                  <Select value={String(rate)} onValueChange={changeRate}>
                    <SelectTrigger className="w-[220px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {rateOptions.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {roadmapSteps.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => jumpTo(i)}
                  className={cn(
                    "h-7 w-7 rounded-full text-xs font-semibold border flex items-center justify-center transition-colors",
                    i === index && !isComplete && "bg-indigo-600 text-white border-indigo-600",
                    checked[s.id] && i !== index && "bg-emerald-500 text-white border-emerald-500",
                    i !== index && !checked[s.id] && "bg-background text-muted-foreground"
                  )}
                  aria-label={`Jump to ${s.title}`}
                >
                  {checked[s.id] ? <CheckCircle className="h-4 w-4" /> : i + 1}
                </button>
              ))}
            </div>

            {!isComplete && current ? (
              <div className="space-y-3 rounded-xl border-2 border-indigo-300 bg-indigo-500/5 p-5">
                <p className="text-2xl font-bold leading-snug">{current.title}</p>
                <p className="text-lg">{current.plain}</p>
                <p className="text-sm text-muted-foreground">Where: {current.where}</p>
              </div>
            ) : (
              <div className="space-y-3 rounded-xl border-2 border-emerald-400 bg-emerald-500/5 p-5">
                <p className="flex items-center gap-2 text-xl font-bold text-emerald-700">
                  <CheckCircle className="h-6 w-6" /> That's the whole roadmap
                </p>
                <p className="text-lg">Come back here any time you lose track of what's next.</p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <Button size="lg" variant="outline" onClick={goBack} disabled={index === 0} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              {speechSupported && (
                <Button size="lg" variant="outline" onClick={repeat} className="gap-2">
                  <Volume2 className="h-4 w-4" /> Repeat aloud
                </Button>
              )}
              {!isComplete && (
                <Button size="lg" onClick={markDoneAndNext} className="gap-2 flex-1 sm:flex-none">
                  <ArrowRight className="h-4 w-4" /> Done — Next Step
                </Button>
              )}
              <Button size="lg" variant="ghost" onClick={startOver} className="gap-2 text-muted-foreground">
                <RotateCcw className="h-4 w-4" /> Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
