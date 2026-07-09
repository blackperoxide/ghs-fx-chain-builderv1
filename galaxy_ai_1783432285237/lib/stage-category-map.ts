import type { Category } from "./plugin-library"

// Maps every stage id used across drumBusChain and ovoToledoVocalChain to a plugin category,
// so the library matcher knows which of the user's uploaded plugins are relevant to that stage.
export const stageCategoryMap: Record<string, Category> = {
  transient: "transient",
  glue: "compression",
  compression: "compression",
  "compression-2": "compression",
  saturation: "saturation",
  eq: "eq",
  "eq-vocal": "eq",
  "glitch-fx": "glitch",
  modulation: "modulation",
  "modulation-vocal": "modulation",
  "delay-fx": "delay",
  "delay-vocal": "delay",
  space: "reverb",
  "space-vocal": "reverb",
  "tape-warble": "saturation",
  "pitch-character": "amp",
  "double-desync": "doubler",
}
