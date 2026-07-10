"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Copy, CheckCircle, ListChecks } from "lucide-react"

export interface ChecklistStage {
  id: string
  name: string
  pluginLine: string
  tip: string
}

interface BuildChecklistProps {
  chainKey: string // unique id per chain, e.g. "drums:heavy-glitch" or "vocals:ovo-toledo"
  chainLabel: string
  suggestedPresetName: string
  stages: ChecklistStage[]
}

export function BuildChecklist({ chainKey, chainLabel, suggestedPresetName, stages }: BuildChecklistProps) {
  const storageKey = `ghs-checklist-${chainKey}`
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null
    setChecked(stored ? JSON.parse(stored) : {})
    setCopied(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainKey])

  function toggle(id: string) {
    const next = { ...checked, [id]: !checked[id] }
    setChecked(next)
    window.localStorage.setItem(storageKey, JSON.stringify(next))
  }

  function resetChecklist() {
    setChecked({})
    window.localStorage.removeItem(storageKey)
  }

  const doneCount = stages.filter((s) => checked[s.id]).length
  const progressPct = stages.length > 0 ? Math.round((doneCount / stages.length) * 100) : 0
  const allDone = stages.length > 0 && doneCount === stages.length

  const buildSheetText = useMemo(() => {
    const lines = [
      `${chainLabel} — Build Sheet`,
      "",
      ...stages.map((s, i) => `${i + 1}. ${s.name}\n   Plugin: ${s.pluginLine}\n   ${s.tip}`),
      "",
      `When done: Channel Strip Settings menu -> "Save Channel Strip Setting As..." -> name it "${suggestedPresetName}"`,
    ]
    return lines.join("\n")
  }, [chainLabel, stages, suggestedPresetName])

  async function copyBuildSheet() {
    try {
      await navigator.clipboard.writeText(buildSheetText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API may be blocked — fall back silently, text is still visible below
    }
  }

  return (
    <Card className="border-2 border-blue-500/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ListChecks className="h-5 w-5 text-blue-600" />
          Build Checklist — {chainLabel}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Keep this open next to Logic. Check off each stage as you insert it on the channel strip. When you hit
          100%, save it as a Channel Strip Setting using the name below — that becomes your permanent one-click
          recall.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{doneCount} / {stages.length} stages built</span>
            <span>{progressPct}%</span>
          </div>
          <Progress value={progressPct} />
        </div>

        <div className="space-y-2">
          {stages.map((s, i) => (
            <label
              key={s.id}
              className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent/50 transition-colors"
            >
              <Checkbox checked={!!checked[s.id]} onCheckedChange={() => toggle(s.id)} className="mt-0.5" />
              <div className="space-y-0.5">
                <p className={checked[s.id] ? "line-through text-muted-foreground" : "font-medium"}>
                  {i + 1}. {s.name}
                </p>
                <p className="text-sm text-muted-foreground">{s.pluginLine}</p>
              </div>
            </label>
          ))}
        </div>

        {allDone && (
          <div className="rounded-lg border-2 border-emerald-500/50 bg-emerald-500/5 p-3 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <CheckCircle className="h-4 w-4" /> All stages built — save it now
            </div>
            <p className="text-sm">
              In Logic: Channel Strip Settings menu &rarr; <span className="font-semibold">Save Channel Strip Setting As...</span>
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">{suggestedPresetName}</Badge>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button onClick={copyBuildSheet} variant="outline" className="gap-2">
            <Copy className="h-4 w-4" /> {copied ? "Copied!" : "Copy build sheet as text"}
          </Button>
          <Button onClick={resetChecklist} variant="ghost" className="text-muted-foreground">
            Reset checklist
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
