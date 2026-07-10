"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Volume2, ArrowLeft, ArrowRight, RotateCcw, CheckCircle, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChecklistStage } from "./build-checklist"

interface FocusCueProps {
  chainKey: string
  chainLabel: string
  suggestedPresetName: string
  stages: ChecklistStage[]
}

const AUTOREAD_KEY = "ghs-focus-autoread"
const RATE_KEY = "ghs-focus-speech-rate"
const DEFAULT_RATE = 0.9 // ~5% slower than the previous 0.95 default

const rateOptions = [
  { value: "0.75", label: "Slowest" },
  { value: "0.8", label: "Slower" },
  { value: "0.9", label: "Default (a little slow)" },
  { value: "1.0", label: "Normal speed" },
]

export function FocusCue({ chainKey, chainLabel, suggestedPresetName, stages }: FocusCueProps) {
  const indexKey = `ghs-focus-index-${chainKey}`
  const checkedKey = `ghs-checklist-${chainKey}` // shared with BuildChecklist so both stay in sync

  const [index, setIndex] = useState(0)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [autoRead, setAutoRead] = useState(false) // OFF by default — voice is opt-in, not a surprise
  const [rate, setRate] = useState(DEFAULT_RATE)
  const [speechSupported, setSpeechSupported] = useState(false)
  const hasMounted = useRef(false)

  useEffect(() => {
    setSpeechSupported(typeof window !== "undefined" && "speechSynthesis" in window)
    const storedIndex = window.localStorage.getItem(indexKey)
    const storedChecked = window.localStorage.getItem(checkedKey)
    const storedAutoRead = window.localStorage.getItem(AUTOREAD_KEY)
    const storedRate = window.localStorage.getItem(RATE_KEY)
    setIndex(storedIndex ? Math.min(parseInt(storedIndex, 10), stages.length) : 0)
    setChecked(storedChecked ? JSON.parse(storedChecked) : {})
    setAutoRead(storedAutoRead !== null ? storedAutoRead === "true" : false)
    setRate(storedRate !== null ? parseFloat(storedRate) : DEFAULT_RATE)
    hasMounted.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainKey])

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

  const current = stages[index]
  const isComplete = index >= stages.length

  // Auto-read the current step when it changes, but ONLY if the user has opted in,
  // and never on the very first render of a fresh visit (avoids a surprise voice on page load).
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      return
    }
    if (!autoRead || !speechSupported) return
    if (isComplete) {
      speak(`All stages built. Save this as ${suggestedPresetName} in Logic now.`)
      return
    }
    if (current) {
      speak(`Step ${index + 1} of ${stages.length}. ${current.name}. ${current.pluginLine}. ${current.tip}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, chainKey])

  function persistIndex(next: number) {
    setIndex(next)
    window.localStorage.setItem(indexKey, String(next))
  }

  function persistChecked(next: Record<string, boolean>) {
    setChecked(next)
    window.localStorage.setItem(checkedKey, JSON.stringify(next))
  }

  function markDoneAndNext() {
    if (current) {
      persistChecked({ ...checked, [current.id]: true })
    }
    persistIndex(Math.min(index + 1, stages.length))
  }

  function goBack() {
    persistIndex(Math.max(index - 1, 0))
  }

  function jumpTo(i: number) {
    persistIndex(i)
  }

  function repeat() {
    if (isComplete) {
      speak(`All stages built. Save this as ${suggestedPresetName} in Logic now.`)
    } else if (current) {
      speak(`Step ${index + 1} of ${stages.length}. ${current.name}. ${current.pluginLine}. ${current.tip}`)
    }
  }

  function toggleAutoRead(value: boolean) {
    setAutoRead(value)
    window.localStorage.setItem(AUTOREAD_KEY, String(value))
    if (value) {
      // Give a gentle, predictable confirmation the first time it's turned on, instead of
      // silently going live and speaking unexpectedly on the next step change.
      speak("Voice cues turned on. I'll read each step out loud as you go.")
    } else {
      window.speechSynthesis?.cancel()
    }
  }

  function changeRate(value: string) {
    const parsed = parseFloat(value)
    setRate(parsed)
    window.localStorage.setItem(RATE_KEY, String(parsed))
  }

  function testVoice() {
    if (!speechSupported) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance("This is how the voice cue will sound at this pace.")
    utter.rate = rate
    window.speechSynthesis.speak(utter)
  }

  function startOver() {
    persistIndex(0)
    persistChecked({})
  }

  return (
    <Card className="border-4 border-violet-500/60 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-violet-600" />
          Active Cue — {chainLabel}
        </CardTitle>
        <Progress value={isComplete ? 100 : (index / stages.length) * 100} />
      </CardHeader>
      <CardContent className="space-y-4">
        {speechSupported && (
          <div className="rounded-lg border p-3 space-y-3 bg-muted/30">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="autoread" className="font-medium">
                  Voice cues (reads each step aloud)
                </Label>
                <Switch id="autoread" checked={autoRead} onCheckedChange={toggleAutoRead} />
              </div>
              <span className="text-xs text-muted-foreground">Off by default — turn on when you're ready</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Label className="text-sm text-muted-foreground">Pace:</Label>
              <Select value={String(rate)} onValueChange={changeRate}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rateOptions.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" onClick={testVoice} className="gap-2">
                <Volume2 className="h-3.5 w-3.5" /> Test voice
              </Button>
            </div>
          </div>
        )}

        {/* Quick-jump dots so you can always jump back to exactly where you were, even after a break */}
        <div className="flex flex-wrap gap-1.5">
          {stages.map((s, i) => (
            <button
              key={s.id}
              onClick={() => jumpTo(i)}
              className={cn(
                "h-7 w-7 rounded-full text-xs font-semibold border flex items-center justify-center transition-colors",
                i === index && !isComplete && "bg-violet-600 text-white border-violet-600",
                checked[s.id] && i !== index && "bg-emerald-500 text-white border-emerald-500",
                i !== index && !checked[s.id] && "bg-background text-muted-foreground"
              )}
              aria-label={`Jump to step ${i + 1}: ${s.name}`}
            >
              {checked[s.id] ? <CheckCircle className="h-4 w-4" /> : i + 1}
            </button>
          ))}
        </div>

        {!isComplete && current ? (
          <div className="space-y-3 rounded-xl border-2 border-violet-300 bg-violet-500/5 p-5">
            <p className="text-sm text-muted-foreground font-medium">
              STEP {index + 1} OF {stages.length} — DO THIS NOW
            </p>
            <p className="text-2xl font-bold leading-snug">{current.name}</p>
            <p className="text-lg">{current.pluginLine}</p>
            <p className="text-muted-foreground">{current.tip}</p>
          </div>
        ) : (
          <div className="space-y-3 rounded-xl border-2 border-emerald-400 bg-emerald-500/5 p-5">
            <p className="flex items-center gap-2 text-xl font-bold text-emerald-700">
              <CheckCircle className="h-6 w-6" /> All stages built
            </p>
            <p className="text-lg">
              In Logic now: Channel Strip Settings menu &rarr; <span className="font-semibold">Save Channel Strip Setting As...</span>
            </p>
            <Badge variant="secondary" className="text-base py-1 px-3">{suggestedPresetName}</Badge>
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

        {!speechSupported && (
          <p className="text-xs text-muted-foreground">
            Voice readout isn't available in this browser — try Safari or Chrome for spoken cues.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
