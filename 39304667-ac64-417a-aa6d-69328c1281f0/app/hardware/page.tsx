import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Sliders } from "lucide-react"

const devices = [
  {
    name: "Launchpad / MPD218",
    role: "Your playable instrument",
    steps: [
      "Load your own samples into Rando (the sample-library plugin).",
      "Turn on Rando's auto-tune-to-key so every sample matches your song's key.",
      "In Rando's Keyboard Designer, lay your samples out to match your pad grid (MPD218 is 4x4, Launchpad is usually 8x8).",
      "Set your Launchpad/MPD218 as the MIDI input for the track Rando is on.",
      "Press pads — that's your own sample library, playable in real time, always in key.",
    ],
  },
  {
    name: "Console 1 (MK1)",
    role: "Hands-on control of your plugins",
    steps: [
      "Load your FX chain plugins onto the channel (from Active Cue on the main page).",
      "Open the Console 1 software and turn on its plugin-mapping mode (sometimes called 'Map').",
      "Click a hardware knob, then click the matching parameter on the plugin's own screen (e.g. Drive, Threshold, Mix).",
      "Do this once per chain — pick the 4-6 knobs you'll actually want to touch live (drive, compression, EQ tilt, delay/reverb mix are good picks).",
      "Save the mapping with the channel — Console 1 will remember it next time you load that chain.",
    ],
  },
]

export default function HardwarePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6 space-y-2">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to FX Chain Builder
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sliders className="h-7 w-7 text-teal-600" /> Your Hardware, In Plain Terms
        </h1>
        <p className="text-muted-foreground">
          Where your actual gear plugs into everything else here. No jargon — just what to press and in what order.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-16 space-y-6">
        {devices.map((d) => (
          <Card key={d.name} className="border-2 border-teal-500/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{d.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{d.role}</p>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm list-decimal list-inside">
                {d.steps.map((step, i) => (
                  <li key={i} className="leading-relaxed">{step}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
