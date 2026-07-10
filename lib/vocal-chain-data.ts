import type { PluginOption } from "./chain-data"

export interface VocalStage {
  id: string
  name: string
  role: string
  options: PluginOption[]
  note?: string
}

// "OVO Toledo" reference chain — the moody, pitched-down October's Very Own atmosphere
// crossed with Toledo's signature tape-warbled, deliberately-desynced double-tracked vocal.
export const ovoToledoVocalChain: VocalStage[] = [
  {
    id: "double-desync",
    name: "1. The Desync Move (do this first, in your DAW)",
    role: "This is the core of the sound — it happens before any plugin touches the vocal",
    options: [],
    note:
      "Record (or duplicate) the vocal into two takes. Nudge Take B 10-30ms off the grid (earlier or later — try both). Pitch-shift Take B down 5-15 cents using your DAW's native clip pitch tool (not a plugin — a native time/pitch offset, no formant correction). Pan them slightly off-center (10-20%) instead of hard L/R for a subtler, more 'in your head' desync than a wide stereo double.",
  },
  {
    id: "tape-warble",
    name: "2. Tape Warble (the wobble)",
    role: "Independent wow & flutter per take is what actually sells 'desync' as tape drift, not just a timing error",
    options: [
      { brand: "UAD", plugin: "Ampex ATR-102", tip: "Insert separately on Take A and Take B. Push wow/flutter amount differently on each (e.g. more flutter on Take B) so the two takes drift out of phase with each other over time." },
      { brand: "UAD", plugin: "Studer A800", tip: "Alternative/parallel option — slightly more aggressive saturation character if you want more grit under the wobble." },
      { brand: "Waves", plugin: "Kramer Tape", tip: "Use if you want a 3rd, more lo-fi layer blended low underneath for extra hiss and flutter texture." },
    ],
  },
  {
    id: "pitch-character",
    name: "3. OVO Low-End Pitch Character",
    role: "The moody, pitched-down October's Very Own vocal weight",
    options: [
      { brand: "UAD", plugin: "Fairchild 670", tip: "Stereo-linked across both takes, slow attack, moderate release — glues the pitched-down double into one warm, heavy vocal body." },
      { brand: "UAD", plugin: "Teletronix LA-2A (Silver or TC)", tip: "Alternative — smoother, more vintage compression character, less obviously 'squashed' than the 670." },
    ],
  },
  {
    id: "compression-2",
    name: "4. Vocal Bus Compression",
    role: "Second-stage glue after the two takes are combined to a bus",
    options: [
      { brand: "Waves", plugin: "CLA-76", tip: "Fast attack, medium release, 4:1 — adds forward presence once the takes are summed." },
      { brand: "Plugin Alliance", plugin: "Shadow Hills Compressor", tip: "Alternative — musical, opto-style glue with a bit more low-end weight retained." },
    ],
  },
  {
    id: "eq-vocal",
    name: "5. EQ / Tone",
    role: "Dark, warm, slightly muffled — resist the urge to brighten it",
    options: [
      { brand: "UAD", plugin: "Pultec EQP-1A", tip: "Boost ~60-100Hz and simultaneously cut nearby for that classic Pultec low-end thickness; gentle 'presence' boost around 3kHz kept subtle, not bright." },
      { brand: "Plugin Alliance", plugin: "bx_console SSL 4000 E EQ", tip: "Alternative/second-stage — high shelf cut above 9-10kHz to keep the top end dusty and OVO-dark." },
    ],
  },
  {
    id: "modulation-vocal",
    name: "6. Subtle Modulation",
    role: "Reinforces the drift without turning it into an obvious chorus effect",
    options: [
      { brand: "Waves", plugin: "MondoMod", tip: "Very slow rate, low depth, phaser-leaning blend — parallel bus only, keep it under the mix so it's felt, not heard." },
    ],
  },
  {
    id: "delay-vocal",
    name: "7. Delay Throws",
    role: "Washy tails on key phrase-ends, not constant",
    options: [
      { brand: "FabFilter", plugin: "Timeless 2", tip: "Dotted-8th or triplet delay, filtered repeats (low-passed), automate the send in only on phrase tails for that OVO-style trailing echo." },
    ],
  },
  {
    id: "space-vocal",
    name: "8. Reverb / Space",
    role: "Deep but controlled — the vocal should feel like it's in a room, not floating in a hall",
    options: [
      { brand: "UAD", plugin: "Capitol Chambers", tip: "Medium decay (1.2-1.8s), notable pre-delay (30-50ms) so the dry desync stays intelligible before the tail blooms." },
      { brand: "Waves", plugin: "H-Reverb", tip: "Alternative — plate algorithm, HF damping up, low mix (10-18%)." },
    ],
  },
]

export const vocalGap = {
  title: "Where your rig needs a manual assist",
  body:
    "None of UAD, FabFilter, Plugin Alliance, or Waves ship a dedicated 'detune doubler' plugin (like Soundtoys Little AlterBoy or MicroShift) that automates desync in one insert. That's fine — the real OVO/Toledo effect is mostly a performance + editing technique (the manual double-track nudge + native pitch offset in step 1) reinforced by tape wobble, not a single plugin trick. Once the two takes are desynced at the DAW level, everything downstream is fully covered by your existing gear.",
}
