import type { GenreProfile } from "./genre-profiles"

export interface AudioAnalysisResult {
  duration_sec: number
  sample_rate: number
  channels: number
  loudness: {
    integrated_lufs: number | null
    loudness_range_lu: number
    max_short_term_lufs: number | null
  }
  peaks: {
    true_peak_dbtp: number
    sample_peak_db: number
    clipped_samples: number
  }
  dynamics: {
    rms_db: number
    crest_factor_db: number
  }
  spectral_balance_pct: Record<string, number>
  spectral_centroid_hz: number
  problem_indices: {
    harshness_pct_2_5k: number
    muddiness_pct_200_500: number
    sibilance_pct_5_9k: number
    air_pct_10_16k: number
  }
  stereo: {
    overall_correlation: number | null
    low_end_correlation_below_150hz: number | null
  }
  tempo_estimate_bpm: number | null
  key: {
    detected: string | null
    confidence: number
  }
}

export type Severity = "good" | "watch" | "problem"

export interface Finding {
  id: string
  label: string
  severity: Severity
  detail: string
  fix: string
}

export function interpretAnalysis(r: AudioAnalysisResult, profile: GenreProfile, airTargetPct: number): Finding[] {
  const findings: Finding[] = []
  const [lufsLo, lufsHi] = profile.lufsRange
  const [crestLo, crestHi] = profile.crestFactorRange

  // --- Loudness (target window depends on selected genre profile) ---
  const lufs = r.loudness.integrated_lufs
  if (lufs !== null) {
    if (lufs > lufsHi) {
      findings.push({
        id: "lufs",
        label: `Integrated Loudness: ${lufs} LUFS`,
        severity: "problem",
        detail: `Hotter than the ${profile.label} target window (${lufsLo} to ${lufsHi} LUFS). Streaming platforms will turn this down automatically, which exposes over-limiting.`,
        fix: "Back off the final limiter ceiling/gain to land inside the target window.",
      })
    } else if (lufs < lufsLo - 4) {
      findings.push({
        id: "lufs",
        label: `Integrated Loudness: ${lufs} LUFS`,
        severity: "watch",
        detail: `Quieter than typical for ${profile.label} (target ${lufsLo} to ${lufsHi} LUFS). Not wrong, but you're leaving perceived loudness on the table.`,
        fix: "You likely have headroom to push master bus compression/limiting further without sacrificing dynamics you care about.",
      })
    } else {
      findings.push({
        id: "lufs",
        label: `Integrated Loudness: ${lufs} LUFS`,
        severity: "good",
        detail: `Sitting in a sensible range for ${profile.label}.`,
        fix: "No change needed on overall loudness.",
      })
    }
  }

  // --- True peak / clipping ---
  if (r.peaks.true_peak_dbtp > -1) {
    findings.push({
      id: "truepeak",
      label: `True Peak: ${r.peaks.true_peak_dbtp} dBTP`,
      severity: r.peaks.true_peak_dbtp > -0.3 ? "problem" : "watch",
      detail: "Above the -1dBTP safety margin most streaming codecs assume. Lossy encoding (AAC/MP3) can push inter-sample peaks over 0dBFS, causing audible clipping/distortion after upload.",
      fix: "Set your final limiter's true peak ceiling to -1dBTP (or -1.5dBTP to be extra safe).",
    })
  } else {
    findings.push({
      id: "truepeak",
      label: `True Peak: ${r.peaks.true_peak_dbtp} dBTP`,
      severity: "good",
      detail: "Safe margin for lossy encoding on streaming platforms.",
      fix: "No change needed.",
    })
  }
  if (r.peaks.clipped_samples > 0) {
    findings.push({
      id: "clipping",
      label: `${r.peaks.clipped_samples} sample(s) at full scale`,
      severity: "problem",
      detail: "Hard digital clipping detected at 0dBFS.",
      fix: "Turn down gain staging before the final limiter, or reduce limiter input drive.",
    })
  }

  // --- Dynamics / crest factor (range depends on genre profile) ---
  if (r.dynamics.crest_factor_db < crestLo) {
    findings.push({
      id: "crest",
      label: `Crest Factor: ${r.dynamics.crest_factor_db} dB`,
      severity: "watch",
      detail: `Lower than typical for ${profile.label} (expected ${crestLo}-${crestHi} dB) — heavily limited/compressed. Can sound fatiguing or pumped.`,
      fix: "If this wasn't intentional, ease off bus compression or limiter gain reduction.",
    })
  } else if (r.dynamics.crest_factor_db > crestHi) {
    findings.push({
      id: "crest",
      label: `Crest Factor: ${r.dynamics.crest_factor_db} dB`,
      severity: "watch",
      detail: `Higher than typical for ${profile.label} (expected ${crestLo}-${crestHi} dB) — transients are large relative to average level.`,
      fix: "If this is meant to compete at target loudness, you likely have room to add glue compression before final limiting.",
    })
  } else {
    findings.push({
      id: "crest",
      label: `Crest Factor: ${r.dynamics.crest_factor_db} dB`,
      severity: "good",
      detail: `Healthy dynamic range for ${profile.label}.`,
      fix: "No change needed.",
    })
  }

  // --- Muddiness (200-500Hz), thresholds depend on genre profile ---
  const mud = r.problem_indices.muddiness_pct_200_500
  const mudT = profile.muddinessThreshold
  if (mud > mudT.problem) {
    findings.push({
      id: "mud",
      label: `Muddiness (200-500Hz): ${mud}% of total energy`,
      severity: "problem",
      detail: `Significant low-mid buildup, above the ${profile.label} comfort zone (>${mudT.problem}%) — the classic 'boxy/muddy' zone where kick, bass, guitars, and vocal body mask each other.`,
      fix: "Cut 1-3dB somewhere in 250-400Hz on the busiest elements (bass, guitars, or the mix bus) — UAD Pultec EQP-1A or Plugin Alliance bx_console EQ both handle this cleanly.",
    })
  } else if (mud > mudT.watch) {
    findings.push({
      id: "mud",
      label: `Muddiness (200-500Hz): ${mud}% of total energy`,
      severity: "watch",
      detail: `Some low-mid buildup for ${profile.label} — not alarming, worth a listen on full-range monitors.`,
      fix: "A small, wide cut around 300Hz on your busiest low-mid elements can add clarity.",
    })
  } else {
    findings.push({
      id: "mud",
      label: `Muddiness (200-500Hz): ${mud}% of total energy`,
      severity: "good",
      detail: `Low-mids are appropriate for ${profile.label}.`,
      fix: "No change needed.",
    })
  }

  // --- Harshness (2-5kHz), thresholds depend on genre profile ---
  const harsh = r.problem_indices.harshness_pct_2_5k
  const harshT = profile.harshnessThreshold
  if (harsh > harshT.problem) {
    findings.push({
      id: "harsh",
      label: `Harshness (2-5kHz): ${harsh}% of total energy`,
      severity: "problem",
      detail: `Heavy concentration in the ear-fatigue zone, above the ${profile.label} comfort zone (>${harshT.problem}%).`,
      fix: "Try a dynamic/gentle static cut around 3-4kHz — Plugin Alliance bx_console or a Pultec-style EQ notch works well here.",
    })
  } else if (harsh > harshT.watch) {
    findings.push({
      id: "harsh",
      label: `Harshness (2-5kHz): ${harsh}% of total energy`,
      severity: "watch",
      detail: `Present but within range for ${profile.label} — worth a critical listen at moderate volume for listener fatigue over a full track length.`,
      fix: "A small dip (1-2dB) around 3kHz on the loudest offending source can help without dulling the mix.",
    })
  } else {
    findings.push({
      id: "harsh",
      label: `Harshness (2-5kHz): ${harsh}% of total energy`,
      severity: "good",
      detail: `Upper-mid energy is appropriate for ${profile.label}.`,
      fix: "No change needed.",
    })
  }

  // --- Sibilance (5-9kHz) — not genre-adjusted, sibilance is a technical issue regardless of style ---
  const sib = r.problem_indices.sibilance_pct_5_9k
  if (sib > 8) {
    findings.push({
      id: "sibilance",
      label: `Sibilance/Air overlap (5-9kHz): ${sib}% of total energy`,
      severity: "watch",
      detail: "High energy in the sibilance/cymbal-shimmer zone — could be harsh S/T sounds on vocals, or aggressive hats/cymbals.",
      fix: "If it's vocal-driven, a de-esser (Waves Sibilance) on the vocal bus. If it's cymbals/hats, a gentle high-shelf pull-back.",
    })
  }

  // --- Air (10-16kHz) — compared against the user-adjustable slider target, not a fixed genre rule ---
  const air = r.problem_indices.air_pct_10_16k
  const airDelta = air - airTargetPct
  if (airDelta < -1.5) {
    findings.push({
      id: "air",
      label: `Air (10-16kHz): ${air}% of total energy`,
      severity: "watch",
      detail: `Below your air target of ${airTargetPct}% — the mix may read as dull or closed-in on the very top end.`,
      fix: "A gentle high-shelf boost above 10-12kHz (or an exciter/harmonics stage) can restore openness — check whether this is intentional for the vibe before touching it.",
    })
  } else if (airDelta > 2) {
    findings.push({
      id: "air",
      label: `Air (10-16kHz): ${air}% of total energy`,
      severity: "watch",
      detail: `Above your air target of ${airTargetPct}% — could read as hissy, brittle, or overly bright, especially combined with sibilance.`,
      fix: "A gentle high-shelf pull-back above 10kHz, or check for excess noise floor/hiss in that region.",
    })
  } else {
    findings.push({
      id: "air",
      label: `Air (10-16kHz): ${air}% of total energy`,
      severity: "good",
      detail: `Matches your air target of ${airTargetPct}%.`,
      fix: "No change needed.",
    })
  }

  // --- Wasted frequency space check (low end) ---
  const bass = r.spectral_balance_pct["bass"] ?? 0
  const subBass = r.spectral_balance_pct["sub_bass"] ?? 0
  if (bass + subBass < 8) {
    findings.push({
      id: "thin-bass",
      label: `Bass + Sub-Bass: ${(bass + subBass).toFixed(1)}% of total energy`,
      severity: "watch",
      detail: "Low end is thin relative to the rest of the spectrum — you're leaving low-end weight on the table, which reads as 'small' on full-range systems.",
      fix: "Consider a low shelf boost around 80-100Hz (UAD Pultec EQP-1A is built for exactly this — boost and cut simultaneously for thickness without mud), or check your bass/kick balance in the mix.",
    })
  }

  // --- Bass mono compatibility ---
  const lowCorr = r.stereo.low_end_correlation_below_150hz
  if (lowCorr !== null && lowCorr < 0.7 && (bass + subBass) > 5) {
    findings.push({
      id: "bass-mono",
      label: `Low-End Mono Compatibility: ${lowCorr.toFixed(2)} correlation below 150Hz`,
      severity: "problem",
      detail: "Your bass/sub content isn't well-centered — on mono systems (club subs, phone speakers, some streaming platforms' mono fold-down), this can partially cancel out and lose low-end punch entirely.",
      fix: "Mono-ize everything below ~120-150Hz. Most consoles/EQs with M/S mode (FabFilter, Plugin Alliance bx_console) can do this directly, or use a dedicated mono-maker utility before the master bus.",
    })
  }

  // --- Overall stereo width ---
  if (r.stereo.overall_correlation !== null && r.stereo.overall_correlation < 0.2) {
    findings.push({
      id: "width",
      label: `Overall Stereo Correlation: ${r.stereo.overall_correlation.toFixed(2)}`,
      severity: "watch",
      detail: "Very wide/decorrelated stereo image — creative choice or risk of phase issues depending on intent.",
      fix: "Check in mono to confirm nothing critical (vocal, bass) disappears or thins out.",
    })
  }

  return findings
}

export function severityRank(s: Severity): number {
  return s === "problem" ? 0 : s === "watch" ? 1 : 2
}
