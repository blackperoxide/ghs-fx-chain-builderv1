import type { Vibe } from "./chain-data"

export interface CompositionPreset {
  chordTool: string // ChordPrism or Fluid Chords setting suggestion
  fluidPitch: string // scale-lock suggestion
  riffer: string // riff/density suggestion
  rando: string // sample-library usage suggestion
}

// Plain-language settings suggestions per vibe for the MIDI/composition tools.
// These are starting points, not rules — nudge them until it feels right by ear.
export const compositionPresets: Record<Vibe, CompositionPreset> = {
  "clean-glitch": {
    chordTool: "Pick a bright, modern pop/trap preset. Simple 2-4 chord loop, major or minor — nothing exotic.",
    fluidPitch: "Lock to a major or natural minor scale. Keep bends short and snappy, not long and slow.",
    riffer: "Higher density, straight timing (little to no swing). Short, punchy note lengths.",
    rando: "Load your brightest, cleanest one-shots. Let auto-tune-to-key handle pitch so everything lines up instantly.",
  },
  "heavy-glitch": {
    chordTool: "Pick an aggressive/dark preset — minor, dissonant extensions okay. Keep the progression simple so it reads clearly under distortion.",
    fluidPitch: "Lock to a minor or phrygian-leaning scale for tension. Use bigger, more dramatic bends.",
    riffer: "High density, tight/aggressive timing. Let it get a little chaotic — this vibe wants intensity.",
    rando: "Load your grittiest/harshest samples (distorted guitars, crushed vocals, industrial hits). Randomize hard for inspiration, then commit to what hits.",
  },
  "psych-trip-hop": {
    chordTool: "Pick a moody/downtempo preset with 7th and 9th chord extensions for that hazy color.",
    fluidPitch: "Lock to a minor or dorian scale. Use slow, wide, drifting bends — this is where the 'warped' feeling comes from.",
    riffer: "Lower density, add swing/humanize. Longer, sustained note lengths.",
    rando: "Load dusty/tape-y one-shots (vinyl textures, mellotron, old samples). Randomize slowly and let happy accidents guide you.",
  },
  "neo-soul-triphop": {
    chordTool: "Pick a neo-soul/R&B preset — extended chords (7ths, 9ths, 11ths), smooth voice-leading between chords.",
    fluidPitch: "Lock to dorian or mixolydian for that soulful major-but-not-quite color. Gentle, expressive bends, not dramatic ones.",
    riffer: "Medium-low density, heavy swing/humanize — this is where the 'pocket' groove feel comes from. Avoid anything that feels robotic.",
    rando: "Load warm samples (Rhodes hits, soulful vocal chops, live bass). Auto-tune to key so everything sits in the same harmony.",
  },
  "live-organic": {
    chordTool: "Pick a simple acoustic/singer-songwriter preset. Basic triads, minimal extensions.",
    fluidPitch: "Lock to whatever scale the song's actually in. Keep bends minimal or off — this vibe wants honesty, not effects.",
    riffer: "Low density, natural human timing (max humanize). Longer note lengths, natural pauses.",
    rando: "Load your live-recorded one-shots (room-mic'd guitar, natural vocal ad-libs). Keep processing minimal — this is the rawest vibe.",
  },
}

export const compositionWorkflowSteps = [
  "Pick your key and vibe (same vibe you picked in the FX Chain Builder above).",
  "Open ChordPrism or Fluid Chords. Pick a preset close to the suggestion below, and generate a chord loop you like.",
  "Open Fluid Pitch on your melody/lead track. Lock it to the scale suggested below so you can't play a 'wrong' note.",
  "Open Riffer. Set the density and humanize amount below, and generate a few riff options over your chords until one clicks.",
  "Load your own samples into Rando. Turn on auto-tune-to-key so everything matches your chord progression automatically.",
  "Trigger Rando from your Launchpad or MPD218 pads — that's your playable instrument, built from your own sound library.",
]
