import type { Vibe } from "./chain-data"
import type { TrackType } from "./prompt-match"

export type InstrumentRole = "drums" | "keys" | "bass" | "guitar-electric" | "guitar-acoustic"

export const instrumentRoleMeta: { id: InstrumentRole; label: string; pluginName: string }[] = [
  { id: "drums", label: "Drums", pluginName: "DrumGPT" },
  { id: "keys", label: "Keys", pluginName: "Siren" },
  { id: "bass", label: "Bass", pluginName: "Siren" },
  { id: "guitar-electric", label: "Electric Guitar", pluginName: "Siren" },
  { id: "guitar-acoustic", label: "Acoustic Guitar", pluginName: "Siren" },
]

type RoleSeeds = Record<InstrumentRole, string>

// DIVISION OF LABOR: Siren/DrumGPT supply the RAW, humanistic source instrument — real playing
// dynamics, natural touch, believable performance nuance. All processing character (saturation,
// distortion, bitcrush, filter movement, tape wobble, glitch) is deliberately left OUT of these
// prompts on purpose — that's the FX Chain Builder's job, using your actual UAD/Plugin
// Alliance/Waves/FabFilter/Kilohearts gear. Keeps the two systems complementary, not duplicating
// each other's work.
const seeds: Record<Vibe, RoleSeeds> = {
  "clean-glitch": {
    drums:
      "Real, human-played modern drum kit. Natural velocity variation across hits, believable stick/hand dynamics, present but unprocessed — a well-recorded kit, not a processed one. Precise timing with just enough human feel to not sound quantized.",
    keys:
      "Bright, clean acoustic-adjacent keys performance. Natural touch dynamics, expressive velocity response, believable finger movement between notes — a real player's touch, no baked-in effects.",
    bass:
      "Real, tightly-played electric bass performance. Natural finger or pick attack, believable note-to-note dynamics, subtle natural sustain — unprocessed, precise playing.",
    "guitar-electric":
      "Clean, real electric guitar performance. Natural pick dynamics, believable strum/pick variation, expressive touch — bone-dry amp tone with no effects, just the honest instrument.",
    "guitar-acoustic":
      "Real acoustic guitar performance. Natural pluck dynamics, believable finger movement and string noise, close and present — an honest, unprocessed recording.",
  },
  "heavy-glitch": {
    drums:
      "Real, hard-hit drum kit performance. Aggressive but human velocity dynamics, believable hand/foot playing feel, raw and present — the source hit, not the processed result.",
    keys:
      "Raw, percussive keys performance. Hard, expressive touch dynamics, believable aggressive playing feel — unprocessed source tone, no distortion baked in.",
    bass:
      "Raw, aggressively-played electric bass. Natural hard-pick or finger attack, real dynamic intensity, unprocessed low end — the honest source tone before any drive.",
    "guitar-electric":
      "Raw, hard-played electric guitar performance. Real palm-mute and pick dynamics, aggressive but human timing feel — clean amp tone, undistorted, an honest raw source to drive later.",
    "guitar-acoustic":
      "Raw, percussive acoustic guitar performance. Hard, expressive pluck dynamics, natural string noise — unprocessed, present.",
  },
  "psych-trip-hop": {
    drums:
      "Real, laid-back drum kit performance. Natural human swing and micro-timing looseness, believable dynamic variation, warm and present — an honest recorded kit before any coloration.",
    keys:
      "Warm, natural keys/piano performance. Slow, expressive touch dynamics, believable note decay and sustain, real player phrasing — unprocessed source tone.",
    bass:
      "Deep, natural electric bass performance. Soft, expressive finger dynamics, real note sustain and decay, honest low end — unprocessed source.",
    "guitar-electric":
      "Clean, natural electric guitar performance. Soft pick dynamics, expressive sustain, believable phrasing — dry amp tone, unprocessed.",
    "guitar-acoustic":
      "Natural acoustic guitar performance. Soft, expressive pluck dynamics, real string and body resonance — unprocessed, present.",
  },
  "neo-soul-triphop": {
    drums:
      "Real, in-the-pocket drum kit performance. Human, laid-back timing feel, natural dynamic touch across kick/snare/hats, believable groove — D'Angelo/Questlove-style human pocket, unquantized and unprocessed.",
    keys:
      "Warm, expressive electric piano performance. Real player touch dynamics, natural note decay, believable phrasing and chord voicing — honest Rhodes-style source tone, no effects baked in.",
    bass:
      "Round, expressive electric bass performance. Real finger-style dynamics, natural glide/slide phrasing, believable pocket feel — Thundercat-adjacent playing style, unprocessed source.",
    "guitar-electric":
      "Warm, soulful electric guitar performance. Real, expressive comping dynamics, natural touch and phrasing — clean dry amp tone, unprocessed.",
    "guitar-acoustic":
      "Warm acoustic guitar performance. Natural, expressive pluck dynamics, real body resonance, believable phrasing — unprocessed, intimate.",
  },
  "live-organic": {
    drums:
      "Fully natural, live-feeling drum kit performance. Real human dynamics and micro-timing, honest room presence, zero processing — exactly as it would sound played live.",
    keys:
      "Fully natural acoustic piano or Rhodes performance. Real player touch dynamics, honest tone, zero processing.",
    bass:
      "Fully natural upright or clean electric bass performance. Real finger dynamics, honest low end, zero processing.",
    "guitar-electric":
      "Fully natural electric guitar performance. Real pick/strum dynamics, honest clean amp tone, zero effects — built for a live solo set.",
    "guitar-acoustic":
      "Fully natural acoustic guitar performance, close-mic'd. Real pluck dynamics, honest body resonance, zero processing — built for solo live/busking performance.",
  },
}

const vocalContextSeeds: RoleSeeds = {
  drums:
    "Sparse, real drum kit performance to sit under a vocal. Soft, human dynamics, honest unprocessed source — minimal, out of the vocal's way.",
  keys:
    "Real, expressive pad/piano performance to sit under a vocal. Slow, natural touch dynamics, honest sustain — unprocessed source tone.",
  bass:
    "Sparse, natural electric bass performance to anchor a vocal. Soft finger dynamics, honest low end, unprocessed.",
  "guitar-electric":
    "Sparse, natural electric guitar performance under a vocal. Soft, expressive touch, honest dry amp tone, unprocessed.",
  "guitar-acoustic":
    "Sparse, natural acoustic guitar performance under a vocal. Soft pluck dynamics, honest resonance, unprocessed.",
}

export interface DawPromptEntry {
  role: InstrumentRole
  pluginName: string
  label: string
  prompt: string
}

export function buildDawPrompts(
  vibe: Vibe,
  trackType: TrackType,
  rawPrompt: string,
  roles: InstrumentRole[]
): DawPromptEntry[] {
  const roleSeeds = trackType === "vocals" ? vocalContextSeeds : seeds[vibe]
  const userContext = rawPrompt.trim() ? ` User's own description to weave in: "${rawPrompt.trim()}".` : ""

  return roles.map((role) => {
    const meta = instrumentRoleMeta.find((m) => m.id === role)!
    return {
      role,
      pluginName: meta.pluginName,
      label: meta.label,
      prompt: `${roleSeeds[role]}${userContext}`,
    }
  })
}
