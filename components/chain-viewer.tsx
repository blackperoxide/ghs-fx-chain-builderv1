"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PluginOptionCard } from "@/components/plugin-option-card"
import { Info, Zap, FolderOpen, Download, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { vibes, glitchGap, type ChainStage, type Vibe } from "@/lib/chain-data"
import { stageCategoryMap } from "@/lib/stage-category-map"
import { buildRecipe, downloadRecipe } from "@/lib/recipe-export"
import type { LibraryIndex } from "@/lib/plugin-library"

interface ChainViewerProps {
  vibe: Vibe
  chainData: Record<Vibe, ChainStage[]>
  instrumentLabel: string
  highlightedStages?: string[]
  libraryIndex?: LibraryIndex | null
  /**
   * Overrides the plain chainData[vibe] lookup - passed when a free-text
   * prompt was axis-matched (lib/chain-axes.ts, lib/drum-chain-variants.ts)
   * instead of snapping to one of the 5 hand-written vibes. Currently only
   * wired up for Drums; Bass/Keys still always use chainData[vibe].
   */
  stages?: ChainStage[]
}

// Renders one instrument's chain for the currently-selected vibe. Vibe
// selection itself now lives in VibePicker, shared at the top of the page
// across Drums/Bass/Keys - this component just reacts to it.
export function ChainViewer({ vibe, chainData, instrumentLabel, highlightedStages = [], libraryIndex, stages: axisStages }: ChainViewerProps) {
  const vibeMeta = vibes.find((v) => v.id === vibe)
  const isAxisGenerated = axisStages != null
  const stages = axisStages ?? chainData[vibe]

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {isAxisGenerated && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-brand" />
            Built from your description — closest preset: {vibeMeta?.label ?? vibe}
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => downloadRecipe(buildRecipe(`${vibeMeta?.label ?? vibe} ${instrumentLabel}`, stages))}
        >
          <Download className="h-4 w-4" />
          Download for GHS FX Companion
        </Button>

        {stages.map((stage) => {
          const isHighlighted = highlightedStages.includes(stage.id)
          const category = stageCategoryMap[stage.id]
          const libraryMatches = libraryIndex && category ? libraryIndex[category] : []
          return (
            <Card
              key={stage.id}
              className={cn(
                "border-l-4 border-l-primary transition-shadow",
                isHighlighted && "ring-2 ring-amber-400 shadow-lg"
              )}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{stage.name}</span>
                  {isHighlighted && (
                    <Badge className="bg-amber-500 text-white hover:bg-amber-500 flex items-center gap-1">
                      <Zap className="h-3 w-3" /> matched
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{stage.role}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {libraryMatches && libraryMatches.length > 0 && (
                  <div className="rounded-lg border-2 border-emerald-500/50 bg-emerald-500/5 p-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-700">From your library</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {libraryMatches.map((p) => (
                        <Badge key={p} className="bg-emerald-600 text-white hover:bg-emerald-600">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {stage.options.map((opt) => (
                  <PluginOptionCard key={opt.plugin} option={opt} category={category} />
                ))}
                {stage.note && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-sm">{stage.note}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Alert className="border-emerald-500/50">
        <Zap className="h-4 w-4" />
        <AlertTitle>{glitchGap.title}</AlertTitle>
        <AlertDescription className="text-sm">{glitchGap.body}</AlertDescription>
      </Alert>
    </div>
  )
}
