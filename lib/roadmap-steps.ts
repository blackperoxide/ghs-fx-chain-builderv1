export interface RoadmapStep {
  id: string
  title: string
  plain: string // one simple sentence, no jargon
  where: string // where in the app / which hardware
  href?: string
}

export const roadmapSteps: RoadmapStep[] = [
  {
    id: "vibe",
    title: "1. Pick your vibe",
    plain: "Decide roughly what this song should feel like. Type it into the prompt box, or click a vibe tab.",
    where: "FX Chain Builder — top of the page",
  },
  {
    id: "composition",
    title: "2. Build the chords and melody",
    plain: "Use ChordPrism/Fluid Chords to get a chord loop, Fluid Pitch to keep melodies in-key, Riffer for riff ideas.",
    where: "Composition Prompts panel — settings suggestions per vibe",
  },
  {
    id: "sample-instrument",
    title: "3. Turn your samples into a playable instrument",
    plain: "Load your own sample library into Rando. Turn on auto-tune-to-key. Trigger it live from your Launchpad or MPD218.",
    where: "Rando (your plugin) + your Launchpad/MPD218 pads",
  },
  {
    id: "instrument-tone",
    title: "4. Get raw tone for anything not sample-based",
    plain: "For synth keys/bass/guitar that aren't coming from your sample library, use these prompts in Siren, and drums in DrumGPT.",
    where: "Instrument Prompts panel",
  },
  {
    id: "fx-chain",
    title: "5. Build the FX chain, one step at a time",
    plain: "Follow Active Cue top to bottom. Check off each stage as you build it in Logic. Use Console 1 to touch-control the plugins as you go.",
    where: "Active Cue + Console 1 hardware",
  },
  {
    id: "save-preset",
    title: "6. Save it so you never rebuild it again",
    plain: "Once Active Cue says 'all stages built,' save it as a Channel Strip Setting in Logic using the name shown.",
    where: "Logic's Channel Strip Settings menu",
  },
  {
    id: "analyze",
    title: "7. Check the mix and master",
    plain: "Upload your bounce to the Audio Production Analyzer. Fix anything flagged red or amber.",
    where: "Audio Production Analyzer",
  },
  {
    id: "ab-compare",
    title: "8. Compare against a Drake/Frank Ocean reference",
    plain: "Upload a reference track you like the sound of (doesn't need to sound like your song). See the exact gap and which plugin closes it.",
    where: "A/B Reference Compare",
  },
  {
    id: "done",
    title: "9. Done — call it finished",
    plain: "If steps 7-8 look good, the song is done. Don't keep chasing tiny differences forever — ship it.",
    where: "—",
  },
]
