import type { ChainStage, Vibe } from "./chain-data"

// Same 5 vibes as the drum bus chains, reinterpreted for bass - the vibe selector
// applies across instruments, not just drums. Stage ids intentionally reuse the
// same ids drums already uses (transient/compression/eq/saturation/modulation/
// glitch-fx/delay-fx/space) so stageCategoryMap needs no new entries.
export const bassChain: Record<Vibe, ChainStage[]> = {
  "clean-glitch": [
    {
      id: "transient",
      name: "1. Pick/Attack Control",
      role: "Even out pick or finger attack before compression exaggerates it",
      options: [
        { brand: "UAD", plugin: "1176 Rev A/E (fast attack)", tip: "Light touch, 2-3dB GR max - this is control, not squash." },
        { brand: "Plugin Alliance", plugin: "elysia alpha Compressor", tip: "Fast attack, auto release - keeps note-to-note dynamics tight without pumping." },
      ],
    },
    {
      id: "eq",
      name: "2. Low-End Focus EQ",
      role: "Carve room for the kick, keep the fundamental honest",
      options: [
        { brand: "Plugin Alliance", plugin: "bx_console SSL 4000 E EQ", tip: "HP at 30-40Hz, small dip 250-350Hz to avoid kick clash, gentle boost 800Hz-1.2kHz for pick definition." },
        { brand: "FabFilter", plugin: "Pro-Q 3", tip: "Dynamic EQ on 250-350Hz so the cut only kicks in when it's actually clashing." },
      ],
    },
    {
      id: "saturation",
      name: "3. Harmonic Edge",
      role: "Add just enough upper harmonic content that the bass still reads on small speakers",
      options: [
        { brand: "UAD", plugin: "Ampex ATR-102", tip: "Very light drive - this is for harmonics, not tone-shaping." },
        { brand: "Soundtoys", plugin: "Decapitator (Punish mode, low mix)", tip: "10-20% mix - a whisper of grit, not distortion." },
      ],
    },
    {
      id: "glitch-fx",
      name: "4. Glitch Accent (subtle, optional)",
      role: "One stutter/gate moment per phrase, on a send - matches the drum bus's restraint",
      options: [
        { brand: "Kilohearts", plugin: "Stutter", tip: "Low mix (15-25%), one trigger per phrase max - it should read as a wink, not a gimmick." },
      ],
    },
    {
      id: "compression-2",
      name: "5. Bus Glue",
      role: "Second-stage gentle leveling so the whole take sits at one consistent loudness",
      options: [
        { brand: "Waves", plugin: "SSL G-Master Buss Compressor", tip: "4:1, medium attack, 1-2dB GR - just enough to glue, not to flatten." },
      ],
    },
  ],
  "heavy-glitch": [
    {
      id: "transient",
      name: "1. Attack Shaping",
      role: "Exaggerate the pick/pluck before saturation smashes it",
      options: [
        { brand: "Plugin Alliance", plugin: "SPL Transient Designer", tip: "Attack +4-6dB - push it, the saturation stage is about to eat some of that back." },
      ],
    },
    {
      id: "saturation",
      name: "2. Heavy Saturation/Fuzz",
      role: "This is the character stage - where the aggressive tone actually comes from",
      options: [
        { brand: "Soundtoys", plugin: "Decapitator (Thrust mode)", tip: "Drive hard, blend in parallel if the fundamental starts disappearing under the fuzz." },
        { brand: "UAD", plugin: "Studer A800", tip: "Push input +6-8dB for real tape-compression grit before the compressor stage." },
      ],
    },
    {
      id: "compression",
      name: "3. Heavy Compression",
      role: "Squash it flat, let it pump with the drum bus",
      options: [
        { brand: "Waves", plugin: "CLA-76 (all-buttons-in, parallel blend)", tip: "Blend 40-60% wet - full NY-compression pump without losing the low end entirely." },
      ],
    },
    {
      id: "eq",
      name: "4. Aggressive EQ",
      role: "Carve space against the distorted drum bus, keep the fundamental audible",
      options: [
        { brand: "Plugin Alliance", plugin: "bx_console Neve 88RS", tip: "HP 50-60Hz, boost 700Hz-1kHz hard for cut-through-the-mix midrange." },
      ],
    },
    {
      id: "glitch-fx",
      name: "5. Glitch/Bitcrush Send",
      role: "Chaotic breaks matching the drum bus's fill moments",
      options: [
        { brand: "Kilohearts", plugin: "Stutter + Bitcrush (chained)", tip: "Same chain as the drum bus's glitch send - keep them synced so fills read as one gesture, not two." },
      ],
    },
  ],
  "psych-trip-hop": [
    {
      id: "compression",
      name: "1. Gentle Leveling",
      role: "Keep dynamics under control without killing the sway",
      options: [
        { brand: "UAD", plugin: "LA-2A (Compress mode)", tip: "Slow, musical, opto-style leveling - this shouldn't be audible as compression." },
      ],
    },
    {
      id: "saturation",
      name: "2. Tape Warble",
      role: "Independent wow & flutter is what actually sells 'warped' rather than just soft",
      options: [
        { brand: "UAD", plugin: "Ampex ATR-102", tip: "Push wow/flutter amount noticeably - this is the main character of the vibe, not a subtle touch." },
        { brand: "Waves", plugin: "Kramer Tape", tip: "Alternative/parallel layer for extra hiss and drift underneath." },
      ],
    },
    {
      id: "modulation",
      name: "3. Filtered Movement",
      role: "Slow filter sweep for the sense of something breathing under the mix",
      options: [
        { brand: "UAD", plugin: "Moog Multimode Filter", tip: "Slow LFO on cutoff, subtle depth - a wash, not a wobble-bass effect." },
      ],
    },
    {
      id: "eq",
      name: "4. Low-Pass Warmth",
      role: "Roll off the top so the bass sits hazy and back in the mix",
      options: [
        { brand: "FabFilter", plugin: "Pro-Q 3 (gentle low-pass)", tip: "Roll off above 3-4kHz - let the saturation stage's harmonics be the only 'top end' this bass has." },
      ],
    },
    {
      id: "space",
      name: "5. Wide, Low Space",
      role: "A hint of room so the bass feels like it's inside the same hazy space as everything else",
      options: [
        { brand: "UAD", plugin: "EMT 140 Plate", tip: "Very low mix (5-10%), long pre-delay - felt more than heard." },
      ],
    },
  ],
  "neo-soul-triphop": [
    {
      id: "compression",
      name: "1. Pocket Compression",
      role: "Even, felt leveling that locks the bass into the pocket with the drums",
      options: [
        { brand: "UAD", plugin: "LA-2A (Limit mode)", tip: "Slow attack, natural release - the classic warm-bass-in-the-pocket setting." },
      ],
    },
    {
      id: "eq",
      name: "2. Round, Warm EQ",
      role: "Full, round low end without mud - the D'Angelo/Questlove low end this vibe is built on",
      options: [
        { brand: "Plugin Alliance", plugin: "bx_console SSL 4000 E EQ", tip: "Gentle boost 80-120Hz for weight, small dip 300-400Hz to avoid boxiness." },
      ],
    },
    {
      id: "saturation",
      name: "3. Tube/Tape Warmth",
      role: "Soft harmonic saturation - the 'felt not heard' warmth that ties this vibe together",
      options: [
        { brand: "UAD", plugin: "Studer A800", tip: "Light drive only - this should round the note off, not add grit." },
      ],
    },
    {
      id: "modulation-vocal",
      name: "4. Subtle Chorus (optional)",
      role: "A touch of width/movement if the bass feels too static against the Rhodes",
      options: [
        { brand: "Soundtoys", plugin: "PhaseMistress", tip: "Very slow rate, low depth - width, not a phaser effect." },
      ],
    },
  ],
  "live-organic": [
    {
      id: "compression",
      name: "1. Light Leveling",
      role: "Just enough to keep a live take consistent - nothing that reads as 'compressed'",
      options: [
        { brand: "UAD", plugin: "LA-2A (Compress mode, light)", tip: "1-3dB GR max - this is safety net compression for a live/busking context, not a tone tool." },
      ],
    },
    {
      id: "eq",
      name: "2. Natural EQ",
      role: "Clean up the room/DI without changing the character of the instrument",
      options: [
        { brand: "FabFilter", plugin: "Pro-Q 3", tip: "HP below 40Hz to remove handling/room rumble, otherwise leave it alone." },
      ],
    },
    {
      id: "space",
      name: "3. Minimal Room (optional)",
      role: "Only if the DI/pickup sounds too dry and dead for the room the rest of the mix implies",
      options: [
        { brand: "UAD", plugin: "Capitol Chambers", tip: "Very low mix (5-8%) - just enough to sound like it's in a room, not a hall." },
      ],
    },
  ],
}
