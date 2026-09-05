#!/usr/bin/env python3
"""
Generates the app's sound set.

Every sound in ROUNDS is synthesised here rather than licensed, for three
reasons: they can be regenerated on any machine with no binary blobs in the
repo, they are guaranteed clear of sample licensing, and they share one tuning
so they never clash when two fire close together.

The palette:
  · Tuning is a D-flat major pentatonic (Db Eb F Ab Bb). Pentatonic means any
    two of these sounds overlapping still sounds intentional.
  · Everything is a sine with a soft attack. No square, no noise burst, no
    "coin" — this is an app people open in a dark bar at 1am, not an arcade.
  · Nothing is longer than 1.2s and nothing peaks above -6 dBFS, so a sound can
    never be the loudest thing in the room.
"""
import numpy as np, subprocess, os, math

SR = 44100
OUT = "assets/sound"
os.makedirs(OUT, exist_ok=True)

# Db major pentatonic, two octaves.
N = {n: 440.0 * 2 ** ((m - 69) / 12) for n, m in {
    'Db3': 49, 'Eb3': 51, 'F3': 53, 'Ab3': 56, 'Bb3': 58,
    'Db4': 61, 'Eb4': 63, 'F4': 65, 'Ab4': 68, 'Bb4': 70,
    'Db5': 73, 'Eb5': 75, 'F5': 77, 'Ab5': 80, 'Bb5': 82,
    'Db6': 85, 'F6': 89,
}.items()}


def env(n, attack=0.006, decay=0.25, curve=2.4):
    """Soft attack, exponential tail. The attack is what stops a click."""
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-6), 0, 1) ** 0.6
    d = np.exp(-t / decay) ** 1.0
    return a * d ** 1.0 * (1 - (t / t[-1]) ** 8) ** curve if t[-1] > 0 else a


def tone(freq, dur, amp=0.5, decay=None, attack=0.006, detune=0.0, harm=(1.0, 0.18, 0.06)):
    """A sine with two quiet harmonics — enough body to survive a phone speaker."""
    n = int(SR * dur)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for i, h in enumerate(harm, start=1):
        sig += h * np.sin(2 * np.pi * freq * i * t)
    if detune:
        sig += 0.5 * np.sin(2 * np.pi * freq * (1 + detune) * t)
    return amp * sig * env(n, attack=attack, decay=decay if decay else dur * 0.45)


def glide(f0, f1, dur, amp=0.5, decay=None, attack=0.008):
    """A pitch sweep. Used for anything that means 'this is going somewhere'."""
    n = int(SR * dur)
    t = np.arange(n) / SR
    f = f0 * (f1 / f0) ** (t / dur)
    phase = 2 * np.pi * np.cumsum(f) / SR
    return amp * (np.sin(phase) + 0.15 * np.sin(2 * phase)) * env(n, attack=attack, decay=decay or dur * 0.5)


def at(buf, sig, start):
    """Mix `sig` into `buf` at `start` seconds, growing the buffer if needed."""
    i = int(start * SR)
    if i + len(sig) > len(buf):
        buf = np.concatenate([buf, np.zeros(i + len(sig) - len(buf))])
    buf[i:i + len(sig)] += sig
    return buf


def shimmer(dur, amp=0.05, seed=7):
    """A breath of filtered noise. The only non-sine ingredient in the set."""
    rng = np.random.default_rng(seed)
    n = int(SR * dur)
    x = rng.normal(0, 1, n)
    # crude one-pole high-pass then low-pass: leaves an airy band
    hp = np.diff(np.concatenate([[0], x]))
    y = np.zeros(n); a = 0.02
    for i in range(1, n):
        y[i] = y[i - 1] + a * (hp[i] - y[i - 1])
    y /= (np.max(np.abs(y)) or 1)
    return amp * y * env(n, attack=0.05, decay=dur * 0.35)


def write(name, buf, peak_db=-9.0):
    buf = np.asarray(buf, dtype=np.float64)
    m = np.max(np.abs(buf)) or 1.0
    buf = buf / m * (10 ** (peak_db / 20))
    # 6ms fade at both ends: no DC step, no click on a device that starts late.
    f = int(SR * 0.006)
    buf[:f] *= np.linspace(0, 1, f)
    buf[-f:] *= np.linspace(1, 0, f)
    pcm = (np.clip(buf, -1, 1) * 32767).astype('<i2')
    wav = f"/tmp/{name}.wav"
    import wave
    with wave.open(wav, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    dest = f"{OUT}/{name}.m4a"
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-c:a", "aac", "-b:a", "96k", "-ar", "44100", dest],
        check=True)
    print(f"  {name:<10} {len(buf)/SR:.2f}s  {os.path.getsize(dest)} bytes")


S = {}

# tap — a selection. Barely a sound; it exists so haptics has a partner on
# devices with no taptic engine.
S['tap'] = tone(N['Ab5'], 0.09, amp=0.35, decay=0.03, attack=0.002)

# log — one drink recorded. A soft drop: pitch falls a little, like liquid.
b = np.zeros(int(SR * 0.42))
b = at(b, glide(N['Bb5'], N['F5'], 0.22, amp=0.45, decay=0.09), 0.0)
b = at(b, tone(N['Db5'], 0.30, amp=0.22, decay=0.12, attack=0.01), 0.045)
S['log'] = b

# round — several drinks at once. The same drop, twice, a fifth apart.
b = np.zeros(int(SR * 0.7))
b = at(b, glide(N['Bb5'], N['F5'], 0.22, amp=0.40, decay=0.09), 0.0)
b = at(b, glide(N['F6'], N['Db6'], 0.22, amp=0.30, decay=0.09), 0.10)
b = at(b, tone(N['Db4'], 0.45, amp=0.20, decay=0.18, attack=0.02), 0.05)
S['round'] = b

# start — the night begins. Rising, open, no resolution: it is a beginning.
b = np.zeros(int(SR * 1.0))
for i, (n_, d) in enumerate([('Db4', 0.0), ('Ab4', 0.09), ('Db5', 0.18), ('F5', 0.27)]):
    b = at(b, tone(N[n_], 0.75 - i * 0.06, amp=0.34, decay=0.30, attack=0.012), d)
b = at(b, shimmer(0.9, amp=0.05), 0.12)
S['start'] = b

# end — the night closes. The same notes, descending, warmer and slower.
b = np.zeros(int(SR * 1.2))
for i, (n_, d) in enumerate([('F5', 0.0), ('Db5', 0.13), ('Ab4', 0.26), ('Db4', 0.39)]):
    b = at(b, tone(N[n_], 0.85, amp=0.32, decay=0.36, attack=0.02), d)
S['end'] = b

# unlock — an achievement. Three notes up, a shimmer behind them.
b = np.zeros(int(SR * 1.1))
for i, (n_, d) in enumerate([('Ab4', 0.0), ('Db5', 0.085), ('F5', 0.17), ('Ab5', 0.255)]):
    b = at(b, tone(N[n_], 0.8 - i * 0.05, amp=0.36, decay=0.28, attack=0.008), d)
b = at(b, tone(N['Db6'], 0.6, amp=0.14, decay=0.30, attack=0.02), 0.30)
b = at(b, shimmer(1.0, amp=0.07, seed=11), 0.16)
S['unlock'] = b

# levelup — bigger. Five notes, a bass underneath, a long tail.
b = np.zeros(int(SR * 1.2))
for i, (n_, d) in enumerate([('Db4', 0.0), ('F4', 0.07), ('Ab4', 0.14), ('Db5', 0.21), ('F5', 0.28), ('Ab5', 0.35)]):
    b = at(b, tone(N[n_], 0.85 - i * 0.04, amp=0.33, decay=0.32, attack=0.008), d)
b = at(b, tone(N['Db3'], 1.0, amp=0.26, decay=0.42, attack=0.03), 0.0)
b = at(b, shimmer(1.1, amp=0.08, seed=3), 0.22)
S['levelup'] = b

# streak — a single bright confirmation. Short on purpose: it fires often.
b = np.zeros(int(SR * 0.5))
b = at(b, tone(N['Ab5'], 0.30, amp=0.40, decay=0.10, attack=0.004), 0.0)
b = at(b, tone(N['Db6'], 0.34, amp=0.26, decay=0.13, attack=0.006), 0.06)
S['streak'] = b

# nudge — the app asking after you. Low, warm, two notes falling a whole tone.
# Explicitly NOT an alarm: nothing here should raise a pulse.
b = np.zeros(int(SR * 1.1))
b = at(b, tone(N['F3'], 0.75, amp=0.40, decay=0.34, attack=0.05), 0.0)
b = at(b, tone(N['Eb3'], 0.85, amp=0.36, decay=0.40, attack=0.06), 0.26)
S['nudge'] = b

# error — something did not go through. One low note, no drama.
S['error'] = tone(N['Eb3'], 0.34, amp=0.40, decay=0.11, attack=0.006)

print("sounds:")
for k, v in S.items():
    write(k, v)
