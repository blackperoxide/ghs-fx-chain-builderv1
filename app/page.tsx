"use client"
import { useState, useMemo } from "react"
import Link from "next/link"
import { ChainViewer } from "@/components/chain-viewer"
import { VocalChainViewer } from "@/components/vocal-chain-viewer"
import { PromptBuilder } from "@/components/prompt-builder"
import { PluginLibraryPanel } from "@/components/plugin-library-panel"
import { BuildChecklist, type ChecklistStage } from "@/components/build-checklist"
import { FocusCue } from "@/components/focus-cue"
import { AudioAnalyzer } from "@/components/audio-analyzer"
import { AudioAbCompare } from "@/components/audio-ab-compare"
import { DawPromptOutput } from "@/components/daw-prompt-output"
import { CompositionPromptsPanel } from "@/components/composition-prompts-panel"
import { Button } from "@/components/ui/button"
import {
  Music, Mic, Download, ChevronDown, ChevronUp, Zap, Map, Sliders, Activity, Layers,
  Guitar, Piano, Shuffle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { vibes, drumBusChain, glitchGap, type Vibe, type ChainStage } from "@/lib/chain-data"
import { bassChain, bassGap } from "@/lib/bass-chain-data"
import { keysChain, keysGap } from "@/lib/keys-chain-data"
import { ovoToledoVocalChain, vocalGap } from "@/lib/vocal-chain-data"
import type { MatchResult, TrackType } from "@/lib/prompt-match"
import type { LibraryIndex } from "@/lib/plugin-library"

export default function Home() {
  const [trackType, setTrackType] = useState<TrackType>("drums")
  const [vibe, setVibe] = useState<Vibe>("psych-trip-hop")
  const [highlightedStages, setHighlightedStages] = useState<string[]>([])
  const [libraryIndex, setLibraryIndex] = useState<LibraryIndex | null>(null)
  const [showFullDetails, setShowFullDetails] = useState(false)
  const [showAnalyzer, setShowAnalyzer] = useState(false)
  const [showAbCompare, setShowAbCompare] = useState(false)
  const [lastPromptText, setLastPromptText] = useState("")
  const [hasMatched, setHasMatched] = useState(false)

  function handleMatch(result: MatchResult, promptText: string) {
    setTrackType(result.trackType)
    setVibe(result.vibe)
    setHighlightedStages(result.highlightedStages)
    setLastPromptText(promptText)
    setHasMatched(true)
  }
  function handleVibeChange(v: Vibe) {
    setVibe(v)
    setHighlightedStages([])
  }
  function handleTrackTypeChange(t: TrackType) {
    setTrackType(t)
    setHighlightedStages([])
  }
  function surpriseMe() {
    const instruments: TrackType[] = ["drums", "bass", "keys", "vocals"]
    const t = instruments[Math.floor(Math.random() * instruments.length)]
    const v = vibes[Math.floor(Math.random() * vibes.length)].id
    setTrackType(t)
    setVibe(v)
    setHighlightedStages([])
    setHasMatched(false)
    setShowFullDetails(true)
  }

  const { chainKey, chainLabel, suggestedPresetName, checklistStages, chainData, gapNote } = useMemo(() => {
    if (trackType === "vocals") {
      const stages: ChecklistStage[] = ovoToledoVocalChain.map((s) => ({
        id: s.id,
        name: s.name,
        pluginLine: s.options.length > 0
          ? s.options.map((o) => `${o.brand}: ${o.plugin}`).join("  |  ")
          : "Manual DAW step — no plugin insert",
        tip: s.options[0]?.tip ?? s.note ?? "",
      }))
      return {
        chainKey: "vocals:ovo-toledo",
        chainLabel: "OVO / Toledo Vocal Chain",
        suggestedPresetName: "GHS - OVO Toledo Vocal",
        checklistStages: stages,
        chainData: null as Record<Vibe, ChainStage[]> | null,
        gapNote: vocalGap,
      }
    }

    const vibeMeta = vibes.find((v) => v.id === vibe)
    const dataMap = trackType === "bass" ? bassChain : trackType === "keys" ? keysChain : drumBusChain
    const gap = trackType === "bass" ? bassGap : trackType === "keys" ? keysGap : glitchGap
    const instrumentLabel = trackType === "bass" ? "Bass" : trackType === "keys" ? "Keys" : "Drum Bus"

    const stages: ChecklistStage[] = dataMap[vibe].map((s) => ({
      id: s.id,
      name: s.name,
      pluginLine: s.options.map((o) => `${o.brand}: ${o.plugin}`).join("  |  "),
      tip: s.options[0]?.tip ?? "",
    }))
    return {
      chainKey: `${trackType}:${vibe}`,
      chainLabel: `${vibeMeta?.label ?? vibe} ${instrumentLabel}`,
      suggestedPresetName: `GHS - ${vibeMeta?.label ?? vibe} ${instrumentLabel}`,
      checklistStages: stages,
      chainData: dataMap,
      gapNote: gap,
    }
  }, [trackType, vibe])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-2">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">FX Chain Builder</h1>
            <p className="text-muted-foreground">
              Describe a sound, then follow the Active Cue below — one step at a time, spoken aloud, always
              resumable right where you left off.
            </p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Link
              href="/roadmap"
              className="flex items-center gap-2 text-sm border-2 border-indigo-500/50 rounded-lg px-3 py-2 hover:bg-accent transition-colors whitespace-nowrap font-medium"
            >
              <Map className="h-4 w-4 text-indigo-600" />
              Song Roadmap — start here if lost
            </Link>
            <div className="flex gap-2">
              <Link
                href="/sketch"
                className="flex items-center gap-2 text-sm border rounded-lg px-3 py-2 hover:bg-accent transition-colors whitespace-nowrap"
              >
                <Zap className="h-4 w-4 text-violet-600" />
                Custom Sketch
              </Link>
              <Link
                href="/hardware"
                className="flex items-center gap-2 text-sm border rounded-lg px-3 py-2 hover:bg-accent transition-colors whitespace-nowrap"
              >
                <Sliders className="h-4 w-4 text-teal-600" />
                Hardware Setup
              </Link>
              <Link
                href="/key-detector"
                className="flex items-center gap-2 text-sm border rounded-lg px-3 py-2 hover:bg-accent transition-colors whitespace-nowrap"
              >
                <Activity className="h-4 w-4 text-teal-600" />
                Live Key Detector
              </Link>
              <Link
                href="/reverse-engineer"
                className="flex items-center gap-2 text-sm border rounded-lg px-3 py-2 hover:bg-accent transition-colors whitespace-nowrap"
              >
                <Layers className="h-4 w-4 text-orange-600" />
                Stem Reverse-Engineer
              </Link>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2 flex-wrap items-center">
          <Button
            variant={trackType === "drums" ? "default" : "outline"}
            onClick={() => handleTrackTypeChange("drums")}
            className={cn("gap-2")}
          >
            <Music className="h-4 w-4" /> Drums
          </Button>
          <Button
            variant={trackType === "bass" ? "default" : "outline"}
            onClick={() => handleTrackTypeChange("bass")}
            className={cn("gap-2")}
          >
            <Guitar className="h-4 w-4" /> Bass
          </Button>
          <Button
            variant={trackType === "keys" ? "default" : "outline"}
            onClick={() => handleTrackTypeChange("keys")}
            className={cn("gap-2")}
          >
            <Piano className="h-4 w-4" /> Keys
          </Button>
          <Button
            variant={trackType === "vocals" ? "default" : "outline"}
            onClick={() => handleTrackTypeChange("vocals")}
            className={cn("gap-2")}
          >
            <Mic className="h-4 w-4" /> Vocals
          </Button>
          <Button
            variant="outline"
            onClick={surpriseMe}
            className="gap-2 border-fuchsia-500/50 text-fuchsia-600 hover:bg-fuchsia-500/10 ml-auto"
          >
            <Shuffle className="h-4 w-4" /> Random Ideas — surprise me
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-16 space-y-6">
        {/* Primary flow: describe -> match -> active cue. */}
        <PromptBuilder onMatch={handleMatch} />
        {hasMatched && <CompositionPromptsPanel vibe={vibe} />}
        {hasMatched && <DawPromptOutput vibe={vibe} trackType={trackType} rawPrompt={lastPromptText} />}
        <FocusCue
          chainKey={chainKey}
          chainLabel={chainLabel}
          suggestedPresetName={suggestedPresetName}
          stages={checklistStages}
        />

        {/* Secondary tools: opt-in, not shown by default. */}
        <Button
          variant="ghost"
          onClick={() => setShowAnalyzer((v) => !v)}
          className="gap-2 text-muted-foreground w-full justify-center"
        >
          {showAnalyzer ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {showAnalyzer ? "Hide mix analyzer" : "Analyze a mix (loudness, dynamics, muddiness)"}
        </Button>
        {showAnalyzer && <AudioAnalyzer />}

        <Button
          variant="ghost"
          onClick={() => setShowAbCompare((v) => !v)}
          className="gap-2 text-muted-foreground w-full justify-center"
        >
          {showAbCompare ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {showAbCompare ? "Hide A/B compare" : "Compare your track against a reference"}
        </Button>
        {showAbCompare && <AudioAbCompare />}

        <Button
          variant="ghost"
          onClick={() => setShowFullDetails((v) => !v)}
          className="gap-2 text-muted-foreground w-full justify-center"
        >
          {showFullDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {showFullDetails ? "Hide full chain details" : "Show full chain details (all steps, all plugin options)"}
        </Button>
        {showFullDetails && (
          <div className="space-y-6">
            <PluginLibraryPanel onLibraryChange={setLibraryIndex} />
            <a
              href="/plugin-scanner.zip"
              download
              className="flex items-center gap-2 text-sm text-primary hover:underline w-fit"
            >
              <Download className="h-4 w-4" />
              Download the local plugin scanner script (Mac + Windows)
            </a>
            <BuildChecklist
              chainKey={chainKey}
              chainLabel={chainLabel}
              suggestedPresetName={suggestedPresetName}
              stages={checklistStages}
            />
            {trackType === "vocals" ? (
              <VocalChainViewer highlightedStages={highlightedStages} libraryIndex={libraryIndex} />
            ) : (
              chainData && (
                <ChainViewer
                  vibe={vibe}
                  onVibeChange={handleVibeChange}
                  highlightedStages={highlightedStages}
                  libraryIndex={libraryIndex}
                  chainData={chainData}
                  gapNote={gapNote}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}
