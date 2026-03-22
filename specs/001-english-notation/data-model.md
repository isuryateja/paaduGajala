# Data Model: English Notation

**Feature**: Convert to English Notation  
**Date**: 2026-03-19

## Entities

### Svara

A musical note in Carnatic music.

**Attributes**:
- `notation` (string): English notation (S, R1, R2, G1, G2, G3, M1, M2, P, D1, D2, D3, N1, N2, N3)
- `name` (string): Full Carnatic name (e.g., "Shadjam", "Shuddha Rishabham")
- `position` (number): Position in 12-tone scale (1-12)
- `semitones` (number): Semitone offset from Sa (0-11)
- `frequency` (number): Frequency in Hz for madhya octave
- `equivalents` (array): Other notations for same pitch (e.g., R2: [G1])

**Validation Rules**:
- `notation` must be one of the 16 valid notations
- `position` must be 1-12
- `semitones` must be 0-11

**Example**:
```javascript
{
  notation: "R2",
  name: "Chatusruti Rishabham",
  position: 3,
  semitones: 2,
  frequency: 293.66,
  equivalents: ["G1"]
}
```

### Octave

Pitch range for a svara.

**Attributes**:
- `name` (string): Octave name ('mandra', 'madhya', 'taara')
- `suffix` (string): Notation suffix ('.', '', "'")
- `multiplier` (number): Frequency multiplier (0.5, 1.0, 2.0)

**Example**:
```javascript
{
  name: "mandra",
  suffix: ".",
  multiplier: 0.5
}
```

### ParsedNote

Result of parsing notation input.

**Attributes**:
- `type` (string): Always 'svara'
- `svara` (string): The svara notation (S, R1, etc.)
- `svaraName` (string): Full name ('sa', 'ri1', etc.)
- `octave` (string): Octave name ('mandra', 'madhya', 'taara')
- `duration` (number): Note duration (default: 1)
- `beatMarker` (string|null): Associated rhythm marker ('|', '||', or null)
- `line` (number): Line number in input
- `position` (number): Character position in input

**Example**:
```javascript
{
  type: "svara",
  svara: "R1",
  svaraName: "ri1",
  octave: "madhya",
  duration: 1,
  beatMarker: "|",
  line: 1,
  position: 2
}
```

### RhythmMarker

Beat separator in notation.

**Attributes**:
- `type` (string): Always 'rhythm_marker'
- `marker` (string): The marker ('|' or '||')
- `subtype` (string): 'single' or 'double'
- `line` (number): Line number in input
- `position` (number): Character position in input

**Example**:
```javascript
{
  type: "rhythm_marker",
  marker: "||",
  subtype: "double",
  line: 1,
  position: 20
}
```

### SvaraFrequency

Frequency mapping for a specific svara in a specific octave.

**Key Format**: `{notation}{suffix}` (e.g., "S", "R1.", "S'")

**Attributes**:
- `frequency` (number): Hz value
- `western` (string): Western note equivalent (e.g., "C4")
- `semitones` (number): Offset from Sa
- `name` (string): Full name with octave
- `octave` (string): Octave name
- `equivalent` (string, optional): Equivalent notation

**Example**:
```javascript
"R2": {
  frequency: 293.66,
  western: "D4",
  semitones: 2,
  name: "Chatusruti Rishabham (Madhya)",
  octave: "madhya",
  equivalent: "G1"
}
```

## Relationships

```
Svara --(in)--> Octave --> SvaraFrequency
                        
Notation Input --> Parser --> ParsedNote[]
                           --> RhythmMarker[]

ParsedNote --> SvaraFrequency (lookup)
           --> Audio Engine (playback)
```

## State Transitions

### Parser State Machine

```
Input String
    |
    v
Tokenize --> [Tokens]
    |
    v
Parse -----> [ParsedNotes + RhythmMarkers]
    |
    v
Validate --> [Valid/Invalid]
    |
    v
Output
```

### Token Types

1. **SVARA**: Svara notation with optional octave suffix
2. **RHYTHM_MARKER**: '|' or '||'
3. **WHITESPACE**: Spaces, tabs (optional)
4. **NEWLINE**: Line breaks
5. **UNKNOWN**: Invalid characters (should warn/error)

## Validation Rules

### Svara Notation Validation

```
Valid notation := Base + OptionalNumber
Base := 'S' | 'R' | 'G' | 'M' | 'P' | 'D' | 'N'
OptionalNumber := '' | '1' | '2' | '3'

Constraints:
- S and P: No number allowed
- R, G, M, D, N: Number 1-3 required
```

### Octave Suffix Validation

```
Valid suffix := '.' | '' | "'"

Meaning:
- '.' : mandara (lower octave)
- ''  : madhya (middle octave)
- "'" : taara (higher octave)
```

### Complete Pattern

```
Valid svara := (S | P) Suffix
             | (R | G | M | D | N) [1-3] Suffix

Examples:
- "S"    : Shadjam, madhya
- "S."   : Shadjam, mandara
- "S'"   : Shadjam, taara
- "R1"   : Shuddha Rishabham, madhya
- "R2."  : Chatusruti Rishabham, mandara
- "G3'"  : Antara Gandharam, taara
```
