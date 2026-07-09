import type { Vibe } from "./chain-data"

export type TrackType = "drums" | "vocals"

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

// Vocal-request detection — if enough of these appear, switch track type to vocals automatically.
const vocalTrackKeywords = [
  "vocal", "vocals", "vox", "voice", "ovo", "toledo", "desync", "desynced",
  "double-tracked", "double tracked", "singer", "singing", "lyric", "lyrics",
]

export interface MatchResult {
  trackType: TrackType
  vibe: Vibe
  matchedVibeKeywords: string[]
  highlightedStages: string[]
  matchedStageKeywords: string[]
}

export function matchPromptToChain(input: string): MatchResult {
  const text = input.toLowerCase()

  const trackType: TrackType = vocalTrackKeywords.some((kw) => text.includes(kw)) ? "vocals" : "drums"

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
    matchedVibeKeywords: bestMatched,
    highlightedStages,
    matchedStageKeywords: Array.from(new Set(matchedStageKeywords)),
  }
}
