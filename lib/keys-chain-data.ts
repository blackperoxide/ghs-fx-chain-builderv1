import type { Vibe, ChainStage } from "./chain-data"

export const keysChain: Record<Vibe, ChainStage[]> = {
  "clean-glitch": [
    {
      id: "compression",
      name: "1. Compression",
      role: "Even out dynamics for a tight, modern part",
      options: [
        { brand: "Waves", plugin: "CLA-76", tip: "3:1, moderate attack — keeps it consistent without squashing feel." },
        { brand: "UAD", plugin: "API 2500", tip: "Alternative — a touch more glue if the part is busy." },
      ],
    },
    {
      id: "eq",
      name: "2. EQ",
      role: "Clarity, and get out of the bass's way",
      options: [
        { brand: "Plugin Alliance", plugin: "bx_console SSL 4000 E EQ", tip: "HP 80-100Hz to keep low end from clashing with bass, gentle high shelf boost for clarity." },
      ],
    },
    {
      id: "modulation",
      name: "3. Width (subtle)",
      role: "Barely-there width, not a chorus effect",
      options: [
        { brand: "Waves", plugin: "MondoMod", tip: "Very light chorus blend, low depth — keep it modern and tight, not swirly." },
      ],
    },
    {
      id: "space",
      name: "4. Space",
      role: "Present and polished",
      options: [
        { brand: "UAD", plugin: "EMT 140 Plate", tip: "Short decay, low-medium mix for a present, modern sound." },
      ],
    },
  ],
  "heavy-glitch": [
    {
      id: "saturation",
      name: "1. Crush / Grit (the character stage)",
      role: "Crushed, aggressive digital stab character",
      options: [
        { brand: "Kilohearts", plugin: "Bitcrush", tip: "Push hard for a crushed, lo-fi digital stab character." },
        { brand: "UAD", plugin: "Thermionic Culture Vulture", tip: "Alternative — analog-flavored grit instead of digital crush." },
      ],
    },
    {
      id: "compression",
      name: "2. Compression",
      role: "Squash it for an in-your-face stab",
      options: [
        { brand: "UAD", plugin: "API 2500", tip: "Fast attack, aggressive GR — squashed and upfront." },
      ],
    },
    {
      id: "eq",
      name: "3. Aggressive EQ",
      role: "Presence and aggression",
      options: [
        { brand: "Plugin Alliance", plugin: "bx_console Neve 88RS", tip: "Boost 2-4kHz for aggressive presence, HP 100Hz." },
      ],
    },
    {
      id: "glitch-fx",
      name: "4. Stutter",
      role: "Chopped, chaotic stab rhythms on fills",
      options: [
        { brand: "Kilohearts", plugin: "Stutter", tip: "Chain before Bitcrush for chopped, bar-synced chaos on fills." },
      ],
    },
    {
      id: "space",
      name: "5. Space",
      role: "Tight, low mix so the crush stays upfront",
      options: [
        { brand: "UAD", plugin: "EMT 140 Plate", tip: "Short decay, low mix — the crush should stay in your face, not washed out." },
      ],
    },
  ],
  "psych-trip-hop": [
    {
      id: "saturation",
      name: "1. Tape Warmth",
      role: "Matches the drum bus's wow/flutter character",
      options: [
        { brand: "UAD", plugin: "Ampex ATR-102", tip: "Gentle drive, wow/flutter on for pitch-drift matching the rest of the chain." },
      ],
    },
    {
      id: "compression",
      name: "2. Glue Compression",
      role: "Smooth, musical",
      options: [
        { brand: "UAD", plugin: "Fairchild 670", tip: "Slow attack, 2dB GR glue." },
      ],
    },
    {
      id: "eq",
      name: "3. Tone Shaping",
      role: "Warm and dusty",
      options: [
        { brand: "Plugin Alliance", plugin: "bx_console SSL 4000 E EQ", tip: "Low shelf warmth boost, cut above 8kHz for dusty top end." },
      ],
    },
    {
      id: "modulation",
      name: "4. Swirl (the signature move on keys)",
      role: "This is the psychedelic character stage for this instrument",
      options: [
        { brand: "Waves", plugin: "MondoMod", tip: "Slow rate, moderate depth phaser/chorus blend — this is where the vibe really lives on keys." },
      ],
    },
    {
      id: "delay-fx",
      name: "5. Delay Throws",
      role: "Washy transition tails",
      options: [
        { brand: "FabFilter", plugin: "Timeless 2", tip: "Dotted-8th, filtered ping-pong repeats — automate a throw at phrase ends." },
      ],
    },
    {
      id: "space",
      name: "6. Space",
      role: "Wide, hazy wash",
      options: [
        { brand: "UAD", plugin: "Capitol Chambers", tip: "Long decay (2-2.5s), heavy pre-delay, hazy back wall." },
      ],
    },
  ],
  "neo-soul-triphop": [
    {
      id: "saturation",
      name: "1. Rhodes Warmth",
      role: "Classic Rhodes-through-tape character",
      options: [
        { brand: "UAD", plugin: "Ampex ATR-102", tip: "Gentle drive, subtle flutter — just enough for that analog EP warmth." },
      ],
    },
    {
      id: "compression",
      name: "2. Compression",
      role: "Gentle glue that doesn't kill dynamics",
      options: [
        { brand: "UAD", plugin: "Teletronix LA-2A Silver", tip: "Slow/smooth — classic opto glue for keys." },
      ],
    },
    {
      id: "eq",
      name: "3. Warm Body EQ",
      role: "Warm low-mid, gentle presence",
      options: [
        { brand: "Plugin Alliance", plugin: "bx_console Neve 88RS", tip: "Boost ~200-300Hz for body, gentle presence around 3kHz, soft top roll-off." },
      ],
    },
    {
      id: "modulation",
      name: "4. Rhodes Tremolo (the signature move)",
      role: "The D'Angelo-era vibrato character",
      options: [
        { brand: "Waves", plugin: "MondoMod", tip: "Moderate rate, classic tremolo/chorus blend — this mimics the Rhodes' own built-in vibrato circuit." },
      ],
    },
    {
      id: "delay-fx",
      name: "5. Delay (sparse)",
      role: "Only on transition moments",
      options: [
        { brand: "FabFilter", plugin: "Timeless 2", tip: "Sparse, filtered — used only at section transitions, not constantly." },
      ],
    },
    {
      id: "space",
      name: "6. Space",
      role: "Warm and close, not washy",
      options: [
        { brand: "UAD", plugin: "Capitol Chambers", tip: "Medium decay (1-1.5s) — keep it warm and close, not spacious." },
      ],
    },
  ],
  "live-organic": [
    {
      id: "compression",
      name: "1. Gentle Compression",
      role: "Natural dynamics",
      options: [
        { brand: "Waves", plugin: "CLA-76 (light setting)", tip: "Gentle — keep the natural feel of a live/acoustic part." },
      ],
    },
    {
      id: "eq",
      name: "2. EQ",
      role: "Clean and present",
      options: [
        { brand: "Plugin Alliance", plugin: "bx_console Neve 88RS", tip: "HP 60-80Hz, light presence boost." },
      ],
    },
    {
      id: "space",
      name: "3. Minimal Space",
      role: "Natural, unprocessed feel for a solo/duo set",
      options: [
        { brand: "UAD", plugin: "AKG BX 20", tip: "Very low mix (5-8%) — natural spring character suited to a live set." },
      ],
    },
  ],
}

export const keysGap = {
  title: "Worth knowing before you use this chain",
  body:
    "This assumes you're processing a real Rhodes, a keys VST, or a sampled EP already recorded in the track — none of your four main brands include a dedicated Rhodes/EP simulator instrument (that's synthesis, not FX processing). The 'Rhodes vibrato' character in the neo-soul and psych chains above is added entirely through the modulation stage (MondoMod), mimicking the instrument's own built-in tremolo circuit rather than modeling the instrument itself.",
}
