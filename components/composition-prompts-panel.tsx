"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { compositionPresets, compositionWorkflowSteps } from "@/lib/composition-prompts"
import type { Vibe } from "@/lib/chain-data"
import { vibes } from "@/lib/chain-data"
import { ListOrdered, Music2 } from "lucide-react"

export function CompositionPromptsPanel({ vibe }: { vibe: Vibe }) {
  const preset = compositionPresets[vibe]
  const vibeMeta = vibes.find((v) => v.id === vibe)

  return (
    <Card className="border-2 border-indigo-500/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Music2 className="h-5 w-5 text-indigo-600" />
          Composition Prompts — Chords, Melody, Riffs
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Plain-language starting points for ChordPrism/Fluid Chords, Fluid Pitch, and Riffer, matched to{" "}
          <span className="font-medium">{vibeMeta?.label ?? vibe}</span>. Nudge these by ear — they're a starting
          point, not a rule.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <PresetRow label="ChordPrism / Fluid Chords" value={preset.chordTool} />
          <PresetRow label="Fluid Pitch" value={preset.fluidPitch} />
          <PresetRow label="Riffer" value={preset.riffer} />
          <PresetRow label="Rando (your sample library)" value={preset.rando} />
        </div>

        <div className="rounded-lg border p-3 space-y-2">
          <div className="flex items-center gap-2 font-medium text-sm">
            <ListOrdered className="h-4 w-4 text-indigo-600" />
            The simple order to do this in
          </div>
          <ol className="space-y-1.5 text-sm text-muted-foreground list-decimal list-inside">
            {compositionWorkflowSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}

function PresetRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3 space-y-1">
      <Badge variant="secondary">{label}</Badge>
      <p className="text-sm text-muted-foreground">{value}</p>
    </div>
  )
}
