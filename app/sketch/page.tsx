"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, Zap, Copy, EyeOff, Eye, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { parsePluginList, buildLibraryIndex, type LibraryIndex } from "@/lib/plugin-library"
import { sketchTemplate } from "@/lib/sketch-template"

const STORAGE_KEY = "ghs-plugin-library-v1"

export default function SketchPage() {
  const [description, setDescription] = useState("")
  const [libraryIndex, setLibraryIndex] = useState<LibraryIndex | null>(null)
  const [hasLibrary, setHasLibrary] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [skipped, setSkipped] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const names = parsePluginList(stored)
      setLibraryIndex(buildLibraryIndex(names))
      setHasLibrary(names.length > 0)
    }
  }, [])

  function generate() {
    setGenerated(true)
    // Default: skip the optional stages unless the description hints at them
    const text = description.toLowerCase()
    setSkipped({
      modulation: !/(mod|chorus|phaser|tremolo|swirl|shimmer|movement|width)/.test(text),
      glitch: !/(glitch|stutter|bitcrush|chop|texture|broken)/.test(text),
      delay: !/(delay|echo|throw|repeat)/.test(text),
    })
  }

  function toggleSkip(id: string) {
    setSkipped((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const activeStages = useMemo(() => sketchTemplate.filter((s) => !skipped[s.id]), [skipped])

  const sketchText = useMemo(() => {
    const lines = [
      `Custom Sketch — "${description || "untitled"}"`,
      "",
      ...activeStages.map((s, i) => {
        const matches = libraryIndex?.[s.category] ?? []
        const pluginLine = matches.length > 0 ? matches.join(", ") : "(no matching plugin in your library — pick manually)"
        return `${i + 1}. ${s.label}\n   ${s.roleHint}\n   From your library: ${pluginLine}`
      }),
    ]
    return lines.join("\n\n")
  }, [description, activeStages, libraryIndex])

  async function copySketch() {
    try {
      await navigator.clipboard.writeText(sketchText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore — text still visible/selectable
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-6 space-y-2">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to FX Chain Builder
        </Link>
        <h1 className="text-3xl font-bold">Custom Chain Sketch</h1>
        <p className="text-muted-foreground">
          A separate sandbox for on-the-fly ideas — pulls straight from your uploaded plugin library, no curated
          genre knowledge behind it. Doesn't touch your active build or Active Cue progress on the main page.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16 space-y-6">
        {!hasLibrary && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No plugin library loaded yet</AlertTitle>
            <AlertDescription>
              Go to the main <Link href="/" className="underline">FX Chain Builder</Link> page, paste or upload
              your plugin list under "My Plugin Library," then come back here — sketches will pull real matches
              instead of showing blanks.
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-2 border-violet-500/40">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-violet-600" />
              Describe it
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Any sound, any texture, any half-formed idea. This builds a generic 8-stage skeleton and slots in
              plugins from your library wherever they fit — quick sketching, not a tuned chain.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. gritty bitcrushed percussion with a wide chorus and short slap delay..."
              rows={3}
            />
            <Button onClick={generate} className="gap-2">
              <Zap className="h-4 w-4" /> Generate Sketch
            </Button>
          </CardContent>
        </Card>

        {generated && (
          <div className="space-y-4">
            {sketchTemplate.map((s) => {
              const isSkipped = !!skipped[s.id]
              const matches = libraryIndex?.[s.category] ?? []
              return (
                <Card key={s.id} className={cn("transition-opacity", isSkipped && "opacity-50")}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span>{s.order}. {s.label}</span>
                      <Button size="sm" variant="ghost" onClick={() => toggleSkip(s.id)} className="gap-1.5 text-muted-foreground">
                        {isSkipped ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        {isSkipped ? "Include" : "Skip"}
                      </Button>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{s.roleHint}</p>
                  </CardHeader>
                  {!isSkipped && (
                    <CardContent>
                      {matches.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {matches.map((p) => (
                            <Badge key={p} className="bg-emerald-600 text-white hover:bg-emerald-600">
                              {p}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          No matching plugin found in your library for this stage — pick one manually or load more
                          plugins into your library on the main page.
                        </p>
                      )}
                    </CardContent>
                  )}
                </Card>
              )
            })}

            <Button onClick={copySketch} variant="outline" className="gap-2">
              <Copy className="h-4 w-4" /> {copied ? "Copied!" : "Copy sketch as text"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
