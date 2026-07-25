"""
Grand Healing Studio — Audio to MIDI Transcription (DSP core)
Wraps Spotify's open-source Basic Pitch model to transcribe an audio file (monophonic
or polyphonic) into a real MIDI file with actual note pitches, onsets, and durations.

Ported from scripts/transcribe_to_midi.py to run as an importable function inside the
FastAPI backend instead of a CLI subprocess.
"""

import sys
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


def transcribe(input_path: str, output_path: str) -> dict:
    # basic_pitch prints progress lines straight to stdout — redirect them to stderr
    # so this stays quiet for callers that care about clean logs.
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

    return {
        "note_count": len(note_events),
        "notes": notes_summary,
    }
