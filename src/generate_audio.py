import numpy as np
from scipy.io import wavfile
import subprocess
import os

SAMPLE_RATE = 44100
DURATION = 21.5  # seconds
TOTAL_SAMPLES = int(SAMPLE_RATE * DURATION)

# 124 BPM -> 1 beat = 60 / 124 ≈ 0.48387s
BPM = 124.0
BEAT_DUR = 60.0 / BPM
SIXTEENTH = BEAT_DUR / 4.0

def generate_kick():
    dur = 0.25
    n = int(SAMPLE_RATE * dur)
    t = np.linspace(0, dur, n)
    # Pitch drop 150Hz to 40Hz
    freq = 40 + (160 - 40) * np.exp(-t * 28)
    phase = 2 * np.pi * np.cumsum(freq) / SAMPLE_RATE
    env = np.exp(-t * 14)
    # Click transient
    click = np.random.uniform(-1, 1, n) * np.exp(-t * 120) * 0.4
    kick = np.sin(phase) * env + click
    return kick / np.max(np.abs(kick) + 1e-6)

def generate_snare():
    dur = 0.22
    n = int(SAMPLE_RATE * dur)
    t = np.linspace(0, dur, n)
    tone = np.sin(2 * np.pi * 180 * t) * np.exp(-t * 25) * 0.4
    noise = np.random.uniform(-1, 1, n) * np.exp(-t * 16) * 0.7
    snare = tone + noise
    return snare / np.max(np.abs(snare) + 1e-6)

def generate_hihat(open_hh=False):
    dur = 0.18 if open_hh else 0.05
    n = int(SAMPLE_RATE * dur)
    t = np.linspace(0, dur, n)
    decay = 18 if open_hh else 70
    noise = np.random.uniform(-1, 1, n) * np.exp(-t * decay)
    return noise / np.max(np.abs(noise) + 1e-6)

def generate_pluck(freq, dur=0.3):
    n = int(SAMPLE_RATE * dur)
    t = np.linspace(0, dur, n)
    env = np.exp(-t * 12)
    tone = (np.sin(2 * np.pi * freq * t) +
            0.5 * np.sin(2 * np.pi * freq * 2 * t) +
            0.25 * np.sin(2 * np.pi * freq * 3 * t)) * env
    return tone

def generate_bass(freq, dur):
    n = int(SAMPLE_RATE * dur)
    t = np.linspace(0, dur, n)
    env = np.minimum(1.0, t * 100) * np.exp(-t * 1.5)
    # rich filtered saw/pulse approximation
    tone = (np.sin(2 * np.pi * freq * t) + 
            0.6 * np.sin(2 * np.pi * freq * 2 * t) + 
            0.3 * np.sin(2 * np.pi * freq * 3 * t)) * env
    return tone

def generate_whoosh(dur=0.6, reverse=False):
    n = int(SAMPLE_RATE * dur)
    t = np.linspace(0, dur, n)
    noise = np.random.uniform(-1, 1, n)
    if reverse:
        env = (t / dur) ** 2
        f_center = 200 + 3500 * (t / dur)
    else:
        env = (1 - t / dur) ** 1.8
        f_center = 3500 * (1 - t / dur) + 200
    
    # modulated sweep
    sweep = noise * np.sin(2 * np.pi * f_center * t) * env
    return sweep / (np.max(np.abs(sweep)) + 1e-6)

def generate_ding(freq=1760, dur=0.8):
    n = int(SAMPLE_RATE * dur)
    t = np.linspace(0, dur, n)
    env = np.exp(-t * 5.5)
    bell = (np.sin(2 * np.pi * freq * t) * 0.7 +
            np.sin(2 * np.pi * freq * 2.05 * t) * 0.3 +
            np.sin(2 * np.pi * freq * 3.02 * t) * 0.15) * env
    return bell / (np.max(np.abs(bell)) + 1e-6)

def generate_tick(dur=0.04):
    n = int(SAMPLE_RATE * dur)
    t = np.linspace(0, dur, n)
    tone = np.sin(2 * np.pi * 3200 * t) * np.exp(-t * 90)
    return tone

print("Synthesizing beat and instruments...")
left = np.zeros(TOTAL_SAMPLES, dtype=np.float32)
right = np.zeros(TOTAL_SAMPLES, dtype=np.float32)

kick_sample = generate_kick() * 0.85
snare_sample = generate_snare() * 0.65
ch_sample = generate_hihat(False) * 0.28
oh_sample = generate_hihat(True) * 0.35

# Build drums & bass groove
total_beats = int(DURATION / BEAT_DUR)

# Chord progression in D minor: Dm - F - C - Bb
# Frequencies
notes = {
    'D2': 73.42, 'F2': 87.31, 'C2': 65.41, 'Bb1': 58.27,
    'D3': 146.83, 'F3': 174.61, 'A3': 220.0, 'C4': 261.63,
    'E4': 329.63, 'F4': 349.23, 'G4': 392.0, 'A4': 440.0, 'D5': 587.33
}

bass_pattern = ['D2', 'D2', 'F2', 'F2', 'C2', 'C2', 'Bb1', 'Bb1']
arpeggios = [
    ['D4', 'F4', 'A4', 'D5', 'A4', 'F4', 'D4', 'A4'],
    ['F3', 'A3', 'C4', 'F4', 'C4', 'A3', 'F3', 'C4'],
    ['C3', 'E4', 'G4', 'C4', 'G4', 'E4', 'C4', 'G4'],
    ['Bb1', 'D4', 'F4', 'Bb1', 'F4', 'D4', 'F4', 'D4']
]

for b in range(total_beats):
    t_beat = b * BEAT_DUR
    idx = int(t_beat * SAMPLE_RATE)
    
    # 4-on-the-floor kick
    k_len = min(len(kick_sample), TOTAL_SAMPLES - idx)
    if k_len > 0:
        left[idx:idx+k_len] += kick_sample[:k_len]
        right[idx:idx+k_len] += kick_sample[:k_len]
        
    # Snare on beats 2 and 4 (0-indexed: 1 and 3)
    if b % 2 == 1:
        s_len = min(len(snare_sample), TOTAL_SAMPLES - idx)
        if s_len > 0:
            left[idx:idx+s_len] += snare_sample[:s_len]
            right[idx:idx+s_len] += snare_sample[:s_len]
            
    # Hi-hats every 16th note
    for sub in range(4):
        sub_idx = int((t_beat + sub * SIXTEENTH) * SAMPLE_RATE)
        if sub_idx < TOTAL_SAMPLES:
            hh = oh_sample if sub == 2 else ch_sample
            hh_len = min(len(hh), TOTAL_SAMPLES - sub_idx)
            left[sub_idx:sub_idx+hh_len] += hh[:hh_len] * 0.9
            right[sub_idx:sub_idx+hh_len] += hh[:hh_len] * 1.1

    # Bassline
    measure = (b // 4) % len(bass_pattern)
    bass_note = bass_pattern[measure]
    if b % 2 == 0:
        b_sample = generate_bass(notes[bass_note], BEAT_DUR * 1.8) * 0.55
        b_len = min(len(b_sample), TOTAL_SAMPLES - idx)
        if b_len > 0:
            left[idx:idx+b_len] += b_sample[:b_len]
            right[idx:idx+b_len] += b_sample[:b_len]
            
    # Melodic Arp Pluck on every 16th note
    arp_chord = arpeggios[(b // 4) % len(arpeggios)]
    for sub in range(4):
        p_note = arp_chord[(b * 4 + sub) % len(arp_chord)]
        if p_note in notes:
            p_sample = generate_pluck(notes[p_note], 0.25) * 0.22
            p_idx = int((t_beat + sub * SIXTEENTH) * SAMPLE_RATE)
            p_len = min(len(p_sample), TOTAL_SAMPLES - p_idx)
            if p_len > 0:
                # Ping-pong stereo
                pan = 0.5 + 0.3 * np.sin(b + sub)
                left[p_idx:p_idx+p_len] += p_sample[:p_len] * (1 - pan)
                right[p_idx:p_idx+p_len] += p_sample[:p_len] * pan

# Add Sound Effects (Whoosh, Ding, Ticks)
# Scene transitions at t = 0.0, 4.2, 8.4, 12.6, 16.8
transitions = [0.0, 4.2, 8.4, 12.6, 16.8]
for t_sec in transitions:
    idx = int(t_sec * SAMPLE_RATE)
    w = generate_whoosh(0.55) * 0.55
    w_len = min(len(w), TOTAL_SAMPLES - idx)
    if w_len > 0:
        left[idx:idx+w_len] += w[:w_len] * 0.7
        right[idx:idx+w_len] += w[:w_len] * 0.9

# Dings when product discounts pop in
dings = [1.2, 5.2, 9.4, 13.6, 17.6]
for t_sec in dings:
    idx = int(t_sec * SAMPLE_RATE)
    d = generate_ding(1760 if t_sec < 17 else 2200, 0.7) * 0.6
    d_len = min(len(d), TOTAL_SAMPLES - idx)
    if d_len > 0:
        left[idx:idx+d_len] += d[:d_len]
        right[idx:idx+d_len] += d[:d_len]

# Countdown ticks in scene 1 (1.0, 2.0, 3.0)
for t_sec in [1.0, 2.0, 3.0]:
    idx = int(t_sec * SAMPLE_RATE)
    tk = generate_tick() * 0.5
    tk_len = min(len(tk), TOTAL_SAMPLES - idx)
    if tk_len > 0:
        left[idx:idx+tk_len] += tk[:tk_len]
        right[idx:idx+tk_len] += tk[:tk_len]

# Fade out music slightly at the very end
fade_samples = int(SAMPLE_RATE * 1.5)
fade = np.linspace(1.0, 0.0, fade_samples)
left[-fade_samples:] *= fade
right[-fade_samples:] *= fade

# Normalize music
max_val = max(np.max(np.abs(left)), np.max(np.abs(right)))
if max_val > 0:
    left = (left / max_val) * 0.42
    right = (right / max_val) * 0.42

music_stereo = np.column_stack((left, right))
music_path = '/home/antigravity/parhamamirpoor13860-hub/video/audio/bg_music.wav'
wavfile.write(music_path, SAMPLE_RATE, (music_stereo * 32767).astype(np.int16))
print(f"Background music saved to {music_path}")

# Now mix voiceover segments on top of music bed using ffmpeg
# Scene 1: t=0.5
# Scene 2: t=4.3
# Scene 3: t=8.5
# Scene 4: t=12.7
# Scene 5: t=16.9

filter_complex = """
[0:a]volume=0.6[bg];
[1:a]adelay=500|500,volume=1.4[v1];
[2:a]adelay=4300|4300,volume=1.4[v2];
[3:a]adelay=8500|8500,volume=1.4[v3];
[4:a]adelay=12700|12700,volume=1.4[v4];
[5:a]adelay=16900|16900,volume=1.4[v5];
[bg][v1][v2][v3][v4][v5]amix=inputs=6:duration=first:dropout_transition=2,volume=1.3[out]
"""

cmd = [
    'ffmpeg', '-y',
    '-i', music_path,
    '-i', '/home/antigravity/parhamamirpoor13860-hub/video/audio/scene1.wav',
    '-i', '/home/antigravity/parhamamirpoor13860-hub/video/audio/scene2.wav',
    '-i', '/home/antigravity/parhamamirpoor13860-hub/video/audio/scene3.wav',
    '-i', '/home/antigravity/parhamamirpoor13860-hub/video/audio/scene4.wav',
    '-i', '/home/antigravity/parhamamirpoor13860-hub/video/audio/scene5.wav',
    '-filter_complex', filter_complex,
    '-map', '[out]',
    '-t', str(DURATION),
    '-c:a', 'aac', '-b:a', '192k',
    '/home/antigravity/parhamamirpoor13860-hub/video/audio/master_audio.aac'
]

print("Mixing final master audio track...")
subprocess.run(cmd, check=True)
print("Master audio created successfully at /home/antigravity/parhamamirpoor13860-hub/video/audio/master_audio.aac!")
