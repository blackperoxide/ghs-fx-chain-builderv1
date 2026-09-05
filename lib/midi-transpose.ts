// Standard MIDI File transposition — shifts every Note On/Note Off event's pitch
// byte by N semitones, clamped to the valid 0-127 range. Unlike audio, MIDI
// transposition is exact (just an integer add, no resampling/DSP) and every event
// stays exactly the same byte length, so this runs entirely client-side on the
// bytes we already have (no server round-trip, no new dependency) rather than
// going back through the Python pipeline.

function readVarLen(bytes: Uint8Array, offset: number): { value: number; nextOffset: number } {
  let value = 0
  let i = offset
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const byte = bytes[i]
    value = (value << 7) | (byte & 0x7f)
    i++
    if ((byte & 0x80) === 0) break
  }
  return { value, nextOffset: i }
}

export function transposeMidi(bytes: Uint8Array, semitones: number): Uint8Array {
  if (semitones === 0) return bytes

  const out = new Uint8Array(bytes) // work on a copy; every event keeps its byte length

  const header = String.fromCharCode(out[0], out[1], out[2], out[3])
  if (out.length < 14 || header !== "MThd") {
    throw new Error("Not a valid MIDI file (missing MThd header)")
  }

  const headerChunkLen = (out[4] << 24) | (out[5] << 16) | (out[6] << 8) | out[7]
  let offset = 8 + headerChunkLen

  while (offset + 8 <= out.length) {
    const chunkId = String.fromCharCode(out[offset], out[offset + 1], out[offset + 2], out[offset + 3])
    const chunkLen = (out[offset + 4] << 24) | (out[offset + 5] << 16) | (out[offset + 6] << 8) | out[offset + 7]
    const chunkStart = offset + 8
    const chunkEnd = chunkStart + chunkLen

    if (chunkId === "MTrk") {
      let pos = chunkStart
      let runningStatus = 0

      while (pos < chunkEnd) {
        const { nextOffset } = readVarLen(out, pos) // delta-time, value itself unused here
        pos = nextOffset

        let statusByte = out[pos]
        if (statusByte < 0x80) {
          // Running status: this byte is actually the first data byte, reuse the last status.
          statusByte = runningStatus
        } else {
          runningStatus = statusByte
          pos++
        }

        if (statusByte === 0xff) {
          // Meta event: FF <type> <varlen length> <data...>
          pos++ // skip meta type
          const { value: len, nextOffset: afterLen } = readVarLen(out, pos)
          pos = afterLen + len
          continue
        }
        if (statusByte === 0xf0 || statusByte === 0xf7) {
          // Sysex event: length-prefixed
          const { value: len, nextOffset: afterLen } = readVarLen(out, pos)
          pos = afterLen + len
          continue
        }

        const eventType = statusByte & 0xf0

        if (eventType === 0x80 || eventType === 0x90) {
          // Note off / Note on — 2 data bytes: note number, velocity
          out[pos] = Math.min(127, Math.max(0, out[pos] + semitones))
          pos += 2
        } else if (eventType === 0xa0 || eventType === 0xb0 || eventType === 0xe0) {
          pos += 2 // poly aftertouch / control change / pitch bend — no note pitch to shift
        } else if (eventType === 0xc0 || eventType === 0xd0) {
          pos += 1 // program change / channel aftertouch — single data byte
        } else {
          throw new Error("Unsupported MIDI event while transposing")
        }
      }
    }

    offset = chunkEnd
  }

  return out
}
