#!/usr/bin/env python3
"""
Grand Healing Studio — Audio Production Analyzer
Runs a top-level mixing/mastering-engineer-style diagnostic pass on an audio file:
LUFS loudness, true peak, dynamic range, spectral balance (muddiness / harshness /
wasted frequency space / air), bass content + mono compatibility, stereo width,
and musical key detection (Krumhansl-Schmuckler key-profile matching).

Usage: python3 analyze_audio.py <path_to_audio_file>
Outputs a single JSON object to stdout.
"""

import sys
import json
import numpy as np
import librosa
import pyloudnorm as pyln
import soundfile as sf

BANDS = [
    ("sub_bass", 20, 60),
    ("bass", 60, 250),
    ("low_mid", 250, 500),
    ("mid", 500, 2000),
    ("upper_mid", 2000, 4000),
    ("presence", 4000, 6000),
    ("brilliance", 6000, 10000),
    ("air", 10000, 16000),
]

PITCH_CLASSES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

# Krumhansl-Schmuckler key profiles — standard empirical weights for scale degrees
# relative to the tonic (index 0 = tonic), used for key-finding via chroma correlation.
MAJOR_PROFILE = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MINOR_PROFILE = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])

def detect_key(mono, sr):
    chroma = librosa.feature.chroma_cqt(y=mono, sr=sr)
    chroma_mean = np.mean(chroma, axis=1)
    if np.sum(chroma_mean) == 0:
        return None, 0.0
    chroma_mean = chroma_mean / np.sum(chroma_mean)

    best_score = -2.0
    best_key = None
    for tonic in range(12):
        maj_profile_rotated = np.roll(MAJOR_PROFILE, tonic)
        min_profile_rotated = np.roll(MINOR_PROFILE, tonic)
        maj_score = float(np.corrcoef(chroma_mean, maj_profile_rotated)[0, 1])
        min_score = float(np.corrcoef(chroma_mean, min_profile_rotated)[0, 1])
        if maj_score > best_score:
            best_score = maj_score
            best_key = f"{PITCH_CLASSES[tonic]} Major"
        if min_score > best_score:
            best_score = min_score
            best_key = f"{PITCH_CLASSES[tonic]} Minor"
    return best_key, round(best_score, 3)

def band_energy(freqs, mag_sq, lo, hi):
    mask = (freqs >= lo) & (freqs < hi)
    if not np.any(mask):
        return 0.0
    return float(np.sum(mag_sq[mask]))

def analyze(path):
    # Load at native sample rate, preserve stereo if present
    data, sr = sf.read(path, always_2d=True)
    data = data.astype(np.float64)
    n_channels = data.shape[1]
    mono = np.mean(data, axis=1)

    duration_sec = data.shape[0] / sr

    # --- Loudness (ITU-R BS.1770 via pyloudnorm) ---
    meter = pyln.Meter(sr)
    integrated_lufs = meter.integrated_loudness(data if n_channels > 1 else mono)

    # Short-term loudness (3s blocks) for loudness range approximation
    block_sec = 3.0
    hop_sec = 1.0
    block_samples = int(block_sec * sr)
    hop_samples = int(hop_sec * sr)
    short_term = []
    i = 0
    while i + block_samples <= data.shape[0]:
        chunk = data[i:i + block_samples]
        try:
            lufs = meter.integrated_loudness(chunk if n_channels > 1 else mono[i:i + block_samples])
            if np.isfinite(lufs):
                short_term.append(lufs)
        except Exception:
            pass
        i += hop_samples
    if short_term:
        lra = float(np.percentile(short_term, 95) - np.percentile(short_term, 10))
        max_short_term = float(np.max(short_term))
    else:
        lra = 0.0
        max_short_term = integrated_lufs

    # --- True peak (oversample 4x for inter-sample peak estimate) ---
    oversampled = librosa.resample(mono, orig_sr=sr, target_sr=sr * 4, res_type="soxr_hq") if len(mono) > 0 else mono
    true_peak_lin = float(np.max(np.abs(oversampled))) if len(oversampled) else 0.0
    true_peak_dbtp = 20 * np.log10(true_peak_lin) if true_peak_lin > 0 else -120.0

    sample_peak_lin = float(np.max(np.abs(mono))) if len(mono) else 0.0
    sample_peak_db = 20 * np.log10(sample_peak_lin) if sample_peak_lin > 0 else -120.0

    clip_count = int(np.sum(np.abs(mono) >= 0.999))

    # --- Dynamic range / crest factor ---
    rms = float(np.sqrt(np.mean(mono ** 2))) if len(mono) else 0.0
    rms_db = 20 * np.log10(rms) if rms > 0 else -120.0
    crest_factor_db = sample_peak_db - rms_db

    # --- Spectral analysis (average magnitude spectrum via STFT) ---
    n_fft = 8192
    hop_length = 2048
    stft = librosa.stft(mono, n_fft=n_fft, hop_length=hop_length)
    mag_sq = np.mean(np.abs(stft) ** 2, axis=1)
    freqs = librosa.fft_frequencies(sr=sr, n_fft=n_fft)

    total_energy = float(np.sum(mag_sq)) or 1e-12
    band_pct = {}
    for name, lo, hi in BANDS:
        e = band_energy(freqs, mag_sq, lo, hi)
        band_pct[name] = round(100 * e / total_energy, 2)

    spectral_centroid = float(np.mean(librosa.feature.spectral_centroid(y=mono, sr=sr, n_fft=n_fft, hop_length=hop_length)))

    # Harshness index: energy concentrated 2-5kHz relative to overall spectral energy
    harsh_e = band_energy(freqs, mag_sq, 2000, 5000)
    harshness_pct = round(100 * harsh_e / total_energy, 2)

    # Muddiness index: energy 200-500Hz relative to overall
    mud_e = band_energy(freqs, mag_sq, 200, 500)
    muddiness_pct = round(100 * mud_e / total_energy, 2)

    # Sibilance proxy: energy 5-9kHz
    sib_e = band_energy(freqs, mag_sq, 5000, 9000)
    sibilance_pct = round(100 * sib_e / total_energy, 2)

    # Air index: energy 10-16kHz relative to overall — openness/brightness at the very top
    air_e = band_energy(freqs, mag_sq, 10000, 16000)
    air_pct = round(100 * air_e / total_energy, 2)

    # --- Stereo width / correlation (if stereo) ---
    correlation = None
    low_end_correlation = None
    if n_channels >= 2:
        left = data[:, 0]
        right = data[:, 1]
        if np.std(left) > 0 and np.std(right) > 0:
            correlation = float(np.corrcoef(left, right)[0, 1])
        # Low end correlation below 150Hz — should be near-mono for club/vinyl/streaming translation
        from scipy.signal import butter, sosfilt
        sos_lp = butter(4, 150, btype="low", fs=sr, output="sos")
        left_lp = sosfilt(sos_lp, left)
        right_lp = sosfilt(sos_lp, right)
        if np.std(left_lp) > 0 and np.std(right_lp) > 0:
            low_end_correlation = float(np.corrcoef(left_lp, right_lp)[0, 1])

    # --- Tempo (best-effort, informational only) ---
    try:
        tempo, _ = librosa.beat.beat_track(y=mono, sr=sr)
        tempo_bpm = float(tempo) if np.isscalar(tempo) else float(tempo[0])
    except Exception:
        tempo_bpm = None

    # --- Musical key detection ---
    try:
        key_name, key_confidence = detect_key(mono, sr)
    except Exception:
        key_name, key_confidence = None, 0.0

    return {
        "duration_sec": round(duration_sec, 2),
        "sample_rate": sr,
        "channels": n_channels,
        "loudness": {
            "integrated_lufs": round(float(integrated_lufs), 2) if np.isfinite(integrated_lufs) else None,
            "loudness_range_lu": round(lra, 2),
            "max_short_term_lufs": round(max_short_term, 2) if np.isfinite(max_short_term) else None,
        },
        "peaks": {
            "true_peak_dbtp": round(true_peak_dbtp, 2),
            "sample_peak_db": round(sample_peak_db, 2),
            "clipped_samples": clip_count,
        },
        "dynamics": {
            "rms_db": round(rms_db, 2),
            "crest_factor_db": round(crest_factor_db, 2),
        },
        "spectral_balance_pct": band_pct,
        "spectral_centroid_hz": round(spectral_centroid, 1),
        "problem_indices": {
            "harshness_pct_2_5k": harshness_pct,
            "muddiness_pct_200_500": muddiness_pct,
            "sibilance_pct_5_9k": sibilance_pct,
            "air_pct_10_16k": air_pct,
        },
        "stereo": {
            "overall_correlation": round(correlation, 3) if correlation is not None else None,
            "low_end_correlation_below_150hz": round(low_end_correlation, 3) if low_end_correlation is not None else None,
        },
        "tempo_estimate_bpm": round(tempo_bpm, 1) if tempo_bpm else None,
        "key": {
            "detected": key_name,
            "confidence": key_confidence,
        },
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
    try:
        result = analyze(sys.argv[1])
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
