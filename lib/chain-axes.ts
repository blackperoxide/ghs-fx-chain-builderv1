import type { Vibe } from "./chain-data"

// Continuous "mixing engineer" axes describing a chain's character - replaces
// picking one best-matching vibe with a real point in a multi-dimensional
// space, so "aggressive but hazy" becomes representable as high Drive + high
// Space, a combination none of the 5 original hand-written vibes covered on
// their own. Each of the 5 original vibes is really just one point in this
// space (kept below as canonical presets so the existing Quick Load cards
// still produce exactly what they always have).
export type Axis = "drive" | "brightness" | "space" | "movement" | "punch" | "width" | "lofi"

export type AxisScores = Record<Axis, number> // each 0-10

export const AXES: { id: Axis; label: string; lowLabel: string; highLabel: string; description: string }[] = [
  {
    id: "drive",
    label: "Drive",
    lowLabel: "Clean",
    highLabel: "Driven",
    description: "Saturation/distortion intensity and compression hardness - how hard everything is being pushed.",
  },
  {
    id: "brightness",
    label: "Brightness",
    lowLabel: "Dark",
    highLabel: "Bright",
    description: "Overall EQ tilt - warm/rolled-off low end vs. present, cutting top end.",
  },
  {
    id: "space",
    label: "Space",
    lowLabel: "Dry",
    highLabel: "Wet",
    description: "Reverb/delay wetness - how much room and tail is built into the chain.",
  },
  {
    id: "movement",
    label: "Movement",
    lowLabel: "Static",
    highLabel: "Modulated",
    description: "Chorus/phaser/tremolo/filter-sweep depth - how much the sound moves over time.",
  },
  {
    id: "punch",
    label: "Punch",
    lowLabel: "Squashed",
    highLabel: "Punchy",
    description: "Transient/dynamic retention - punchy and dynamic vs. dense and compressed flat.",
  },
  {
    id: "width",
    label: "Width",
    lowLabel: "Narrow",
    highLabel: "Wide",
    description: "Stereo image - mono/centered vs. wide stereo spread.",
  },
  {
    id: "lofi",
    label: "Lo-Fi",
    lowLabel: "Hi-Fi",
    highLabel: "Lo-Fi",
    description: "Textural degradation - pristine/full-bandwidth vs. bitcrushed/tape-noise/vinyl character.",
  },
]

// Best-effort calibration points, not measured - each vibe's canonical spot in
// axis-space, read off its existing written character. These anchor the space;
// they don't need to be exact for the system to generalize usefully between them.
export const vibeAxisPoints: Record<Vibe, AxisScores> = {
  "clean-glitch": { drive: 3, brightness: 7, space: 3, movement: 2, punch: 8, width: 5, lofi: 2 },
  "heavy-glitch": { drive: 9, brightness: 6, space: 4, movement: 3, punch: 3, width: 5, lofi: 6 },
  "psych-trip-hop": { drive: 3, brightness: 3, space: 8, movement: 8, punch: 4, width: 7, lofi: 5 },
  "neo-soul-triphop": { drive: 3, brightness: 4, space: 5, movement: 6, punch: 5, width: 5, lofi: 3 },
  "live-organic": { drive: 1, brightness: 5, space: 2, movement: 1, punch: 6, width: 4, lofi: 1 },
}

export function clampAxis(value: number): number {
  return Math.min(10, Math.max(0, value))
}

/** Euclidean distance between two axis points, restricted to a subset of axes if given. */
export function axisDistance(a: AxisScores, b: Partial<AxisScores>, axesToCompare?: Axis[]): number {
  const keys = axesToCompare ?? (Object.keys(b) as Axis[])
  let sumSq = 0
  for (const k of keys) {
    const diff = a[k] - (b[k] ?? a[k])
    sumSq += diff * diff
  }
  return Math.sqrt(sumSq)
}

/** Which of the 5 original vibes is closest to a given axis point - used for the "Quick Load" fallback label and for VibePicker presets. */
export function nearestVibe(axes: AxisScores): Vibe {
  let best: Vibe = "psych-trip-hop"
  let bestDist = Infinity
  for (const vibe of Object.keys(vibeAxisPoints) as Vibe[]) {
    const dist = axisDistance(axes, vibeAxisPoints[vibe])
    if (dist < bestDist) {
      bestDist = dist
      best = vibe
    }
  }
  return best
}
