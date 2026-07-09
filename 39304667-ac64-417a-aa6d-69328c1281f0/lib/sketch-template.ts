import type { Category } from "./plugin-library"

export interface SketchStageTemplate {
  id: string
  order: number
  label: string
  category: Category
  roleHint: string
}

// A generic, genre-agnostic signal chain skeleton — used for on-the-fly sketching,
// as opposed to the hand-tuned curated vibes on the main page.
export const sketchTemplate: SketchStageTemplate[] = [
  { id: "transient", order: 1, label: "Transient Shaping", category: "transient", roleHint: "Shape the attack before anything else touches it" },
  { id: "saturation", order: 2, label: "Saturation / Character", category: "saturation", roleHint: "The main character/warmth stage" },
  { id: "compression", order: 3, label: "Compression / Glue", category: "compression", roleHint: "Cohere dynamics into one consistent level" },
  { id: "eq", order: 4, label: "EQ / Tone", category: "eq", roleHint: "Shape tonal balance" },
  { id: "modulation", order: 5, label: "Modulation", category: "modulation", roleHint: "Optional movement/width — skip if not needed" },
  { id: "glitch", order: 6, label: "Glitch / Texture", category: "glitch", roleHint: "Optional texture accent — skip if not needed" },
  { id: "delay", order: 7, label: "Delay", category: "delay", roleHint: "Optional rhythmic/washy repeats — skip if not needed" },
  { id: "reverb", order: 8, label: "Reverb / Space", category: "reverb", roleHint: "Final space/glue" },
]
