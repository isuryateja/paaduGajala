# Quick Start: English Notation

**Feature**: Convert to English Notation  
**Date**: 2026-03-19

## Notation Reference

### Svara Names

| Position | Notation | Full Name | Western |
|----------|----------|-----------|---------|
| 1 | **S** | Shadjam | C |
| 2 | **R1** | Shuddha Rishabham | C# |
| 3 | **R2** | Chatusruti Rishabham | D |
| 3 | **G1** | Shuddha Gandharam | D |
| 4 | **R3** | Shatshruti Rishabham | D# |
| 4 | **G2** | Sadharana Gandharam | D# |
| 5 | **G3** | Antara Gandharam | E |
| 6 | **M1** | Shuddha Madhyamam | F |
| 7 | **M2** | Prati Madhyamam | F# |
| 8 | **P** | Panchamam | G |
| 9 | **D1** | Shuddha Dhaivatam | G# |
| 10 | **D2** | Chatusruti Dhaivatam | A |
| 10 | **N1** | Shuddha Nishadham | A |
| 11 | **D3** | Shatshruti Dhaivatam | A# |
| 11 | **N2** | Kaisiki Nishadham | A# |
| 12 | **N3** | Kakali Nishadham | B |

### Octave Indicators

| Octave | Suffix | Example |
|--------|--------|---------|
| Mandra (lower) | `.` | `S.`, `R1.`, `M1.` |
| Madhya (middle) | none | `S`, `R1`, `M1` |
| Taara (higher) | `'` | `S'`, `R1'`, `M1'` |

### Rhythm Markers

| Marker | Name | Usage |
|--------|------|-------|
| `\|` | Single danda | Beat separator |
| `\|\|` | Double danda | End of phrase |

## Examples

### Basic Sarali Varisai

**Input**:
```
S R1 G1 M1 | P D1 N1 S' ||
```

**Meaning**:
- Play S, R1, G1, M1 (first beat group)
- Play P, D1, N1, S' (second beat group)
- S' is Shadjam in higher octave

### With Lower Octave

**Input**:
```
S. S. M1 M1 | R1. R1. | G1 G1 ||
```

**Meaning**:
- Play S., S., M1, M1 (S. is lower octave)
- Play R1., R1. (R1. is lower octave)
- Play G1, G1 (middle octave)

### Full Scale (Arohana)

**Input**:
```
S R1 G1 M1 P D1 N1 S' ||
```

### With All Variations

**Input**:
```
S R1 R2 G2 G3 M1 M2 P D1 D2 N2 N3 S' ||
```

## Migration from Telugu

| Old (Telugu) | New (English) |
|--------------|---------------|
| స | S |
| రి (shuddha) | R1 |
| రి (chatusruti) | R2 |
| గ (shuddha) | G1 |
| రి (shatshruti) | R3 |
| గ (sadharana) | G2 |
| గ (antara) | G3 |
| మ (shuddha) | M1 |
| మ (prati) | M2 |
| ప | P |
| ధ (shuddha) | D1 |
| ధ (chatusruti) | D2 |
| ని (shuddha) | N1 |
| ధ (shatshruti) | D3 |
| ని (kaisiki) | N2 |
| ని (kakali) | N3 |

## Case Sensitivity

The parser accepts **both uppercase and lowercase**:

```
S R1 G1   ✓ Valid
s r1 g1   ✓ Valid (converted to uppercase)
S r1 G1   ✓ Valid (mixed case works)
```

## Equivalent Svaras

These pairs are the same pitch:

- **R2** = **G1** (Chatusruti Rishabham = Shuddha Gandharam)
- **R3** = **G2** (Shatshruti Rishabham = Sadharana Gandharam)
- **D2** = **N1** (Chatusruti Dhaivatam = Shuddha Nishadham)
- **D3** = **N2** (Shatshruti Dhaivatam = Kaisiki Nishadham)

Both notations are accepted. Use whichever your tradition prefers.

## Common Patterns

### Sarali Varisai (Basic Exercises)

```
# Pattern 1: Ascending
S R1 G1 M1 | P D1 N1 S' ||

# Pattern 2: Descending
S' N1 D1 P | M1 G1 R1 S ||

# Pattern 3: Alternating
S S M1 M1 | R1 R1 G1 G1 ||
```

### Janta Varisai (Double Notes)

```
S S | R1 R1 | G1 G1 | M1 M1 ||
P P | D1 D1 | N1 N1 | S' S' ||
```

### Dhatu Varisai (Jumping Notes)

```
S G1 | R1 M1 | G1 P | M1 D1 ||
```

## Keyboard Shortcuts

The virtual piano supports keyboard input:

**Lower Octave (Octave 1)**:
- `A` = S
- `W` = R1 (black key)
- `S` = R
- `E` = R2 (black key)
- `D` = G
- `F` = M
- `T` = M1 (black key)
- `G` = P
- `Y` = D1 (black key)
- `H` = D
- `U` = D2 (black key)
- `J` = N

**Upper Octave (Octave 2)**:
- `K` = S
- `O` = R1 (black key)
- `L` = R
- `P` = R2 (black key)
- `;` = G
- `'` = M
- `]` = M1 (black key)
- `\` = P

## Audio Playback

```javascript
const engine = new AudioEngine();
await engine.init();

// Play single note
engine.playSvara("S", "madhya", 1.0);

// Play sequence
engine.playSequence([
  { svara: "S", octave: "madhya", duration: 1 },
  { svara: "R1", octave: "madhya", duration: 1 },
  { svara: "G1", octave: "madhya", duration: 1 },
  { svara: "M1", octave: "madhya", duration: 1 }
], 120);
```

## Validation

Use the parser to validate notation:

```javascript
const result = validateNotation("S R1 G1 ||");
// { valid: true, hasSvara: true, hasRhythmMarker: true }

const result = validateNotation("Hello");
// { valid: false, issues: [...] }
```
