import type { Vibe, ChainStage } from "./chain-data"

export const bassChain: Record<Vibe, ChainStage[]> = {
  "clean-glitch": [
    {
      id: "transient",
      name: "1. Transient Shaping",
      role: "Snap the pick/finger attack before anything else touches it",
      options: [
        { brand: "Plugin Alliance", plugin: "SPL Transient Designer", tip: "Attack +2-3dB, Sustain -1dB — enough snap to cut through without going boomy." },
        { brand: "UAD", plugin: "UA 1176LN Rev E (fast attack)", tip: "Light nudge if you skip SPL — fast attack, low ratio just to catch the pick transient." },
      ],
    },
    {
      id: "saturation",
      name: "2. DI / Amp Character",
      role: "Modern low-end push with a little harmonic edge, without losing sub",
      options: [
        { brand: "UAD", plugin: "Little Labs VOG (Voice Of God)", tip: "Drive lightly for that classic modern-bass DI push and harmonic edge — this is THE bass DI plugin, use it as your default here." },
        { brand: "UAD", plugin: "Ampeg SVT3Pro", tip: "Blend in parallel at 10-20% for amp grit under the clean DI." },
      ],
    },
    {
      id: "compression",
      name: "3. Compression",
      role: "Keep it tight and consistent — modern bass wants control, not pump",
      options: [
        { brand: "UAD", plugin: "UA 1176LN Rev E", tip: "Fast attack, fast release, 4:1 — tight, modern, consistent." },
        { brand: "Waves", plugin: "CLA-76", tip: "Alternative if UAD isn't loaded — same fast/fast approach." },
      ],
    },
    {
      id: "eq",
      name: "4. EQ",
      role: "Carve the mud, keep the click",
      options: [
        { brand: "Plugin Alliance", plugin: "bx_console SSL 4000 E EQ", tip: "HP ~30Hz, small boost 700Hz-1kHz for pick click, cut 250-350Hz mud." },
      ],
    },
    {
      id: "space",
      name: "5. Space (minimal)",
      role: "Bass mostly stays dry — just enough for glue",
      options: [
        { brand: "UAD", plugin: "EMT 140 Plate", tip: "5-8% mix only — this is glue, not ambience. Too much reverb on bass reads as mud fast." },
      ],
    },
  ],
  "heavy-glitch": [
    {
      id: "transient",
      name: "1. Transient Shaping",
      role: "Exaggerate the hit before you smash it",
      options: [
        { brand: "Plugin Alliance", plugin: "SPL Transient Designer", tip: "Attack +5-6dB — push it, you're about to compress hard anyway." },
      ],
    },
    {
      id: "saturation",
      name: "2. Fuzz / Grind (the character stage)",
      role: "This is where 'Deftones bass' actually lives",
      options: [
        { brand: "UAD", plugin: "Thermionic Culture Vulture", tip: "Push the drive hard for fuzzed-out, aggressive harmonic distortion — the main character tool for this chain." },
        { brand: "UAD", plugin: "Ampeg SVTVR Classic", tip: "Blend in parallel for amp-driven grind under the fuzz." },
      ],
    },
    {
      id: "compression",
      name: "3. Heavy Compression",
      role: "Squash it flat, let it pump",
      options: [
        { brand: "UAD", plugin: "API 2500", tip: "Ratio 4:1+, fast attack, 6-8dB GR for real pumping aggression." },
        { brand: "Waves", plugin: "CLA-76 (all-buttons-in)", tip: "Alternative — extreme setting for max grind." },
      ],
    },
    {
      id: "eq",
      name: "4. Aggressive EQ",
      role: "Mid grind and aggression",
      options: [
        { brand: "Plugin Alliance", plugin: "bx_console Neve 88RS", tip: "Boost 800Hz-1.2kHz hard for aggressive mid grind, HP 40-50Hz." },
      ],
    },
    {
      id: "glitch-fx",
      name: "5. Glitch / Stutter Send",
      role: "Chaotic breaks on fills",
      options: [
        { brand: "Kilohearts", plugin: "Stutter + Bitcrush (chained)", tip: "Same combo as the heavy-glitch drum bus — fast/chaotic stutter into bitcrush on fills only." },
      ],
    },
    {
      id: "space",
      name: "6. Space / Crush",
      role: "Only on accented hits",
      options: [
        { brand: "UAD", plugin: "EMT 140 Plate", tip: "Short decay, automate the send in only on accented/chorus hits." },
      ],
    },
  ],
  "psych-trip-hop": [
    {
      id: "transient",
      name: "1. Transient Shaping",
      role: "Soften slightly for the laid-back pocket",
      options: [
        { brand: "Plugin Alliance", plugin: "SPL Transient Designer", tip: "Attack neutral to -2dB, Sustain +2dB for a rounder, warmer hit." },
      ],
    },
    {
      id: "saturation",
      name: "2. Tape Warmth / Wobble",
      role: "Matches the drum bus's wow/flutter character",
      options: [
        { brand: "UAD", plugin: "Ampex ATR-102", tip: "Gentle drive, wow/flutter ON — pitch-drift character matching the rest of the psych chain." },
      ],
    },
    {
      id: "compression",
      name: "3. Glue Compression",
      role: "Smooth, musical, not squashed",
      options: [
        { brand: "UAD", plugin: "Fairchild 670", tip: "Stereo-linked, slow attack, 2-3dB GR — smooth glue." },
      ],
    },
    {
      id: "eq",
      name: "4. Tone Shaping",
      role: "Warm and dusty, not bright",
      options: [
        { brand: "Plugin Alliance", plugin: "bx_console SSL 4000 E EQ", tip: "Gentle low shelf boost ~80Hz, cut above 6kHz to keep it dusty." },
      ],
    },
    {
      id: "modulation",
      name: "5. Filter Movement",
      role: "Subtle psychedelic motion",
      options: [
        { brand: "UAD", plugin: "Moog Multimode Filter", tip: "Slow LFO sweep, low resonance, subtle — on a parallel bus so the fundamental stays solid." },
      ],
    },
    {
      id: "delay-fx",
      name: "6. Delay (texture only)",
      role: "Bass rarely wants big throws — keep this subtle",
      options: [
        { brand: "FabFilter", plugin: "Timeless 2", tip: "Very subtle, filtered, low mix — texture, not a feature." },
      ],
    },
    {
      id: "space",
      name: "7. Space",
      role: "Hazy but controlled — keep the sub centered",
      options: [
        { brand: "UAD", plugin: "Capitol Chambers", tip: "Longer decay is fine, but keep the mix very low (5-10%) so the sub stays mono and centered." },
      ],
    },
  ],
  "neo-soul-triphop": [
    {
      id: "transient",
      name: "1. Transient Shaping",
      role: "Round it off for that Questlove-pocket fatness",
      options: [
        { brand: "Plugin Alliance", plugin: "SPL Transient Designer", tip: "Attack -2 to -3dB, Sustain +2dB for a fat, rounded low end." },
      ],
    },
    {
      id: "saturation",
      name: "2. Warm Amp Character",
      role: "Fingerstyle warmth, Rhodes-adjacent",
      options: [
        { brand: "UAD", plugin: "Ampeg SVTVR Classic", tip: "Blend low for warm tube amp character." },
        { brand: "UAD", plugin: "Ampex ATR-102", tip: "Alternative — light tape warmth instead of amp grit." },
      ],
    },
    {
      id: "compression",
      name: "3. Pocket Glue",
      role: "Smooth glue that keeps the groove deep in the pocket",
      options: [
        { brand: "UAD", plugin: "Fairchild 670", tip: "Slow attack, 2-3dB GR, classic smooth-soul glue." },
        { brand: "UAD", plugin: "Teletronix LA-2A Silver", tip: "Alternative — even smoother, more vintage character." },
      ],
    },
    {
      id: "eq",
      name: "4. Warm Body EQ",
      role: "Thick, not muddy",
      options: [
        { brand: "Plugin Alliance", plugin: "bx_console Neve 88RS", tip: "Boost 150-250Hz for body, dip 400Hz to avoid boxiness, soft top roll-off above 7kHz." },
      ],
    },
    {
      id: "modulation",
      name: "5. Subtle Shimmer",
      role: "Barely-there movement",
      options: [
        { brand: "Waves", plugin: "MondoMod", tip: "Very low depth, slow rate — should be felt, not noticed." },
      ],
    },
    {
      id: "space",
      name: "6. Space",
      role: "Warm room, groove stays grounded",
      options: [
        { brand: "UAD", plugin: "Capitol Chambers", tip: "Short-medium decay (0.8-1.2s), low-passed return." },
      ],
    },
  ],
  "live-organic": [
    {
      id: "transient",
      name: "1. Light Transient Touch",
      role: "Keep it natural",
      options: [
        { brand: "Plugin Alliance", plugin: "SPL Transient Designer", tip: "Very light — +1dB attack max." },
      ],
    },
    {
      id: "compression",
      name: "2. Gentle Compression",
      role: "Control dynamics without squashing feel",
      options: [
        { brand: "Waves", plugin: "CLA-76 (light setting)", tip: "4:1, 2-3dB GR max — keep it natural." },
      ],
    },
    {
      id: "eq",
      name: "3. EQ for Live Cut-Through",
      role: "Carve space to cut through outdoors",
      options: [
        { brand: "Plugin Alliance", plugin: "bx_console Neve 88RS", tip: "HP 50Hz, gentle presence boost 1-2kHz." },
      ],
    },
    {
      id: "space",
      name: "4. Minimal Room",
      role: "Amp-spring character reads more natural outdoors than a plate",
      options: [
        { brand: "UAD", plugin: "AKG BX 20", tip: "Very low mix (5%) — classic spring reverb character for a live/busking feel." },
      ],
    },
  ],
}

export const bassGap = {
  title: "One spot your rig doesn't fully cover",
  body:
    "None of your main brands ship a dedicated sub/low-end harmonic exciter (like Waves MaxxBass). If bass feels thin on small speakers after this chain, the Little Labs VOG drive stage and the Ampeg amp blend above are your main tools for translating low end on phone/laptop speakers — worth picking up a dedicated bass enhancer later if this keeps coming up.",
}
