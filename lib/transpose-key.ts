const PITCH_CLASSES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

// Ties transpose into the analyzer's own key detection: given e.g. "C Major"
// and +3 semitones, returns "D# Major" - what the file will actually be in
// after the shift, shown before the user commits to a download.
export function shiftKeyName(detectedKey: string | null | undefined, semitones: number): string | null {
  if (!detectedKey) return null

  const spaceIndex = detectedKey.indexOf(" ")
  if (spaceIndex === -1) return null

  const pitch = detectedKey.slice(0, spaceIndex)
  const mode = detectedKey.slice(spaceIndex + 1)

  const index = PITCH_CLASSES.indexOf(pitch)
  if (index === -1) return null

  const shiftedIndex = ((index + Math.round(semitones)) % 12 + 12) % 12
  return `${PITCH_CLASSES[shiftedIndex]} ${mode}`
}
