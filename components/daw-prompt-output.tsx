"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Music, Activity, Zap, Info } from "lucide-react"
import type { InstrumentRole } from "@/lib/daw-prompts"
import { instrumentRoleMeta, buildDawPrompts } from "@/lib/daw-prompts"
import type { Vibe } from "@/lib/chain-data"
import type { TrackType } from "@/lib/prompt-match"

const roleIcons: Record<InstrumentRole, React.ReactNode> = {
  drums: <Activity className="h-4 w-4 text-fuchsia-600" />,
  keys: <Music className="h-4 w-4 text-fuchsia-600" />,
  bass: <Zap className="h-4 w-4 text-fuchsia-600" />,
  "guitar-electric": <Music className="h-4 w-4 text-fuchsia-600" />,
  "guitar-acoustic": <Music className="h-4 w-4 text-fuchsia-600" />,
}

function CopyBlock({ label, icon, text, pluginName }: { label: string; icon: React.ReactNode; text: string; pluginName: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore — text still visible/selectable below
    }
  }

  return (
    <div className="rounded-lg border p-3 space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{label}</span>
          <Badge variant="secondary">{pluginName}</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={copy} className="gap-1.5">
          <Copy className="h-3.5 w-3.5" /> {copied ? "Copied!" : "Copy prompt"}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground bg-muted/40 rounded-md p-2">{text}</p>
    </div>
  )
}

interface DawPromptOutputProps {
  vibe: Vibe
  trackType: TrackType
  rawPrompt: string
}

const defaultRoles: InstrumentRole[] = ["drums", "keys", "bass", "guitar-electric", "guitar-acoustic"]

export function DawPromptOutput({ vibe, trackType, rawPrompt }: DawPromptOutputProps) {
  const [selectedRoles, setSelectedRoles] = useState<InstrumentRole[]>(defaultRoles)

  function toggleRole(role: InstrumentRole) {
    setSelectedRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]))
  }

  const prompts = buildDawPrompts(vibe, trackType, rawPrompt, selectedRoles)

  return (
    <Card className="border-2 border-fuchsia-500/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Instrument Prompts — Siren & DrumGPT</CardTitle>
        <p className="text-sm text-muted-foreground">
          Paste these straight into the Siren and DrumGPT plugin windows in Logic for the raw source instrument.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <span className="font-medium">Division of labor:</span> these prompts deliberately ask for a raw,
            humanistic, unprocessed performance — real touch dynamics, natural timing feel, honest tone. No
            saturation, distortion, filtering, or glitch baked in. All of that character comes from the FX chain
            below, built from your actual gear — so the two systems build on each other instead of duplicating
            work.
          </AlertDescription>
        </Alert>

        <div className="flex flex-wrap gap-3">
          {instrumentRoleMeta.map((m) => (
            <label key={m.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={selectedRoles.includes(m.id)} onCheckedChange={() => toggleRole(m.id)} />
              <Label className="cursor-pointer">{m.label}</Label>
            </label>
          ))}
        </div>

        <div className="space-y-3">
          {prompts.map((p) => (
            <CopyBlock key={p.role} label={p.label} icon={roleIcons[p.role]} text={p.prompt} pluginName={p.pluginName} />
          ))}
          {prompts.length === 0 && (
            <p className="text-sm text-muted-foreground italic">Select at least one instrument above to generate prompts.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
