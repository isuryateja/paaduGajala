# Research: English Notation Conversion

**Feature**: Convert to English Notation  
**Date**: 2026-03-19

## Decisions Made

### 1. Octave Indicator Format

**Decision**: Use ASCII suffixes instead of Unicode combining characters

| Octave | Suffix | Example |
|--------|--------|---------|
| Mandra (lower) | `.` | `S.`, `R1.`, `M1.` |
| Madhya (middle) | none | `S`, `R1`, `M1` |
| Taara (higher) | `'` | `S'`, `R1'`, `M1'` |

**Rationale**:
- ASCII characters work on all devices without font support
- Easy to type on any keyboard
- Visually clear and unambiguous
- Consistent with many music notation systems

**Alternatives considered**:
- Unicode combining dot below (˙) and dot above (̇): Rejected due to font dependency
- Numbers (e.g., S0, S1, S2): Rejected - less intuitive for musicians
- Letters (e.g., Sl, Sm, Sh): Rejected - harder to read quickly

### 2. Case Sensitivity

**Decision**: Parser accepts both uppercase and lowercase; output always uppercase

**Rationale**:
- Flexibility for user input (users may type casually)
- Consistency in output (professional appearance)
- Easy to implement with `.toUpperCase()`

**Example**:
```
Input:  "s r1 g1 m1 | p d1 n1 ||"
Output: "S R1 G1 M1 | P D1 N1 ||"
```

### 3. Equivalent Svaras

**Decision**: Accept both equivalent notations; preserve user input in output

| Frequency | Equivalent 1 | Equivalent 2 |
|-----------|--------------|--------------|
| Chatusruti Rishabham | R2 | G1 |
| Shatshruti Rishabham | R3 | G2 |
| Chatusruti Dhaivatam | D2 | N1 |
| Shatshruti Dhaivatam | D3 | N2 |

**Rationale**:
- Both notations are musically correct
- Different traditions prefer different naming
- Preserving user choice respects their preference
- Internal frequency lookup handles either form

### 4. Rhythm Markers

**Decision**: Primary use ASCII `|` and `||`; accept Unicode dandas for compatibility

**Rationale**:
- ASCII is universal and easy to type
- Some users may have existing notation with dandas
- Parser can accept both during transition period

### 5. Key Mapping

**Source**: svara_sthanas.md

| # | Telugu | English | Full Name | Semitone |
|---|--------|---------|-----------|----------|
| 1 | స | S | Shadjam | 0 |
| 2 | రి | R1 | Shuddha Rishabham | 1 |
| 3 | రి | R2 | Chatusruti Rishabham | 2 |
| 3 | గ | G1 | Shuddha Gandharam | 2 |
| 4 | రి | R3 | Shatshruti Rishabham | 3 |
| 4 | గ | G2 | Sadharana Gandharam | 3 |
| 5 | గ | G3 | Antara Gandharam | 4 |
| 6 | మ | M1 | Shuddha Madhyamam | 5 |
| 7 | మ | M2 | Prati Madhyamam | 6 |
| 8 | ప | P | Panchamam | 7 |
| 9 | ధ | D1 | Shuddha Dhaivatam | 8 |
| 10 | ధ | D2 | Chatusruti Dhaivatam | 9 |
| 10 | ని | N1 | Shuddha Nishadham | 9 |
| 11 | ధ | D3 | Shatshruti Dhaivatam | 10 |
| 11 | ని | N2 | Kaisiki Nishadham | 10 |
| 12 | ని | N3 | Kakali Nishadham | 11 |

### 6. Files Requiring Changes

| File | Telugu References | Change Count |
|------|-------------------|--------------|
| virtual_piano.html | Key labels (స, రి, గ, మ, ప, ద, ని) | ~20 labels |
| notation_parser.js | Parser logic, character checks | Complete rewrite |
| svara_frequencies.js | Object keys, comments | ~80 keys |
| audio_engine.js | Frequency lookup maps | ~5 maps |
| example.txt | Example notation | 10 lines |
| README.md | Documentation, examples | Multiple sections |

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missed Telugu references | Medium | Low | Global search before completion |
| User confusion during transition | Low | Medium | Clear documentation, examples |
| Parser regression | Low | High | Test with comprehensive examples |
| Audio engine breakage | Low | High | Test all svara frequencies |

## Implementation Order

1. **svara_frequencies.js** - Foundation, other files depend on this
2. **notation_parser.js** - Core user input handling
3. **virtual_piano.html** - User-visible labels
4. **audio_engine.js** - Integration testing
5. **example.txt** - Documentation
6. **README.md** - User documentation
