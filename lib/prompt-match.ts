import type { Vibe } from "./chain-data"
import { type AxisScores, clampAxis } from "./chain-axes"

export type TrackType = "drums" | "vocals" | "bass" | "keys"

// Keyword weights per vibe — matched as whole-word/phrase hits against the user's free-text description.
export const vibeKeywords: Record<Vibe, string[]> = {
  "clean-glitch": [
    "clean", "tight", "punchy", "subtle", "radio", "pop", "polished", "crisp",
    "modern", "commercial", "controlled", "precise", "snappy", "bright", "focused",
  ],
  "heavy-glitch": [
    "distorted", "crushed", "dirty", "aggressive", "heavy", "harsh", "gritty",
    "loud", "chaotic", "metal", "deftones", "norma jean", "screamo", "industrial",
    "abrasive", "fuzzy", "smashed", "brutal", "intense", "angry", "hard",
  ],
  "psych-trip-hop": [
    "dreamy", "psychedelic", "trippy", "warped", "wobbly", "hazy", "spacey",
    "swirl", "trip-hop", "trip hop", "atmospheric", "ambient", "floaty",
    "wavy", "warm", "vintage", "nostalgic", "ethereal", "smooth", "chill",
    "downtempo", "moody", "cinematic", "dusty", "lofi", "lo-fi", "swaying",
  ],
  "neo-soul-triphop": [
    "neo-soul", "neo soul", "neosoul", "d'angelo", "dangelo", "erykah", "questlove",
    "rhodes", "soulful", "groove", "pocket", "in the pocket", "warm soul", "rnb",
    "r&b", "soul", "silky", "velvety", "laid back", "laid-back",
  ],
  "live-organic": [
    "live", "acoustic", "organic", "natural", "busking", "stage", "minimal",
    "raw", "unprocessed", "room", "performance", "solo", "unplugged", "simple",
  ],
}

// Stage-level keyword hints — used to highlight specific stages in whichever vibe chain gets selected.
export const stageKeywords: Record<string, string[]> = {
  transient: ["punch", "punchy", "snap", "attack", "transient"],
  saturation: ["saturation", "tape", "warm", "grit", "gritty", "dirty", "distortion", "distorted", "crunch", "fuzz", "warble", "wobble", "wobbly"],
  compression: ["compression", "compressed", "glue", "punchy", "squash", "pump", "pumping", "tight"],
  eq: ["eq", "tone", "bright", "dark", "warm", "top end", "low end", "bass heavy"],
  "glitch-fx": ["glitch", "stutter", "chopped", "chop", "reverse", "broken", "fragmented", "bitcrush", "kilohearts"],
  modulation: ["swirl", "phaser", "tremolo", "modulation", "wobble", "wobbly", "movement", "shimmer"],
  "delay-fx": ["delay", "echo", "throw", "throws", "repeats"],
  space: ["reverb", "space", "spacey", "wide", "hazy", "room", "atmosphere", "atmospheric"],
  // Vocal-chain-specific stage ids
  "double-desync": ["desync", "desynced", "de-sync", "off-time", "detuned", "double", "doubled", "double-tracked"],
  "tape-warble": ["warble", "warbly", "tape", "wow", "flutter", "wobble", "wobbly"],
  "pitch-character": ["ovo", "pitched down", "pitched-down", "moody", "drake"],
  "eq-vocal": ["dark", "warm", "muffled", "dusty"],
  "delay-vocal": ["delay", "echo", "throw", "throws"],
  "space-vocal": ["reverb", "space", "room", "hall"],
}

// Track-type detection — if enough of these appear, switch away from the drums default.
// Checked in order: vocals, then bass, then keys, so an overlapping word like "warm"
// never overrides an explicit "vocal"/"bass"/"keys" mention.
const vocalTrackKeywords = [
  "vocal", "vocals", "vox", "voice", "ovo", "toledo", "desync", "desynced",
  "double-tracked", "double tracked", "singer", "singing", "lyric", "lyrics",
]

// Substring-matched like everything else here, so bare short words that show up
// inside unrelated words ("sub" in "subtle", "ep" in "deep") are deliberately
// left out - only specific enough phrases make the cut.
const bassTrackKeywords = [
  "bass", "bassline", "bass line", "bass guitar", "di bass", "sub-bass", "subwoofer",
]

const keysTrackKeywords = [
  "keys", "keyboard", "rhodes", "piano", "electric piano", "organ", "wurlitzer", "wurly",
]

// Nudges toward each of the 7 mixing axes (lib/chain-axes.ts), keyed off the
// same kind of free-text words the vibe matcher above already looks for.
// Multiple hits compound (e.g. "aggressive, distorted, crushed" all push
// drive up together) - this is what lets a prompt land anywhere in the axis
// space instead of snapping to one of the 5 hand-written vibes.
const axisKeywordWeights: { pattern: string; deltas: Partial<AxisScores> }[] = [
  // Drive: clean <-> driven
  { pattern: "distorted", deltas: { drive: 4 } },
  { pattern: "crushed", deltas: { drive: 4, lofi: 3 } },
  { pattern: "aggressive", deltas: { drive: 3, punch: -1 } },
  { pattern: "heavy", deltas: { drive: 3 } },
  { pattern: "harsh", deltas: { drive: 2, brightness: 2 } },
  { pattern: "gritty", deltas: { drive: 3, lofi: 2 } },
  { pattern: "fuzzy", deltas: { drive: 3 } },
  { pattern: "dirty", deltas: { drive: 3, lofi: 2 } },
  { pattern: "smashed", deltas: { drive: 4, punch: -3 } },
  { pattern: "brutal", deltas: { drive: 4 } },
  { pattern: "intense", deltas: { drive: 2 } },
  { pattern: "clean", deltas: { drive: -3, lofi: -2 } },
  { pattern: "polished", deltas: { drive: -2, brightness: 1 } },
  { pattern: "raw", deltas: { drive: -2, space: -2, movement: -2 } },
  { pattern: "unprocessed", deltas: { drive: -3, space: -2, movement: -2, lofi: -2 } },

  // Brightness: dark <-> bright
  { pattern: "bright", deltas: { brightness: 3 } },
  { pattern: "crisp", deltas: { brightness: 3, punch: 1 } },
  { pattern: "dark", deltas: { brightness: -3 } },
  { pattern: "warm", deltas: { brightness: -2, drive: 1 } },
  { pattern: "dusty", deltas: { brightness: -2, lofi: 2 } },
  { pattern: "moody", deltas: { brightness: -2, space: 1 } },

  // Space: dry <-> wet
  { pattern: "hazy", deltas: { space: 3, brightness: -1 } },
  { pattern: "spacey", deltas: { space: 3, width: 2 } },
  { pattern: "atmospheric", deltas: { space: 3 } },
  { pattern: "ambient", deltas: { space: 3, movement: 1 } },
  { pattern: "cinematic", deltas: { space: 2, width: 2 } },
  { pattern: "wide", deltas: { width: 3, space: 1 } },
  { pattern: "tight", deltas: { space: -2, punch: 2 } },
  { pattern: "minimal", deltas: { space: -2, movement: -2, drive: -2 } },

  // Movement: static <-> modulated
  { pattern: "swirl", deltas: { movement: 4 } },
  { pattern: "phaser", deltas: { movement: 3 } },
  { pattern: "tremolo", deltas: { movement: 3 } },
  { pattern: "shimmer", deltas: { movement: 2, brightness: 1 } },
  { pattern: "wobbly", deltas: { movement: 4, lofi: 2 } },
  { pattern: "wobble", deltas: { movement: 4, lofi: 2 } },
  { pattern: "warped", deltas: { movement: 4, lofi: 2 } },
  { pattern: "wavy", deltas: { movement: 3 } },
  { pattern: "trippy", deltas: { movement: 3, space: 2 } },
  { pattern: "psychedelic", deltas: { movement: 4, space: 3 } },
  { pattern: "swaying", deltas: { movement: 2 } },

  // Punch: squashed <-> punchy
  { pattern: "punchy", deltas: { punch: 3 } },
  { pattern: "snappy", deltas: { punch: 3 } },
  { pattern: "squash", deltas: { punch: -3 } },
  { pattern: "pumping", deltas: { punch: -2, drive: 2 } },
  { pattern: "pump", deltas: { punch: -2, drive: 2 } },

  // Lo-Fi: hi-fi <-> lo-fi
  { pattern: "lo-fi", deltas: { lofi: 4, brightness: -1 } },
  { pattern: "lofi", deltas: { lofi: 4, brightness: -1 } },
  { pattern: "vintage", deltas: { lofi: 2, drive: 1 } },
  { pattern: "nostalgic", deltas: { lofi: 2 } },
  { pattern: "bitcrush", deltas: { lofi: 4, movement: 2 } },
  { pattern: "glitch", deltas: { movement: 3, lofi: 2 } },
  { pattern: "stutter", deltas: { movement: 3, lofi: 1 } },
  { pattern: "chopped", deltas: { movement: 3, lofi: 2 } },

  // Genre/reference anchors - each nudges several axes at once
  { pattern: "deftones", deltas: { drive: 4, punch: -2 } },
  { pattern: "norma jean", deltas: { drive: 4, movement: 2 } },
  { pattern: "screamo", deltas: { drive: 4 } },
  { pattern: "industrial", deltas: { drive: 3, lofi: 2 } },
  { pattern: "d'angelo", deltas: { drive: -2, movement: 2, space: 1, punch: 1 } },
  { pattern: "questlove", deltas: { punch: 1, movement: 1 } },
  { pattern: "neo-soul", deltas: { brightness: -1, movement: 2, drive: -1 } },
  { pattern: "trip-hop", deltas: { space: 2, movement: 2, brightness: -1 } },
  { pattern: "trip hop", deltas: { space: 2, movement: 2, brightness: -1 } },
  { pattern: "silky", deltas: { brightness: -1, drive: -2 } },
  { pattern: "velvety", deltas: { brightness: -1, drive: -2 } },
  { pattern: "laid back", deltas: { punch: -1, movement: 1 } },
  { pattern: "laid-back", deltas: { punch: -1, movement: 1 } },
  { pattern: "busking", deltas: { drive: -2, space: -2, movement: -2, lofi: -1 } },
  { pattern: "acoustic", deltas: { drive: -2, lofi: -1 } },
  { pattern: "unplugged", deltas: { drive: -2, space: -1 } },
]

// Drive/space/movement/lofi default low rather than neutral (5) because they
// each gate whether an optional stage (saturation/delay/modulation/glitch)
// appears at all in buildDrumChain - a truly neutral 5 would clear every
// inclusion threshold on its own, so an unremarkable prompt with no signal on
// an axis would still get every optional stage every time. Brightness/punch/
// width don't gate inclusion (every chain always has an EQ/compression/space
// stage), so those stay genuinely neutral.
const AXIS_DEFAULTS: AxisScores = { drive: 2, brightness: 5, space: 2, movement: 2, punch: 5, width: 5, lofi: 2 }

/** Continuous mixing-axis scores from free text - see lib/chain-axes.ts for what each axis means. */
export function computeAxisScores(input: string): AxisScores {
  const text = input.toLowerCase()
  const totals: AxisScores = { ...AXIS_DEFAULTS }

  for (const { pattern, deltas } of axisKeywordWeights) {
    if (!text.includes(pattern)) continue
    for (const [axis, delta] of Object.entries(deltas) as [keyof AxisScores, number][]) {
      totals[axis] += delta as number
    }
  }

  for (const axis of Object.keys(totals) as (keyof AxisScores)[]) {
    totals[axis] = clampAxis(totals[axis])
  }

  return totals
}

export interface MatchResult {
  trackType: TrackType
  vibe: Vibe
  axes: AxisScores
  matchedVibeKeywords: string[]
  highlightedStages: string[]
  matchedStageKeywords: string[]
}

export function matchPromptToChain(input: string): MatchResult {
  const text = input.toLowerCase()

  let trackType: TrackType = "drums"
  if (vocalTrackKeywords.some((kw) => text.includes(kw))) trackType = "vocals"
  else if (bassTrackKeywords.some((kw) => text.includes(kw))) trackType = "bass"
  else if (keysTrackKeywords.some((kw) => text.includes(kw))) trackType = "keys"

  let bestVibe: Vibe = "psych-trip-hop"
  let bestScore = -1
  let bestMatched: string[] = []

  ;(Object.keys(vibeKeywords) as Vibe[]).forEach((vibe) => {
    const matched = vibeKeywords[vibe].filter((kw) => text.includes(kw))
    const score = matched.length
    if (score > bestScore) {
      bestScore = score
      bestVibe = vibe
      bestMatched = matched
    }
  })

  const highlightedStages: string[] = []
  const matchedStageKeywords: string[] = []
  Object.entries(stageKeywords).forEach(([stageId, kws]) => {
    const matched = kws.filter((kw) => text.includes(kw))
    if (matched.length > 0) {
      highlightedStages.push(stageId)
      matchedStageKeywords.push(...matched)
    }
  })

  return {
    trackType,
    vibe: bestVibe,
    axes: computeAxisScores(text),
    matchedVibeKeywords: bestMatched,
    highlightedStages,
    matchedStageKeywords: Array.from(new Set(matchedStageKeywords)),
  }
}
