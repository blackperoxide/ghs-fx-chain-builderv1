export type Vibe = "clean-glitch" | "heavy-glitch" | "psych-trip-hop" | "neo-soul-triphop" | "live-organic"

export interface PluginOption {
  brand: string
  plugin: string
  tip: string
}

export interface ChainStage {
  id: string
  name: string
  role: string
  options: PluginOption[]
  note?: string
}

export const vibes: { id: Vibe; label: string; description: string }[] = [
  {
    id: "clean-glitch",
    label: "Clean Glitch",
    description: "Tight, punchy, subtle stutter — glitch as seasoning, not the whole dish.",
  },
  {
    id: "heavy-glitch",
    label: "Heavy Glitch / Distorted",
    description: "Deftones/Norma Jean-leaning — crushed, saturated, aggressive drum bus.",
  },
  {
    id: "psych-trip-hop",
    label: "Psychedelic Trip-Hop",
    description: "68-115 BPM swing, warped tape movement, wide modulated space.",
  },
  {
    id: "neo-soul-triphop",
    label: "Neo-Soul / Trip-Hop",
    description: "D'Angelo/Questlove pocket and Rhodes-warm low end, laid over hazy trip-hop atmosphere.",
  },
  {
    id: "live-organic",
    label: "Live / Organic (Busking-friendly)",
    description: "Minimal, natural dynamics for a solo-guitar-plus-loop live context.",
  },
]

export const drumBusChain: Record<Vibe, ChainStage[]> = {
  "clean-glitch": [
    {
      id: "transient",
      name: "1. Transient Shaping",
      role: "Snap the attack before anything else touches it",
      options: [
        { brand: "Plugin Alliance", plugin: "SPL Transient Designer", tip: "Attack +3-5dB, Sustain neutral. Do this before compression, always." },
        { brand: "UAD", plugin: "API 2500 (fast attack)", tip: "Attack 3, Release 2 — use as a light transient nudge if you skip SPL." },
      ],
    },
    {
      id: "glue",
      name: "2. Bus Glue Compression",
      role: "Cohere the kit into one punch",
      options: [
        { brand: "UAD", plugin: "API 2500 Bus Compressor", tip: "Ratio 2:1, slow attack, auto release, 1-3dB GR." },
        { brand: "Waves", plugin: "SSL G-Master Buss Compressor", tip: "4:1, medium attack, 2dB GR — the classic 'glue' setting." },
      ],
    },
    {
      id: "eq",
      name: "3. Tone / EQ",
      role: "Shape low-end weight and top-end snap",
      options: [
        { brand: "Plugin Alliance", plugin: "bx_console SSL 4000 E EQ", tip: "HP at 40Hz, small boost 3-5kHz for stick snap." },
        { brand: "FabFilter", plugin: "Timeless 2 (as static filter)", tip: "Use only if you don't have a dedicated EQ open — Timeless 2's filter can do a gentle tilt in a pinch." },
      ],
    },
    {
      id: "glitch-fx",
      name: "4. Glitch Send (subtle)",
      role: "One or two stutter/reverse moments per bar, on a send",
      options: [
        { brand: "Kilohearts", plugin: "Stutter", tip: "One or two short stutter triggers per phrase, tempo-synced, gate mix low (20-35%) so it reads as an accent, not a gimmick." },
        { brand: "FabFilter", plugin: "Timeless 2", tip: "Backup option — short 1/32-1/16 delay with high feedback, automate the mix in/out to fake a stutter roll if Kilohearts isn't loaded." },
      ],
    },
    {
      id: "space",
      name: "5. Room / Space",
      role: "Glue the kit into the mix without washing out the transient",
      options: [
        { brand: "UAD", plugin: "Capitol Chambers or EMT 140", tip: "Short pre-delay, 0.8-1.2s decay, low mix (8-15%)." },
        { brand: "Waves", plugin: "H-Reverb", tip: "Room algorithm, HF damping up, keep it under the transient designer stage in the signal path (post-EQ, parallel send)." },
      ],
    },
  ],
  "heavy-glitch": [
    {
      id: "transient",
      name: "1. Transient Shaping",
      role: "Exaggerate the hit before you smash it",
      options: [
        { brand: "Plugin Alliance", plugin: "SPL Transient Designer", tip: "Attack +6-8dB — push hard, you're about to compress it into oblivion anyway." },
      ],
    },
    {
      id: "saturation",
      name: "2. Saturation / Grit",
      role: "This is the character stage — where 'Deftones drum bus' lives",
      options: [
        { brand: "UAD", plugin: "Studer A800 or Ampex ATR-102", tip: "Drive input +4-6dB for tape compression + harmonic grit before the compressor." },
        { brand: "Plugin Alliance", plugin: "Black Box HG-2", tip: "Push the input hard for a fuzzy, transistor-saturated top end." },
        { brand: "Waves", plugin: "Kramer Tape", tip: "Alternative/parallel tape saturation — flutter + wow on for extra wobble." },
      ],
    },
    {
      id: "compression",
      name: "3. Heavy Bus Compression",
      role: "Squash it flat, let it breathe/pump",
      options: [
        { brand: "Waves", plugin: "CLA-76 (bus mode, blend in parallel)", tip: "All-buttons-in style, fast attack/release, blend 40-60% wet for NY-compression pump." },
        { brand: "UAD", plugin: "API 2500", tip: "Ratio 4:1+, fast attack, 6-10dB GR for real pumping." },
      ],
    },
    {
      id: "eq",
      name: "4. Aggressive EQ",
      role: "Carve space, add aggression",
      options: [
        { brand: "Plugin Alliance", plugin: "bx_console Neve 88RS", tip: "Boost 2-4kHz hard for snare/click aggression, HP 50-60Hz." },
        { brand: "UAD", plugin: "Helios Type 69", tip: "Alternative character EQ — musical top-end boost." },
      ],
    },
    {
      id: "glitch-fx",
      name: "5. Glitch / Stutter Send",
      role: "Chaotic breaks, reversed hits, filter chokes",
      options: [
        { brand: "Kilohearts", plugin: "Stutter + Bitcrush (chained)", tip: "Stutter set to fast/chaotic mode into Bitcrush for a genuinely crushed, bar-synced chaos edit on fills — this is the real deal, not a fake-out." },
        { brand: "FabFilter", plugin: "Timeless 2", tip: "Backup/parallel layer — extreme feedback + ping-pong + reverse mode for chopped fill moments." },
      ],
    },
    {
      id: "space",
      name: "6. Space / Crush",
      role: "Lo-fi width and decay",
      options: [
        { brand: "UAD", plugin: "EMT 140 Plate", tip: "Short decay, high mix on chorus hits only (automate)." },
        { brand: "Waves", plugin: "H-Delay", tip: "Synced slap-back for aggressive fill tails." },
      ],
    },
  ],
  "psych-trip-hop": [
    {
      id: "transient",
      name: "1. Transient Shaping",
      role: "Soften slightly for that laid-back trip-hop pocket",
      options: [
        { brand: "Plugin Alliance", plugin: "SPL Transient Designer", tip: "Attack neutral to -2dB, Sustain +3dB for a rounder, warmer hit." },
      ],
    },
    {
      id: "saturation",
      name: "2. Tape Warmth",
      role: "The wobble/warp that defines this vibe",
      options: [
        { brand: "UAD", plugin: "Ampex ATR-102", tip: "Drive gently, enable wow/flutter for pitch drift character." },
        { brand: "Waves", plugin: "Kramer Tape", tip: "Alternative — dial in visible flutter for a hazier, dreamlike wobble." },
      ],
    },
    {
      id: "compression",
      name: "3. Glue Compression",
      role: "Gentle, musical cohesion — not a squash",
      options: [
        { brand: "UAD", plugin: "Neve 33609", tip: "2:1, slow attack, auto release, 1-2dB GR — smooth and musical." },
        { brand: "Waves", plugin: "SSL G-Master Buss Compressor", tip: "Light 2:1 setting if you want a brighter alternative." },
      ],
    },
    {
      id: "eq",
      name: "4. Tone Shaping",
      role: "Warm low-mid, rolled-off harsh highs",
      options: [
        { brand: "Plugin Alliance", plugin: "bx_console SSL 4000 E EQ", tip: "Gentle low shelf boost ~100Hz, high shelf cut above 10kHz for that dusty trip-hop top end." },
      ],
    },
    {
      id: "modulation",
      name: "5. Modulation / Movement",
      role: "The psychedelic swirl",
      options: [
        { brand: "Waves", plugin: "MondoMod", tip: "Slow, subtle rate — tremolo/phaser blend on parallel bus for a breathing, psychedelic motion." },
        { brand: "UAD", plugin: "Moog Multimode Filter", tip: "Slow LFO sweep, low resonance, for a filtered dream-wash on toms/percussion." },
      ],
    },
    {
      id: "delay-fx",
      name: "6. Delay Throws",
      role: "Three-part transition-style tails (Frank Ocean-esque)",
      options: [
        { brand: "FabFilter", plugin: "Timeless 2", tip: "Dotted-8th ping-pong, moderate feedback, filtered repeats — automate a throw at section transitions." },
      ],
    },
    {
      id: "space",
      name: "7. Space",
      role: "Wide, hazy, but controlled",
      options: [
        { brand: "UAD", plugin: "Capitol Chambers", tip: "Long-ish decay (1.5-2.5s), heavy pre-delay, low-passed return for a hazy back wall." },
        { brand: "Waves", plugin: "H-Reverb", tip: "Hall/plate blend, damp highs for warmth." },
      ],
    },
  ],
  "neo-soul-triphop": [
    {
      id: "transient",
      name: "1. Transient Shaping",
      role: "Round it off — Questlove pocket lives in a softer, fatter hit, not a sharp click",
      options: [
        { brand: "Plugin Alliance", plugin: "SPL Transient Designer", tip: "Attack -2 to -4dB, Sustain +2-3dB for a fatter, rounder body on kick and snare." },
      ],
    },
    {
      id: "saturation",
      name: "2. Analog Warmth",
      role: "Rhodes/tape warmth — the neo-soul half of this chain",
      options: [
        { brand: "UAD", plugin: "Ampex ATR-102", tip: "Gentle drive, light wow/flutter — just enough to feel analog, not obviously warped like the psych-trip-hop chain." },
        { brand: "Waves", plugin: "Kramer Tape", tip: "Alternative — keep flutter subtle here, this is warmth not wobble." },
      ],
    },
    {
      id: "compression",
      name: "3. Pocket Glue",
      role: "Smooth, musical glue that keeps the groove sitting deep in the pocket",
      options: [
        { brand: "UAD", plugin: "Fairchild 670", tip: "Slow attack, moderate release, 2-3dB GR — the classic smooth-soul glue compressor." },
        { brand: "UAD", plugin: "Teletronix LA-2A (Silver)", tip: "Alternative — even smoother, more vintage-soul character, less obviously 'compressed.'" },
      ],
    },
    {
      id: "eq",
      name: "4. Warm Body EQ",
      role: "Boost the low-mid body that makes neo-soul drums feel 'thick,' not muddy",
      options: [
        { brand: "Plugin Alliance", plugin: "bx_console Neve 88RS", tip: "Gentle boost 150-250Hz for body, small dip 400Hz to avoid boxiness, soft top-end roll-off above 9kHz." },
      ],
    },
    {
      id: "modulation",
      name: "5. Subtle Shimmer",
      role: "A whisper of movement — Rhodes-adjacent, not psychedelic-wide",
      options: [
        { brand: "Waves", plugin: "MondoMod", tip: "Very low depth, slow rate, chorus-leaning blend on a parallel bus — should be felt, not noticed." },
      ],
    },
    {
      id: "glitch-fx",
      name: "6. Texture Accent (light touch)",
      role: "One glitch moment per section max — texture, not a genre statement",
      options: [
        { brand: "Kilohearts", plugin: "Stutter", tip: "Very occasional, low mix — a single stutter on a fill into a chorus, not a recurring effect. This chain is about groove, not glitch." },
      ],
    },
    {
      id: "delay-fx",
      name: "7. Delay",
      role: "Trip-hop haze layered on top of the soul foundation",
      options: [
        { brand: "FabFilter", plugin: "Timeless 2", tip: "Dotted-8th, filtered repeats, moderate feedback — same washy-transition move as the psych-trip-hop chain, just used more sparingly here." },
      ],
    },
    {
      id: "space",
      name: "8. Space",
      role: "Warm room, not a hazy wash — keep the groove grounded",
      options: [
        { brand: "UAD", plugin: "Capitol Chambers", tip: "Shorter decay than the psych-trip-hop chain (0.8-1.4s), moderate pre-delay, low-passed return." },
      ],
    },
  ],
  "live-organic": [
    {
      id: "transient",
      name: "1. Light Transient Touch",
      role: "Keep it natural — you're playing live",
      options: [
        { brand: "Plugin Alliance", plugin: "SPL Transient Designer", tip: "Very light touch, +1-2dB attack max, just enough to cut through a room mix." },
      ],
    },
    {
      id: "compression",
      name: "2. Gentle Compression",
      role: "Control dynamics without squashing feel",
      options: [
        { brand: "Waves", plugin: "CLA-76 (light setting, low ratio button)", tip: "4:1, medium attack, moderate release, 2-3dB GR max." },
      ],
    },
    {
      id: "eq",
      name: "3. EQ for Live Cut-Through",
      role: "Carve room for vocal/guitar in a live mix",
      options: [
        { brand: "Plugin Alliance", plugin: "bx_console Neve 88RS", tip: "HP 80Hz, gentle presence boost 2-3kHz." },
      ],
    },
    {
      id: "space",
      name: "4. Minimal Room",
      role: "Just enough space to feel natural outdoors/on stage",
      options: [
        { brand: "UAD", plugin: "EMT 140 Plate (low mix)", tip: "5-10% mix only — for a festival/busking set, less reverb reads clearer outdoors." },
      ],
    },
  ],
}

export const glitchGap = {
  title: "Glitch/stutter — now covered by your Kilohearts",
  body:
    "UAD, FabFilter, Plugin Alliance, and Waves don't ship a dedicated step/stutter glitch-repeater — but Kilohearts' Stutter and Bitcrush modules do exactly this job, and you already own them. The chains above now use Kilohearts as the primary glitch tool, with FabFilter Timeless 2's automated delay/feedback trick kept as a backup if Kilohearts isn't loaded on a given session.",
}
