import type { ChainStage, Vibe } from "./chain-data"

// Same 5 vibes as the drum bus and bass chains, reinterpreted for keys/Rhodes/EP -
// the vibe selector applies across instruments. Stage ids reuse the ids drums/bass
// already use so stageCategoryMap needs no new entries.
export const keysChain: Record<Vibe, ChainStage[]> = {
  "clean-glitch": [
    {
      id: "eq",
      name: "1. Bright, Tight EQ",
      role: "Clean, modern tone - present without being harsh",
      options: [
        { brand: "FabFilter", plugin: "Pro-Q 3", tip: "Gentle boost 3-5kHz for clarity, HP below 80Hz to keep it out of the bass's way." },
        { brand: "Plugin Alliance", plugin: "bx_console SSL 4000 E EQ", tip: "Small presence boost, nothing dramatic - this vibe is about control, not color." },
      ],
    },
    {
      id: "compression",
      name: "2. Controlled Compression",
      role: "Even out dynamics so nothing jumps out of the mix",
      options: [
        { brand: "Waves", plugin: "Renaissance Compressor", tip: "Medium attack/release, 2-3dB GR - transparent, not pumping." },
      ],
    },
    {
      id: "glitch-fx",
      name: "3. Glitch Accent (subtle, optional)",
      role: "One stutter/reverse moment per phrase, matching the drum bus's restraint",
      options: [
        { brand: "Kilohearts", plugin: "Stutter", tip: "Low mix, tempo-synced - an accent on a phrase-ending chord, not a constant effect." },
      ],
    },
  ],
  "heavy-glitch": [
    {
      id: "saturation",
      name: "1. Bitcrush/Saturation",
      role: "This is the character stage - aggressive, degraded tone",
      options: [
        { brand: "Kilohearts", plugin: "Bitcrush", tip: "Reduce bit depth/sample rate noticeably - this should sound broken on purpose." },
        { brand: "Soundtoys", plugin: "Decapitator (Punish mode)", tip: "Alternative/parallel layer for more analog-flavored grit instead of digital crush." },
      ],
    },
    {
      id: "compression",
      name: "2. Heavy Compression",
      role: "Squash it to match the aggression of the drum bus and bass",
      options: [
        { brand: "Waves", plugin: "CLA-76 (all-buttons-in)", tip: "Fast attack/release, push hard - let it pump with the rest of the mix." },
      ],
    },
    {
      id: "modulation",
      name: "3. Chaotic Modulation",
      role: "Unstable movement - filter chokes, erratic rate changes",
      options: [
        { brand: "Kilohearts", plugin: "Frequency Shifter", tip: "Fast, irregular rate - deliberately unmusical for a few beats at a time." },
      ],
    },
    {
      id: "glitch-fx",
      name: "4. Glitch/Stutter Send",
      role: "Same chaos as the drum bus's fills, kept in sync",
      options: [
        { brand: "Kilohearts", plugin: "Stutter + Bitcrush (chained)", tip: "Match the drum bus's glitch send settings so fills read as one coordinated hit." },
      ],
    },
  ],
  "psych-trip-hop": [
    {
      id: "tape-warble",
      name: "1. Tape Warble",
      role: "Wow & flutter is the core of a warped/hazy EP sound",
      options: [
        { brand: "UAD", plugin: "Ampex ATR-102", tip: "Push wow/flutter amount - this is the main character of the vibe." },
        { brand: "Waves", plugin: "Kramer Tape", tip: "Alternative/parallel layer for extra hiss and drift." },
      ],
    },
    {
      id: "modulation",
      name: "2. Chorus/Phaser",
      role: "Classic EP movement - width and slow drift",
      options: [
        { brand: "Soundtoys", plugin: "PhaseMistress", tip: "Slow rate, moderate depth - a wide, slow-breathing phase sweep." },
        { brand: "UAD", plugin: "Moog Multimode Filter", tip: "Alternative - a slow filter sweep instead of/in addition to phasing." },
      ],
    },
    {
      id: "delay-fx",
      name: "3. Modulated Delay",
      role: "Wide, hazy repeats that blur into the space rather than sitting as distinct echoes",
      options: [
        { brand: "FabFilter", plugin: "Timeless 2", tip: "Long feedback, filtered repeats, subtle pitch/time modulation on the delay line itself." },
      ],
    },
    {
      id: "space",
      name: "4. Wide, Modulated Reverb",
      role: "Glue the keys into the same hazy space as the rest of the mix",
      options: [
        { brand: "Eventide", plugin: "Blackhole", tip: "Long, diffuse, modulated - this should feel like it's dissolving into the mix." },
      ],
    },
  ],
  "neo-soul-triphop": [
    {
      id: "modulation-vocal",
      name: "1. Classic Tremolo/Chorus",
      role: "The Rhodes-warm movement this whole vibe is built around",
      options: [
        { brand: "Soundtoys", plugin: "Tremolator", tip: "Medium rate, moderate depth - the classic Rhodes tremolo, present but not distracting." },
        { brand: "UAD", plugin: "Moog Multimode Filter", tip: "Alternative - subtle envelope-following filter movement instead of tremolo." },
      ],
    },
    {
      id: "saturation",
      name: "2. Tube Warmth",
      role: "Soft harmonic saturation - the felt-not-heard warmth D'Angelo/Questlove-style keys live in",
      options: [
        { brand: "UAD", plugin: "Studer A800", tip: "Light drive only - roundness, not grit." },
      ],
    },
    {
      id: "compression",
      name: "3. Pocket Compression",
      role: "Even, musical leveling that locks the keys into the pocket with the bass and drums",
      options: [
        { brand: "UAD", plugin: "LA-2A (Limit mode)", tip: "Slow, natural - the same warm-glue setting the bass chain uses, for cohesion." },
      ],
    },
    {
      id: "delay-fx",
      name: "4. Tasteful Delay Throws",
      role: "Sparse, analog-flavored throws on chord changes - ear candy, not a wash",
      options: [
        { brand: "Waves", plugin: "H-Delay", tip: "Synced 1/8 or dotted-1/8, low feedback, automate in only on chord changes." },
      ],
    },
  ],
  "live-organic": [
    {
      id: "eq",
      name: "1. Natural EQ",
      role: "Clean up the room/mic without changing the instrument's real character",
      options: [
        { brand: "FabFilter", plugin: "Pro-Q 3", tip: "HP below 40-50Hz for rumble only - otherwise leave the natural tone alone." },
      ],
    },
    {
      id: "compression",
      name: "2. Light Leveling",
      role: "Just enough for a live take to sit consistently - shouldn't be audible",
      options: [
        { brand: "UAD", plugin: "LA-2A (Compress mode, light)", tip: "1-3dB GR max - safety net compression for a live/busking context." },
      ],
    },
    {
      id: "space",
      name: "3. Minimal Room",
      role: "A believable sense of the real room the instrument was played in",
      options: [
        { brand: "UAD", plugin: "Capitol Chambers", tip: "Low mix, natural decay - this should sound like a room, not an effect." },
      ],
    },
  ],
}
