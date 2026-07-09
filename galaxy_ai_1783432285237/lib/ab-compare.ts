import type { AudioAnalysisResult } from "./audio-interpretation"

export type AbSeverity = "match" | "notable" | "priority"

export interface AbFinding {
  id: string
  label: string
  severity: AbSeverity
  detail: string
  fix: string
}

const bandFreqCenter: Record<string, string> = {
  sub_bass: "~40Hz",
  bass: "~150Hz",
  low_mid: "~350Hz",
  mid: "~1kHz",
  upper_mid: "~3kHz",
  presence: "~5kHz",
  brilliance: "~8kHz",
  air: "~13kHz",
}

const bandLabel: Record<string, string> = {
  sub_bass: "Sub-bass",
  bass: "Bass",
  low_mid: "Low-mid",
  mid: "Mid",
  upper_mid: "Upper-mid",
  presence: "Presence",
  brilliance: "Brilliance",
  air: "Air",
}

export function compareAnalyses(mine: AudioAnalysisResult, reference: AudioAnalysisResult): AbFinding[] {
  const findings: AbFinding[] = []

  // --- Loudness gap ---
  if (mine.loudness.integrated_lufs !== null && reference.loudness.integrated_lufs !== null) {
    const diff = reference.loudness.integrated_lufs - mine.loudness.integrated_lufs
    if (Math.abs(diff) > 1.5) {
      findings.push({
        id: "lufs-gap",
        label: `Loudness gap: ${diff > 0 ? "reference is" : "yours is"} ${Math.abs(diff).toFixed(1)} LU ${diff > 0 ? "louder" : "louder"}`,
        severity: Math.abs(diff) > 4 ? "priority" : "notable",
        detail: `Reference: ${reference.loudness.integrated_lufs} LUFS vs Yours: ${mine.loudness.integrated_lufs} LUFS.`,
        fix: diff > 0
          ? "Push your final limiter gain/ceiling up to close the gap — likely UAD or Waves limiter on the master bus."
          : "Back off your final limiter — you're hotter than the reference, which changes perceived punch and can mask other differences during A/B.",
      })
    } else {
      findings.push({
        id: "lufs-gap",
        label: "Loudness: closely matched",
        severity: "match",
        detail: `Reference: ${reference.loudness.integrated_lufs} LUFS vs Yours: ${mine.loudness.integrated_lufs} LUFS.`,
        fix: "No change needed — loudness-matched, so any remaining tonal differences you hear are real, not a volume illusion.",
      })
    }
  }

  // --- Dynamics gap ---
  const crestDiff = reference.dynamics.crest_factor_db - mine.dynamics.crest_factor_db
  if (Math.abs(crestDiff) > 2) {
    findings.push({
      id: "crest-gap",
      label: `Dynamics gap: reference is ${Math.abs(crestDiff).toFixed(1)}dB ${crestDiff < 0 ? "more compressed" : "more dynamic"} than yours`,
      severity: Math.abs(crestDiff) > 5 ? "priority" : "notable",
      detail: `Reference crest factor: ${reference.dynamics.crest_factor_db}dB vs Yours: ${mine.dynamics.crest_factor_db}dB.`,
      fix: crestDiff < 0
        ? "Reference is squashed more than yours — add more bus compression/limiting (UAD API 2500, Waves CLA-76) to close the gap."
        : "Reference is more dynamic/less compressed than yours — ease off your bus compression or limiter gain reduction.",
    })
  }

  // --- Spectral balance gaps, sorted by magnitude ---
  const bandDiffs = Object.keys(reference.spectral_balance_pct)
    .map((band) => {
      const refPct = reference.spectral_balance_pct[band] ?? 0
      const minePct = mine.spectral_balance_pct[band] ?? 0
      return { band, diff: refPct - minePct, refPct, minePct }
    })
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))

  bandDiffs.slice(0, 4).forEach(({ band, diff, refPct, minePct }) => {
    if (Math.abs(diff) < 3) return
    const label = bandLabel[band] ?? band
    const freq = bandFreqCenter[band] ?? ""
    findings.push({
      id: `band-${band}`,
      label: `${label} (${freq}): reference has ${Math.abs(diff).toFixed(1)}% ${diff > 0 ? "more" : "less"} energy here`,
      severity: Math.abs(diff) > 8 ? "priority" : "notable",
      detail: `Reference: ${refPct}% vs Yours: ${minePct}%.`,
      fix: diff > 0
        ? `Boost around ${freq} — UAD Pultec EQP-1A (great for bass/low-mid boosts) or Plugin Alliance bx_console EQ for surgical mid/high boosts.`
        : `Cut around ${freq} on your busiest source in that range — same EQ options, negative direction. This is likely your biggest single move to close the gap.`,
    })
  })

  // --- Muddiness / harshness / air gaps ---
  const mudDiff = reference.problem_indices.muddiness_pct_200_500 - mine.problem_indices.muddiness_pct_200_500
  if (Math.abs(mudDiff) > 4) {
    findings.push({
      id: "mud-gap",
      label: `Muddiness gap: reference has ${Math.abs(mudDiff).toFixed(1)}% ${mudDiff > 0 ? "more" : "less"} low-mid buildup`,
      severity: "notable",
      detail: `Reference: ${reference.problem_indices.muddiness_pct_200_500}% vs Yours: ${mine.problem_indices.muddiness_pct_200_500}%.`,
      fix: mudDiff > 0
        ? "The reference is intentionally denser/warmer in the 200-500Hz zone — you may be too clean here for a genre match. Consider less aggressive low-mid cutting."
        : "You have more low-mid buildup than the reference — cut 1-3dB around 300Hz to clean it up.",
    })
  }

  const harshDiff = reference.problem_indices.harshness_pct_2_5k - mine.problem_indices.harshness_pct_2_5k
  if (Math.abs(harshDiff) > 4) {
    findings.push({
      id: "harsh-gap",
      label: `Harshness gap: reference has ${Math.abs(harshDiff).toFixed(1)}% ${harshDiff > 0 ? "more" : "less"} 2-5kHz energy`,
      severity: "notable",
      detail: `Reference: ${reference.problem_indices.harshness_pct_2_5k}% vs Yours: ${mine.problem_indices.harshness_pct_2_5k}%.`,
      fix: harshDiff > 0
        ? "Reference is more forward/aggressive in the presence range than yours — a small boost around 3kHz (Plugin Alliance bx_console) can add that bite."
        : "You're harsher than the reference in the 2-5kHz zone — a gentle cut here will move you closer.",
    })
  }

  const airDiff = reference.problem_indices.air_pct_10_16k - mine.problem_indices.air_pct_10_16k
  if (Math.abs(airDiff) > 1.5) {
    findings.push({
      id: "air-gap",
      label: `Air gap: reference has ${Math.abs(airDiff).toFixed(1)}% ${airDiff > 0 ? "more" : "less"} top-end shimmer`,
      severity: "notable",
      detail: `Reference: ${reference.problem_indices.air_pct_10_16k}% vs Yours: ${mine.problem_indices.air_pct_10_16k}%.`,
      fix: airDiff > 0
        ? "Reference is brighter/airier above 10kHz — a gentle high-shelf boost or exciter stage will close this gap."
        : "You're brighter than the reference — pull back a high shelf above 10kHz to match its darker, more vintage top end.",
    })
  }

  // --- Key check ---
  if (mine.key.detected && reference.key.detected) {
    if (mine.key.detected === reference.key.detected) {
      findings.push({
        id: "key-match",
        label: `Key: both detected as ${reference.key.detected}`,
        severity: "match",
        detail: `Confidence — yours: ${mine.key.confidence}, reference: ${reference.key.confidence}.`,
        fix: "No change needed — you're already in the same key as the reference.",
      })
    } else {
      findings.push({
        id: "key-mismatch",
        label: `Key mismatch: yours is ${mine.key.detected}, reference is ${reference.key.detected}`,
        severity: "notable",
        detail: `Confidence — yours: ${mine.key.confidence}, reference: ${reference.key.confidence}. Low confidence scores (below ~0.6) mean the detection is less certain — treat as a starting point, not gospel.`,
        fix: "If you're chasing this reference's harmonic color specifically, consider transposing your progression to match. If you just like its mix/tone, the key difference doesn't matter at all.",
      })
    }
  }

  // --- Stereo width gap ---
  if (mine.stereo.overall_correlation !== null && reference.stereo.overall_correlation !== null) {
    const widthDiff = reference.stereo.overall_correlation - mine.stereo.overall_correlation
    if (Math.abs(widthDiff) > 0.2) {
      findings.push({
        id: "width-gap",
        label: `Stereo width gap: reference is ${widthDiff < 0 ? "wider" : "narrower"} than yours`,
        severity: "notable",
        detail: `Reference correlation: ${reference.stereo.overall_correlation.toFixed(2)} vs Yours: ${mine.stereo.overall_correlation.toFixed(2)}.`,
        fix: widthDiff < 0
          ? "Reference is more decorrelated/wide — check for double-tracking, wider stereo reverb sends, or M/S widening on your version."
          : "Reference is narrower/more mono-focused than yours — you may be over-widening; check for phase issues on translation.",
      })
    }
  }

  return findings
}

export function abSeverityRank(s: AbSeverity): number {
  return s === "priority" ? 0 : s === "notable" ? 1 : 2
}
