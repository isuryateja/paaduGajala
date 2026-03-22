# Frequency Mapped Notations

This file shows the current frequency mapping used in this repo for the 12 pitch positions in the **madhya sthayi** (middle octave).

- Base `S` (Sa) = `261.63 Hz`
- Tuning used here = equal temperament
- Source aligned with: `svara_frequencies.js`

## Accuracy

These frequencies are accurate for the way this repo currently calculates pitch:

- `S` is treated as `261.625565... Hz` and rounded to `261.63 Hz`
- The remaining notes are derived using 12-tone equal temperament
- So for this app and its current code, the values are correct

But for Carnatic music in a stricter musical sense, these are still approximations:

- Carnatic music does not always use equal temperament
- The actual frequency depends on the chosen `Sa`
- Some Carnatic notations share the same equal-temperament pitch here, such as `R2 = G1` and `D2 = N1`
- If you switch to just intonation or another shruti basis, the values will change

So the practical meaning is:

- Accurate for this repo's current implementation
- Approximate for real-world Carnatic intonation

## 12 Frequency Mappings

| Sthana | Notation | Frequency (Hz) | Western Note |
|--------|----------|----------------|--------------|
| 1 | S | 261.63 | C4 |
| 2 | R1 | 277.18 | C#4 / Db4 |
| 3 | R2, G1 | 293.66 | D4 |
| 4 | R3, G2 | 311.13 | D#4 / Eb4 |
| 5 | G3 | 329.63 | E4 |
| 6 | M1 | 349.23 | F4 |
| 7 | M2 | 369.99 | F#4 / Gb4 |
| 8 | P | 392.00 | G4 |
| 9 | D1 | 415.30 | G#4 / Ab4 |
| 10 | D2, N1 | 440.00 | A4 |
| 11 | D3, N2 | 466.16 | A#4 / Bb4 |
| 12 | N3 | 493.88 | B4 |

## Quick Lookup

| Notation | Frequency (Hz) |
|----------|----------------|
| S | 261.63 |
| R1 | 277.18 |
| R2 | 293.66 |
| G1 | 293.66 |
| R3 | 311.13 |
| G2 | 311.13 |
| G3 | 329.63 |
| M1 | 349.23 |
| M2 | 369.99 |
| P | 392.00 |
| D1 | 415.30 |
| D2 | 440.00 |
| N1 | 440.00 |
| D3 | 466.16 |
| N2 | 466.16 |
| N3 | 493.88 |

## Notes

- `R2` and `G1` share the same frequency.
- `R3` and `G2` share the same frequency.
- `D2` and `N1` share the same frequency.
- `D3` and `N2` share the same frequency.
- Lower octave uses `.` such as `S.`
- Higher octave uses `'` such as `S'`
