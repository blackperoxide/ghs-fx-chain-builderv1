#!/usr/bin/env python3
"""
Grand Healing Studio — Audio Transposer
Pitch-shifts an uploaded audio file by N semitones via librosa's phase-vocoder
pitch_shift (duration/tempo unchanged - this is a pitch shift, not a speed
change). Ties into the Audio Production Analyzer's key detection: the front
end shows the resulting key name for a given shift before you commit to it.

Usage: python3 transpose_audio.py <input_path> <output_path> <semitones>
Writes the shifted audio to output_path (WAV) and a JSON summary to stdout.
"""

import sys
import json
import numpy as np
import librosa
import soundfile as sf


def transpose(input_path, output_path, semitones):
    data, sr = sf.read(input_path, always_2d=True)
    data = data.astype(np.float64)
    n_channels = data.shape[1]

    shifted_channels = [
        librosa.effects.pitch_shift(np.ascontiguousarray(data[:, ch]), sr=sr, n_steps=semitones)
        for ch in range(n_channels)
    ]

    # pitch_shift can return a slightly different length per channel in edge
    # cases - trim to the shortest so the written file stays valid multi-channel.
    min_len = min(len(c) for c in shifted_channels)
    out = np.stack([c[:min_len] for c in shifted_channels], axis=1)

    sf.write(output_path, out, sr)

    return {
        "sample_rate": sr,
        "channels": n_channels,
        "duration_sec": round(min_len / sr, 2),
        "semitones": semitones,
    }


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print(json.dumps({"error": "Usage: transpose_audio.py <input> <output> <semitones>"}))
        sys.exit(1)
    try:
        result = transpose(sys.argv[1], sys.argv[2], float(sys.argv[3]))
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
