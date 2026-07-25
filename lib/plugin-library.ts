// lib/plugin-library.ts
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
const curated: Record<string, Category> = {
  // UAD — compressors/limiters
  "1176": "compression", fairchild: "compression", "la-2a": "compression", "la2a": "compression",
  "teletronix": "compression", "api 2500": "compression", "33609": "compression",
  "shadow hills": "compression", distressor: "compression", "empirical labs": "compression",
  "fatso": "compression", "manley variable mu": "compression", "manley vox": "compression",
  dbx: "compression", elysia: "compression", "cambridge": "eq", "precision buss": "compression",
  "precision limiter": "compression", "precision maximizer": "compression", "precision multiband": "compression",
  "precision de-esser": "deesser", "gain station": "compression", "summit audio": "compression",
  "tube-tech cl": "compression", "harrison 32c": "compression", raw: "compression",
  // UAD — EQ
  pultec: "eq", helios: "eq", neve: "eq", "bax eq": "eq", "hitsville eq": "eq", millennia: "eq",
  "tube-tech pe": "eq", "tube-tech me": "eq", "trident a-range": "eq", chandler: "eq",
  "dangerous": "eq", "bx_digital": "eq", "oxford eq": "eq", "mdweq": "eq", maag: "eq",
  "little labs ibp": "eq",
  // UAD — saturation/tape/drive
  "studer a800": "saturation", "ampex atr": "saturation", "oxide tape": "saturation",
  "galaxy tape echo": "delay", "thermionic culture vulture": "saturation", "century tube": "saturation",
  "oxford inflator": "saturation", "vertigo": "saturation",
  "black box hg": "saturation", "brigade chorus": "modulation",
  // UAD — amp/DI
  "ampeg": "amp", "little labs vog": "amp", "little labs ibp2": "amp", fender: "amp",
  marshall: "amp", friedman: "amp", diezel: "amp", engl: "amp", suhr: "amp", fuchs: "amp",
  "gallien krueger": "amp", "eden wt": "amp", softube: "amp", "akg bx": "reverb",
  // UAD — reverb/delay
  "capitol chambers": "reverb", "emt 140": "reverb", "emt 250": "reverb", "ocean way": "reverb",
  "realverb": "reverb", "dreamverb": "reverb", "pure plate": "reverb", "sound machine": "reverb",
  "lexicon": "reverb", "cooper time cube": "delay", "korg sdd": "delay", "roland re-201": "delay",
  "roland ce-1": "modulation", "ep-34": "delay", "eventide h910": "pitch",
  // UAD — modulation/pitch
  "moog multimode": "modulation", "dytronics": "modulation", "mxr flanger": "modulation",
  "auto-tune": "pitch", "antares": "pitch", "bx_refinement": "pitch", "bx_tuner": "pitch",
  vocoder: "modulation",
  // FabFilter
  "pro-q": "eq", "pro-c": "compression", "pro-l": "compression", "pro-r": "reverb",
  "pro-mb": "compression", "pro-ds": "deesser", "pro-g": "compression", saturn: "saturation",
  timeless: "delay", micro: "pitch", simplon: "eq", volcano: "eq", "one-knob": "eq",
  // Plugin Alliance / Brainworx
  "bx_console": "eq", bx_masterdesk: "compression", "bx_subsynth": "eq", "bx_saturator": "saturation",
  "shadow hills comp": "compression", "spl transient": "transient", "spl twintube": "saturation",
  "spl vitalizer": "eq", "elysia alpha": "compression", "elysia mpressor": "compression",
  "harrison": "eq", "unfiltered audio": "other", "acme opticom": "compression",
  "3348": "compression", quad: "compression",
  // Waves
  "cla-76": "compression", "cla-2a": "compression", "cla-3a": "compression",
  "ssl g-master": "compression", "ssl channel": "eq", "ssl e-channel": "eq",
  mondomod: "modulation", "h-delay": "delay", "h-reverb": "reverb", "h-comp": "compression",
  "h-eq": "eq", "kramer tape": "saturation", "kramer master tape": "saturation",
  doubler: "doubler", sibilance: "deesser", "de-esser": "deesser", renaissance: "compression",
  rvox: "compression", soundshifter: "pitch", "vitamin": "eq", "scheps": "eq", "puigtec": "eq",
  "puigchild": "compression", "abbey road": "other", vocalrider: "compression",
  "waveshell": "other",
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
  "carve eq": "eq", "slice eq": "eq", flanger: "modulation", "kilohearts chorus": "modulation",
  "resonator": "modulation", "faturator": "saturation", "distortion": "saturation",
  "reverb": "reverb", "haas": "doubler", "transient shaper": "transient",
  "kilohearts": "other",
  // Eventide
  blackhole: "reverb", tricerachorus: "modulation", micropitch: "pitch",
  physion: "other", ultratap: "delay", undulator: "modulation",
  crushstation: "saturation", tverb: "reverb", spliteq: "eq", elevate: "compression",
  h3000: "pitch", eventide: "other",
  // IK Multimedia
  "t-racks": "eq", trs: "eq", amplitube: "amp", mixbox: "other", "tape machine": "saturation",
  comprexxor: "compression", "csr hardware": "reverb", "modo bass": "amp",
  // iZotope
  ozone: "eq", rx: "other", nectar: "eq", neutron: "eq", vocalsynth: "modulation",
  trash: "saturation", "stutter edit": "glitch", iris: "other", insight: "other",
  // Unison Audio
  "sound doctor": "other",
  // Blue Cat
  "patchwork": "other", "blue cat": "other", "mb-7": "eq", "late replies": "delay",
  "blue cat's chorus": "modulation", "blue cat's flanger": "modulation", "blue cat's gain": "other",
  "free amp": "amp", axiom: "other",
  // Native Instruments
  "solid bus comp": "compression", "solid dynamics": "compression", "solid eq": "eq",
  "vintage compressors": "compression", "passive eq": "eq", "vari comp": "compression",
  supercharger: "saturation", replika: "delay", raum: "reverb", "driver": "saturation",
  "the finger": "compression", "vc 2a": "compression", "vc 76": "compression",
  // Arturia
  "comp fet": "compression", "comp tube": "compression", "comp diode": "compression",
  "rev plate": "reverb", "rev intensity": "reverb", "chorus jun": "modulation",
  "delay tape": "delay", "delay brigade": "delay", "eq73": "eq", "eq1101": "eq",
  effectrix: "glitch",
}

export function categorize(pluginName: string): Category {
  const name = pluginName.toLowerCase()
  for (const key of Object.keys(curated)) {
    if (name.includes(key)) return curated[key]
  }
  // Heuristic fallback for anything not in the curated map — covers compressor
  // topology words, generic descriptors, and brand-agnostic naming.
  if (/verb|hall|plate|chamber|room|ambience/.test(name)) return "reverb"
  if (/delay|echo|tap\b|slap/.test(name)) return "delay"
  if (/comp\b|compressor|limiter|glue|opto|\bfet\b|\bvca\b|diode/.test(name)) return "compression"
  if (/\beq\b|equal|filter\b/.test(name)) return "eq"
  if (/sat|drive|fuzz|tape|tube|distort|overdrive|warm/.test(name)) return "saturation"
  if (/chorus|phase|phaser|tremolo|flang|mod\b|vibrato/.test(name)) return "modulation"
  if (/glitch|stutter|crush|repeat|bit\s?crush/.test(name)) return "glitch"
  if (/de-?ess|sibilan/.test(name)) return "deesser"
  if (/double|widen|width/.test(name)) return "doubler"
  if (/pitch|tune|shift|harmoniz/.test(name)) return "pitch"
  if (/transient|punch/.test(name)) return "transient"
  if (/amp\b|cab\b|preamp|di\b/.test(name)) return "amp"
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

// Guaranteed-available fallback per category, using Logic Pro's own stock
// plugins — shown when nothing in your pasted library matches a stage, so
// there's always at least one usable option even with zero third-party gear.
export const logicStockFallback: Record<Category, { plugin: string; tip: string }> = {
  transient: { plugin: "Compressor (fast attack trick)", tip: "Logic doesn't ship a dedicated transient designer — set a low ratio with a fast release to punch up the attack instead." },
  compression: { plugin: "Compressor", tip: "Try the Vintage FET or Vintage VCA circuit type for character closer to a real hardware compressor." },
  eq: { plugin: "Channel EQ", tip: "Logic's stock parametric — fully capable for surgical or musical moves." },
  saturation: { plugin: "Distortion II or Clip Distortion", tip: "For gentler warmth, Overdrive at a low drive setting is less aggressive than full distortion." },
  modulation: { plugin: "Chorus or Ensemble", tip: "Ensemble gives a wider, more three-dimensional modulation than the basic Chorus." },
  delay: { plugin: "Delay Designer or Tape Delay", tip: "Tape Delay adds built-in saturation and wow/flutter for free." },
  reverb: { plugin: "ChromaVerb", tip: "Logic's newer algorithmic reverb — flexible enough to stand in for plate, chamber, or hall." },
  glitch: { plugin: "Bitcrusher", tip: "Covers the crush/lo-fi half; true stutter/step-repeat still needs Kilohearts Stutter." },
  deesser: { plugin: "DeEsser 2", tip: "Logic's stock de-esser — solid for standard sibilance control." },
  doubler: { plugin: "(manual technique)", tip: "Doubling is really a performance/editing move — duplicate the take and nudge it, as described in the vocal chain's step 1." },
  pitch: { plugin: "Pitch Correction", tip: "Logic's stock pitch tool — basic but functional for corrective work." },
  amp: { plugin: "Amp Designer or Bass Amp Designer", tip: "Bass Amp Designer specifically is a genuinely solid stock bass amp/cab sim." },
  other: { plugin: "—", tip: "" },
}
