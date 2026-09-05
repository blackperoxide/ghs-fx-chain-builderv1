"use client"

import { vibes, type Vibe } from "@/lib/chain-data"
import { cn } from "@/lib/utils"

interface VibePickerProps {
  vibe: Vibe
  onVibeChange: (v: Vibe) => void
}

// Shared across Drums/Bass/Keys - picking a vibe here drives the checklist,
// the chain viewer, and the recipe download for whichever instrument is
// selected. Vocals doesn't use this (its chain isn't vibe-based).
export function VibePicker({ vibe, onVibeChange }: VibePickerProps) {
  return (
    <div className="flex w-full gap-3 overflow-x-auto pb-2">
      {vibes.map((v, i) => (
        <button
          key={v.id}
          type="button"
          onClick={() => onVibeChange(v.id)}
          className={cn(
            "flex h-auto w-64 flex-shrink-0 flex-col items-start gap-1.5 whitespace-normal rounded-xl border border-border bg-card/60 p-4 text-left transition-colors",
            v.id === vibe ? "border-brand bg-brand/10" : "hover:bg-accent"
          )}
        >
          <span className="text-xs font-semibold tracking-wide text-brand">
            Quick Load {String(i + 1).padStart(2, "0")}
          </span>
          <span className="font-semibold">{v.label}</span>
          <span className="text-xs font-normal text-muted-foreground">{v.description}</span>
        </button>
      ))}
    </div>
  )
}
