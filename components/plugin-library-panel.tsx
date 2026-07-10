"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FolderOpen, Trash, CheckCircle, Info } from "lucide-react"
import { parsePluginList, buildLibraryIndex, categoryLabels, type LibraryIndex } from "@/lib/plugin-library"

const STORAGE_KEY = "ghs-plugin-library-v1"

export function PluginLibraryPanel({ onLibraryChange }: { onLibraryChange: (index: LibraryIndex | null) => void }) {
  const [raw, setRaw] = useState("")
  const [savedCount, setSavedCount] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null
    if (stored) {
      const names = parsePluginList(stored)
      setRaw(stored)
      setSavedCount(names.length)
      onLibraryChange(buildLibraryIndex(names))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function save() {
    const names = parsePluginList(raw)
    window.localStorage.setItem(STORAGE_KEY, raw)
    setSavedCount(names.length)
    onLibraryChange(buildLibraryIndex(names))
  }

  function clear() {
    window.localStorage.removeItem(STORAGE_KEY)
    setRaw("")
    setSavedCount(null)
    onLibraryChange(null)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || "")
      setRaw((prev) => (prev ? prev + "\n" + text : text))
    }
    reader.readAsText(file)
  }

  return (
    <Card className="border-2 border-emerald-500/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FolderOpen className="h-5 w-5 text-emerald-600" />
          My Plugin Library
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Paste your real installed plugin names (one per line), or upload a .txt list exported by the scanner
          script below. Once loaded, every chain below only recommends plugins you actually own — no more
          guessing from memory.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={"Soundtoys Decapitator\nKilohearts Stutter\nUAD Fairchild 670\nWaves CLA-76\n..."}
          rows={5}
        />
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.csv"
            className="hidden"
            onChange={handleFile}
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
            <Upload className="h-4 w-4" /> Upload .txt list
          </Button>
          <Button onClick={save} className="gap-2">
            <CheckCircle className="h-4 w-4" /> Save Library
          </Button>
          {savedCount !== null && (
            <Button variant="ghost" onClick={clear} className="gap-2 text-muted-foreground">
              <Trash className="h-4 w-4" /> Clear
            </Button>
          )}
        </div>

        {savedCount !== null && (
          <Alert className="border-emerald-500/50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Loaded <span className="font-semibold">{savedCount}</span> plugins from your library. Chains below
              will prioritize matches from this list.
            </AlertDescription>
          </Alert>
        )}

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            I can't reach your computer's actual VST/AU/AAX folders from this app — no cloud tool can browse your
            local disk. Run the scanner script (link below the chain sections) on your own machine once, then
            paste or upload its output here. Everything stays local until you paste it in.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
