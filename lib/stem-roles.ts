import type { InstrumentRole } from "./daw-prompts"

export type StemRole = InstrumentRole | "vocals" | "backing-vocals" | "synths" | "fx" | "other"

export interface StemRoleMeta {
  id: StemRole
  label: string
  hasDawPrompt: boolean // whether Siren/DrumGPT prompt generation applies to this stem type
  note: string
}

// Default 6 match YOUR actual Suno export split: Vocals, Bass, Guitar, Synths, Other, FX.
// Extra roles (Drums, Backing Vocals, Keys, Acoustic Guitar) stay selectable in the dropdown
// for tracks/services that split further.
export const stemRoleMeta: StemRoleMeta[] = [
  {
    id: "vocals",
    label: "Vocals",
    hasDawPrompt: false,
    note: "This is a human performance, not a synth prompt — re-sing it yourself, referencing the detected key/tempo below. See Vocal Tuning Recommendations for pitch-correction options from your own plugins.",
  },
  { id: "bass", label: "Bass", hasDawPrompt: true, note: "Rebuild via Siren, tuned to this stem's key." },
  { id: "guitar-electric", label: "Guitar", hasDawPrompt: true, note: "Rebuild via Siren, tuned to this stem's key." },
  {
    id: "synths",
    label: "Synths",
    hasDawPrompt: true,
    note: "Rebuild via Siren (using the Keys prompt template as the closest starting point — adjust wording toward 'synth' character once you hear it).",
  },
  {
    id: "other",
    label: "Other",
    hasDawPrompt: false,
    note: "Suno's catch-all stem — could be pads, strings, anything not split above. Use the analysis below to judge what it's doing and rebuild by ear from your own library.",
  },
  {
    id: "fx",
    label: "FX",
    hasDawPrompt: false,
    note: "Risers, impacts, textures — usually not worth precisely reproducing note-for-note. Use the analysis as a reference and design your own FX pass from your library/plugins.",
  },
  { id: "drums", label: "Drums (if split separately)", hasDawPrompt: true, note: "Rebuild via DrumGPT, tuned to this stem's tempo." },
  { id: "keys", label: "Keys (if split separately)", hasDawPrompt: true, note: "Rebuild via Siren, tuned to this stem's key." },
  { id: "guitar-acoustic", label: "Acoustic Guitar (if split separately)", hasDawPrompt: true, note: "Rebuild via Siren, tuned to this stem's key." },
  {
    id: "backing-vocals",
    label: "Backing Vocals (if split separately)",
    hasDawPrompt: false,
    note: "Re-sing these too. Once recorded, use Synchro Arts VocALign to tightly time/pitch-align them to your lead vocal take.",
  },
]

// Maps a stem role to the InstrumentRole used by buildDawPrompts (Siren/DrumGPT prompt seeds).
// "synths" doesn't have its own seed set, so it borrows the Keys template as the closest match.
export function stemRoleToInstrumentRole(role: StemRole): InstrumentRole | null {
  if (role === "synths") return "keys"
  if (role === "drums" || role === "bass" || role === "keys" || role === "guitar-electric" || role === "guitar-acoustic") {
    return role
  }
  return null
}
