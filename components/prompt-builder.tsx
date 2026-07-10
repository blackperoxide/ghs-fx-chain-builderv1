"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Loader2 } from "lucide-react"
import { vibes } from "@/lib/chain-data"
import { matchPromptToChain, type MatchResult } from "@/lib/prompt-match"

const examples = [
  "warped, hazy, dreamlike drums with tape wobble",
  "aggressive crushed drum bus, angry and distorted",
  "OVO Toledo vocals, tape warbled and desynced",
  "tight punchy clean drums for a radio single",
]

export function PromptBuilder({ onMatch }: { onMatch: (result: MatchResult, prompt: string) => void }) {
  const [text, setText] = useState("")
  const [lastResult, setLastResult] = useState<MatchResult | null>(null)
  const [thinking, setThinking] = useState(false)

  function runMatch(promptText: string) {
    const value = promptText.trim()
    if (!value) return
    setThinking(true)
    // Small delay purely for perceived feedback — matching itself is instant and fully local.
    setTimeout(() => {
      const result = matchPromptToChain(value)
      setLastResult(result)
      onMatch(result, value)
      setThinking(false)
    }, 250)
  }

  const matchedVibeLabel = lastResult ? vibes.find((v) => v.id === lastResult.vibe)?.label : null

  return (
    <Card className="border-2 border-primary/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-primary" />
          Describe the sound you want
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Type it like you'd say it out loud. This maps straight to your own UAD, Plugin Alliance, Waves, and
          FabFilter chain below — no third-party plugin required. Mention "vocal" or a vocal reference to switch
          to the vocal chain automatically.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. OVO Toledo vocals, tape warbled and desynced..."
          rows={3}
        />
        <div className="flex flex-wrap gap-2">
          {examples.map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setText(ex)
                runMatch(ex)
              }}
              className="text-xs rounded-full border px-3 py-1 text-muted-foreground hover:bg-accent transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
        <Button onClick={() => runMatch(text)} disabled={!text.trim() || thinking} className="w-full sm:w-auto">
          {thinking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
          Build my chain
        </Button>

        {lastResult && (
          <div className="rounded-lg border bg-muted/40 p-3 space-y-2 text-sm">
            <p>
              Detected <span className="font-semibold">{lastResult.trackType === "vocals" ? "Vocal chain" : "Drum bus chain"}</span>
              {lastResult.trackType === "drums" && (
                <>
                  {" "}
                  — matched to <span className="font-semibold">{matchedVibeLabel}</span>
                </>
              )}
              {lastResult.matchedVibeKeywords.length > 0 && lastResult.trackType === "drums" && (
                <>
                  {" "}
                  because of:{" "}
                  {lastResult.matchedVibeKeywords.map((kw) => (
                    <Badge key={kw} variant="secondary" className="mr-1">
                      {kw}
                    </Badge>
                  ))}
                </>
              )}
            </p>
            {lastResult.matchedStageKeywords.length > 0 && (
              <p className="text-muted-foreground">
                Highlighting stages tied to:{" "}
                {lastResult.matchedStageKeywords.map((kw) => (
                  <Badge key={kw} variant="outline" className="mr-1">
                    {kw}
                  </Badge>
                ))}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
