export type Category =
  | "transient"
  | "compression"
  | "eq"
  | "saturation"
  | "modulation"
  | "delay"
  | "reverb"
  | "glitch"
  | "deesser"
  | "doubler"
  | "pitch"
  | "amp"
  | "other"

export const categoryLabels: Record<Category, string> = {
  transient: "Transient Shaping",
  compression: "Compression",
  eq: "EQ / Tone",
  saturation: "Saturation / Tape / Drive",
  modulation: "Modulation (chorus/phaser/tremolo)",
  delay: "Delay",
  reverb: "Reverb / Space",
  glitch: "Glitch / Stutter / Bitcrush",
  deesser: "De-Essing",
  doubler: "Doubling / Pitch Detune",
  pitch: "Pitch Shifting",
  amp: "Amp / Cab Sim",
  other: "Uncategorized",
}

// Curated known-plugin -> category map. Matching is done against lowercase substrings,
// so "UAD Fairchild 670" matches the "fairchild" entry regardless of exact naming.
// This is a best-effort seed list, not exhaustive — anything unmatched falls through to
// the heuristic keyword guesser below, and unmatched plugins are still listed as "other"
// rather than silently dropped.
const curated: Record<string, Category> = {
  // UAD
  "1176": "compression", fairchild: "compression", "la-2a": "compression", "la2a": "compression",
  "api 2500": "compression", "33609": "compression", "shadow hills": "compression",
  pultec: "eq", helios: "eq", neve: "eq", "bax eq": "eq",
  "studer a800": "saturation", "ampex atr": "saturation", "moog multimode": "modulation",
  "capitol chambers": "reverb", "emt 140": "reverb", "emt 250": "reverb",
  // FabFilter
  "pro-q": "eq", "pro-c": "compression", "pro-l": "compression", "pro-r": "reverb",
  "pro-mb": "compression", "pro-ds": "deesser", "pro-g": "compression", saturn: "saturation",
  timeless: "delay", micro: "pitch", simplon: "eq",
  // Plugin Alliance
  "bx_console": "eq", bx_masterdesk: "compression", "black box hg": "saturation",
  "shadow hills comp": "compression", maag: "eq", "spl transient": "transient",
  "ampeg svt": "amp",
  // Waves
  "cla-76": "compression", "cla-2a": "compression", "ssl g-master": "compression",
  "ssl channel": "eq", mondomod: "modulation", "h-delay": "delay", "h-reverb": "reverb",
  "kramer tape": "saturation", doubler: "doubler", sibilance: "deesser", renaissance: "compression",
  soundshifter: "pitch",
  // Soundtoys
  decapitator: "saturation", echoboy: "delay", "little alterboy": "pitch",
  microshift: "doubler", panman: "modulation", phasemistress: "modulation",
  crystallizer: "delay", filterfreak: "eq", "devil-loc": "compression",
  radiator: "saturation", tremolator: "modulation", superplate: "reverb",
  "little radiator": "saturation", "little microshift": "doubler", "little primaltap": "delay",
  primaltap: "delay", sie: "eq", "space blender": "reverb",
  // Kilohearts
  "phase plant": "modulation", "snap heap": "other", multipass: "other",
  stutter: "glitch", bitcrush: "glitch", "frequency shifter": "modulation",
  "ring mod": "modulation", disperser: "eq", "comb filter": "modulation",
  "carve eq": "eq", "slice eq": "eq", flanger: "modulation", chorus: "modulation",
  "kilohearts": "other",
  // Neural DSP
  archetype: "amp", "neural dsp": "amp",
  // Eventide
  blackhole: "reverb", tricerachorus: "modulation", micropitch: "pitch",
  physion: "other", ultratap: "delay", undulator: "modulation",
  crushstation: "saturation", tverb: "reverb", spliteq: "eq", elevate: "compression",
  h3000: "pitch", eventide: "other",
  // IK Multimedia
  "t-racks": "eq", trs: "eq", amplitube: "amp", mixbox: "other", "tape machine": "saturation",
  comprexxor: "compression", "csr hardware": "reverb",
  // iZotope (from Meaw list, common ownership)
  ozone: "eq", rx: "other", nectar: "eq", neutron: "eq",
  // Others
  effectrix: "glitch", "stutter edit": "glitch",
}

export function categorize(pluginName: string): Category {
  const name = pluginName.toLowerCase()
  for (const key of Object.keys(curated)) {
    if (name.includes(key)) return curated[key]
  }
  // Heuristic fallback for anything not in the curated map
  if (/verb|hall|plate|chamber|room/.test(name)) return "reverb"
  if (/delay|echo|tap\b/.test(name)) return "delay"
  if (/comp\b|compressor|limiter|glue/.test(name)) return "compression"
  if (/\beq\b|equal/.test(name)) return "eq"
  if (/sat|drive|fuzz|tape|tube|distort|overdrive|amp\b/.test(name)) return "saturation"
  if (/chorus|phase|phaser|tremolo|flang|mod\b/.test(name)) return "modulation"
  if (/glitch|stutter|crush|repeat/.test(name)) return "glitch"
  if (/de-?ess|sibilan/.test(name)) return "deesser"
  if (/double|widen|width/.test(name)) return "doubler"
  if (/pitch|tune|shift/.test(name)) return "pitch"
  if (/transient|punch/.test(name)) return "transient"
  return "other"
}

export function parsePluginList(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(/\r?\n|,/)
        .map((s) => s.trim())
        .filter(Boolean)
    )
  )
}

export type LibraryIndex = Record<Category, string[]>

export function buildLibraryIndex(names: string[]): LibraryIndex {
  const index = {
    transient: [], compression: [], eq: [], saturation: [], modulation: [],
    delay: [], reverb: [], glitch: [], deesser: [], doubler: [], pitch: [], amp: [], other: [],
  } as LibraryIndex
  names.forEach((n) => {
    const cat = categorize(n)
    index[cat].push(n)
  })
  return index
}
