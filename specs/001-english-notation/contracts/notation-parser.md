# Contract: Notation Parser

**Module**: `notation_parser.js`  
**Purpose**: Parse Carnatic music notation in English format

## Interface

### Main Function

```javascript
parseNotation(text, options)
```

**Parameters**:
- `text` (string): Input notation string
- `options` (object, optional):
  - `includeWhitespace` (boolean): Include whitespace tokens (default: false)
  - `includeUnknown` (boolean): Include unknown character tokens (default: false)
  - `defaultDuration` (number): Default note duration (default: 1)

**Returns**: Array of note objects

### Input Format

**Svara Notation**:
- Base: S, R, G, M, P, D, N
- Numbers (for R, G, M, D, N): 1, 2, 3
- Octave suffix: `.` (lower), none (middle), `'` (higher)

**Examples**:
```
S R1 G1 M1 | P D1 N1 S' ||
S. S. M1. M1. | R1. R1. | G1 G1 ||
```

**Rhythm Markers**:
- `|` : Single beat separator
- `||` : Double beat separator (end of phrase)

### Output Format

**Svara Object**:
```javascript
{
  type: "svara",
  svara: "R1",           // The notation
  svaraName: "ri1",      // Internal name
  octave: "madhya",      // "mandra" | "madhya" | "taara"
  duration: 1,
  beatMarker: "|",       // null | "|" | "||"
  line: 1,
  position: 2
}
```

**Rhythm Marker Object**:
```javascript
{
  type: "rhythm_marker",
  marker: "||",
  subtype: "double",
  line: 1,
  position: 20
}
```

## Examples

### Example 1: Basic Sarali Varisai

**Input**:
```
S R1 G1 M1 | P D1 N1 S' ||
```

**Output**:
```javascript
[
  { type: "svara", svara: "S", octave: "madhya", ... },
  { type: "svara", svara: "R1", octave: "madhya", ... },
  { type: "svara", svara: "G1", octave: "madhya", ... },
  { type: "svara", svara: "M1", octave: "madhya", ... },
  { type: "rhythm_marker", marker: "|", subtype: "single", ... },
  { type: "svara", svara: "P", octave: "madhya", ... },
  { type: "svara", svara: "D1", octave: "madhya", ... },
  { type: "svara", svara: "N1", octave: "madhya", ... },
  { type: "svara", svara: "S", octave: "taara", ... },
  { type: "rhythm_marker", marker: "||", subtype: "double", ... }
]
```

### Example 2: With Octave Indicators

**Input**:
```
S. S. M1 M1 | R1. R1. | G1 G1 ||
```

**Output**:
```javascript
[
  { type: "svara", svara: "S", octave: "mandra", ... },
  { type: "svara", svara: "S", octave: "mandra", ... },
  { type: "svara", svara: "M1", octave: "madhya", ... },
  // ...
]
```

### Example 3: Case Insensitivity

**Input**:
```
s r1 g1 m1
```

**Output**: Same as uppercase input (normalized to uppercase)

## Error Handling

### Invalid Notation

**Input**:
```
S R4 X Y
```

**Behavior**:
- R4: Invalid (R only has 1-3)
- X: Unknown character
- Y: Unknown character

If `includeUnknown: true`, returns unknown tokens. Otherwise, skips them.

### Mixed Telugu/English

**Input**:
```
S రి G
```

**Behavior**: Telugu characters treated as unknown (warns user)

## Utility Functions

### `createSvara(notation, octave)`

Creates a svara string with octave suffix.

```javascript
createSvara("S", "mandra")   // "S."
createSvara("R1", "madhya")  // "R1"
createSvara("P", "taara")    // "P'"
```

### `validateNotation(text)`

Validates notation input.

```javascript
validateNotation("S R1 G1 ||")
// Returns: { valid: true, issues: [], hasSvara: true, hasRhythmMarker: true }

validateNotation("Hello")
// Returns: { valid: false, issues: [{ type: "error", message: "..." }], ... }
```

## Constants

### SVARA_NOTATION

Maps notation to internal name:
```javascript
{
  S: "sa",
  R1: "ri1", R2: "ri2", R3: "ri3",
  G1: "ga1", G2: "ga2", G3: "ga3",
  M1: "ma1", M2: "ma2",
  P: "pa",
  D1: "da1", D2: "da2", D3: "da3",
  N1: "ni1", N2: "ni2", N3: "ni3"
}
```

### SVARA_NAMES

Reverse mapping:
```javascript
{
  sa: "S",
  ri1: "R1", ri2: "R2", ri3: "R3",
  // ...
}
```

### OCTAVE_NAMES

```javascript
{
  MANDRA: "mandra",
  MADHYA: "madhya",
  TAARA: "taara"
}
```

### RHYTHM_MARKERS

```javascript
{
  SINGLE: "|",
  DOUBLE: "||",
  SINGLE_UNICODE: "।",
  DOUBLE_UNICODE: "॥"
}
```
