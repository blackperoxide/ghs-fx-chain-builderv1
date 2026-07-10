#!/usr/bin/env python3
"""
Grand Healing Studio — Audio to MIDI Transcription
Wraps Spotify's open-source Basic Pitch model to transcribe an audio file (monophonic
or polyphonic) into a real MIDI file with actual note pitches, onsets, and durations —
for handing to other musicians, sequencing into Siren/DrumGPT, or reading as a reference.

Usage: python3 transcribe_to_midi.py <input_audio> <output_midi_path>
Outputs a JSON summary to stdout; writes the .mid file to the given output path.
"""

import sys
import io
import json
import contextlib
import warnings
warnings.filterwarnings("ignore")

from basic_pitch.inference import predict
from basic_pitch import ICASSP_2022_MODEL_PATH

NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

def midi_to_name(pitch):
    octave = pitch // 12 - 1
    name = NOTE_NAMES[pitch % 12]
    return f"{name}{octave}"

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: transcribe_to_midi.py <input_audio> <output_midi_path>"}))
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    try:
        # basic_pitch prints progress lines straight to stdout — redirect them to stderr
        # so this script's stdout stays clean, valid JSON for the caller to parse.
        with contextlib.redirect_stdout(sys.stderr):
            model_output, midi_data, note_events = predict(input_path, ICASSP_2022_MODEL_PATH)
        midi_data.write(output_path)

        notes_summary = []
        for start, end, pitch, confidence, _ in sorted(note_events, key=lambda n: n[0])[:200]:
            notes_summary.append({
                "start_sec": round(float(start), 3),
                "end_sec": round(float(end), 3),
                "pitch_midi": int(pitch),
                "note_name": midi_to_name(int(pitch)),
                "confidence": round(float(confidence), 3),
            })

        print(json.dumps({
            "note_count": len(note_events),
            "notes": notes_summary,
            "midi_written_to": output_path,
        }))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
