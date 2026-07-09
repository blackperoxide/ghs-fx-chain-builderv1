"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, Zap, Mic, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { ovoToledoVocalChain, vocalGap } from "@/lib/vocal-chain-data"
import { stageCategoryMap } from "@/lib/stage-category-map"
import { getBrandColor } from "@/lib/brand-colors"
import type { LibraryIndex } from "@/lib/plugin-library"

export function VocalChainViewer({
  highlightedStages = [],
  libraryIndex,
}: {
  highlightedStages?: string[]
  libraryIndex?: LibraryIndex | null
}) {
  return (
    <div className="space-y-4">
      <Alert className="border-primary/40">
        <Mic className="h-4 w-4" />
        <AlertTitle>OVO / Toledo Reference Chain</AlertTitle>
        <AlertDescription className="text-sm">
          Moody, pitched-down October's Very Own weight, crossed with Toledo's deliberately desynced, tape-warbled
          double-tracked vocal. Built entirely from your UAD, Plugin Alliance, Waves, and FabFilter Timeless 2 gear.
        </AlertDescription>
      </Alert>

      {ovoToledoVocalChain.map((stage) => {
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
                <div key={opt.plugin} className="rounded-lg border p-3 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${getBrandColor(opt.brand)} text-white hover:${getBrandColor(opt.brand)}`}>
                      {opt.brand}
                    </Badge>
                    <span className="font-medium">{opt.plugin}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{opt.tip}</p>
                </div>
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

      <Alert className="border-amber-500/50">
        <Zap className="h-4 w-4" />
        <AlertTitle>{vocalGap.title}</AlertTitle>
        <AlertDescription className="text-sm">{vocalGap.body}</AlertDescription>
      </Alert>
    </div>
  )
}
