// Client-side, real-time key detection from microphone input using the same
// Krumhansl-Schmuckler key-profile matching as the file analyzer — just computed
// from a live FFT chroma estimate instead of librosa. No network round-trip, so it
// works live, on stage, on a phone, with no DAW required.

export const PITCH_CLASSES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]

function rotate(arr: number[], n: number): number[] {
  const len = arr.length
  return arr.map((_, i) => arr[(((i - n) % len) + len) % len])
}

function correlate(a: number[], b: number[]): number {
  const n = a.length
  const meanA = a.reduce((s, v) => s + v, 0) / n
  const meanB = b.reduce((s, v) => s + v, 0) / n
  let num = 0
  let denomA = 0
  let denomB = 0
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA
    const db = b[i] - meanB
    num += da * db
    denomA += da * da
    denomB += db * db
  }
  const denom = Math.sqrt(denomA * denomB)
  return denom === 0 ? 0 : num / denom
}

export function freqToPitchClass(freq: number): number {
  // A4 = 440Hz = MIDI note 69
  const midi = 69 + 12 * Math.log2(freq / 440)
  const pc = Math.round(midi) % 12
  return pc < 0 ? pc + 12 : pc
}

/** Accumulate a chroma vector from an FFT magnitude array. */
export function accumulateChroma(chroma: Float32Array, freqData: Float32Array, sampleRate: number, fftSize: number) {
  const binHz = sampleRate / fftSize
  for (let bin = 1; bin < freqData.length; bin++) {
    const freq = bin * binHz
    if (freq < 55 || freq > 5000) continue // guitar/vocal-relevant range, skip DC and ultra-high noise
    const magDb = freqData[bin] // getFloatFrequencyData returns dB, typically negative
    const mag = Math.pow(10, magDb / 20)
    if (!isFinite(mag) || mag <= 0) continue
    const pc = freqToPitchClass(freq)
    chroma[pc] += mag
  }
}

export interface KeyGuess {
  key: string
  confidence: number
}

export function estimateKeyFromChroma(chroma: number[]): KeyGuess {
  const total = chroma.reduce((s, v) => s + v, 0)
  if (total <= 0) return { key: "—", confidence: 0 }
  const normalized = chroma.map((v) => v / total)

  let bestScore = -2
  let bestKey = "—"
  for (let tonic = 0; tonic < 12; tonic++) {
    const majProfile = rotate(MAJOR_PROFILE, tonic)
    const minProfile = rotate(MINOR_PROFILE, tonic)
    const majScore = correlate(normalized, majProfile)
    const minScore = correlate(normalized, minProfile)
    if (majScore > bestScore) {
      bestScore = majScore
      bestKey = `${PITCH_CLASSES[tonic]} Major`
    }
    if (minScore > bestScore) {
      bestScore = minScore
      bestKey = `${PITCH_CLASSES[tonic]} Minor`
    }
  }
  return { key: bestKey, confidence: Math.round(bestScore * 1000) / 1000 }
}
