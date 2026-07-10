export interface TuningRec {
  plugin: string
  role: string
  tip: string
}

// Built from plugins confirmed in your actual Logic Pro Plug-In Manager (UAD, Waves, Plugin Alliance)
// plus Antares, which you also own. Order reflects a sensible signal-flow priority, not a hard rule.
export const vocalTuningRecs: TuningRec[] = [
  {
    plugin: "Antares Auto-Tune",
    role: "Primary pitch correction",
    tip: "Your main tuning tool. Use Graph mode for note-accurate manual correction (best for reproducing a specific reference melody), or Auto mode with a slower Retune Speed for transparent, human-feeling correction.",
  },
  {
    plugin: "UAD Topline Vocal Tune",
    role: "Alternative pitch correction + automatic key detection",
    tip: "Good second option — its automatic key detection can cross-check what Auto-Key/your own key detection already told you, and it's ultra-low-latency for tracking a take with correction already monitoring.",
  },
  {
    plugin: "Synchro Arts VocALign",
    role: "Aligning backing vocals / doubles to your lead take",
    tip: "Not a tuner — a time/pitch alignment tool. Use this AFTER tuning, to snap backing vocals or doubled takes tightly to your lead vocal's timing so harmonies don't feel loose.",
  },
  {
    plugin: "Waves R-Vox (Renaissance Vox)",
    role: "Vocal channel strip — gate, compression, gain",
    tip: "Run this before or after tuning to keep dynamics consistent — its 3-knob simplicity (Gate/Compress/dbx-style gain) makes it a fast, reliable vocal levelling stage.",
  },
  {
    plugin: "Plugin Alliance SPL De-Esser",
    role: "De-essing",
    tip: "Use after tuning and compression — tuning/pitch correction can sometimes emphasize sibilance, so de-ess after, not before.",
  },
  {
    plugin: "Plugin Alliance Noveltech Vocal Enhancer",
    role: "Harmonic presence/enhancement",
    tip: "A finishing touch — adds clarity/air without a traditional EQ boost. Use sparingly, late in the chain, once tuning and dynamics are settled.",
  },
]
