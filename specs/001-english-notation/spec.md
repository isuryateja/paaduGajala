# Feature Specification: Convert to English Notation

**Feature Branch**: `001-english-notation`  
**Created**: 2026-03-19  
**Status**: Draft  
**Input**: User description: "The svaras on the keyboard and notation now are using telugu font. But that is not universal. Let us use english notation. The input we take - parsing - on the keyboard and everywhere we take and give the output we use english notation Look at the svara_sthanas.md. Use the column Notation for this."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Display English Notation on Piano Keys (Priority: P1)

As a user, I want to see English notation (S, R1, R2, G1, G2, G3, M1, M2, P, D1, D2, D3, N1, N2, N3) on the virtual piano keys instead of Telugu characters, so that I can read and understand the svaras regardless of my device or browser's font support.

**Why this priority**: This is the primary user-facing change. Without universal font support for Telugu, many users cannot properly view the notation, making the application unusable for them.

**Independent Test**: Open the virtual piano in any browser on any device. All keys should display English notation labels that are readable without special font installation.

**Acceptance Scenarios**:

1. **Given** the virtual piano page is loaded, **When** I look at any white key, **Then** I see English notation labels (S, R, G, M, P, D, N) instead of Telugu characters
2. **Given** the virtual piano page is loaded, **When** I look at any black key, **Then** I see English notation labels (R1, R2, M1, D1, D2) instead of Telugu characters
3. **Given** I am using a device without Telugu font support, **When** I view the piano, **Then** all labels are still clearly readable

---

### User Story 2 - Parse English Notation Input (Priority: P1)

As a user, I want to input notation using English characters (S, R1, R2, G1, G2, G3, M1, M2, P, D1, D2, D3, N1, N2, N3), so that I can enter Carnatic music notation without needing a Telugu keyboard or input method.

**Why this priority**: This enables users to input and share notation universally. It removes the barrier of requiring Telugu input capabilities.

**Independent Test**: Type notation using only English characters (e.g., "S R1 G1 M1 | P D1 N1 S' ||") and verify the parser correctly identifies each svara and its octave.

**Acceptance Scenarios**:

1. **Given** I enter "S R1 G1 M1 | P D1 N1 ||", **When** the parser processes this input, **Then** it correctly identifies all 8 svaras with their correct names and octaves
2. **Given** I enter "S. S. M1 M1 | R1. R1. | G1 G1 ||", **When** the parser processes this input, **Then** it correctly identifies the mandra (lower octave) svaras with dot suffix
3. **Given** I enter "S' S' N3 N3 | D2 D2 | P P ||", **When** the parser processes this input, **Then** it correctly identifies the taara (higher octave) svaras with apostrophe suffix
4. **Given** I enter a sequence with rhythm markers "|" and "||", **When** the parser processes this input, **Then** it correctly identifies and preserves the rhythm markers

---

### User Story 3 - Output English Notation (Priority: P1)

As a user, I want all output (display, export, generated notation) to use English notation, so that I can save, share, and print music in a universally readable format.

**Why this priority**: Consistent output format ensures users can document and share their music with others regardless of language or device capabilities.

**Independent Test**: Generate or export notation from the application and verify it uses only English characters for svaras.

**Acceptance Scenarios**:

1. **Given** I have entered or generated a sequence of svaras, **When** I view or export the notation, **Then** all svaras are displayed using English notation (S, R1, R2, G1, G2, G3, M1, M2, P, D1, D2, D3, N1, N2, N3)
2. **Given** I export notation to a file, **When** I open that file on any device, **Then** all content is readable without Telugu font support
3. **Given** the application generates example notation, **When** displayed to the user, **Then** it uses English notation exclusively

---

### User Story 4 - Audio Engine Uses English Notation (Priority: P2)

As a developer, I want the audio engine to accept and process English notation for playing svaras, so that the audio playback is consistent with the visual notation system.

**Why this priority**: While critical for integration, the audio engine is not directly user-facing. It can be updated after the UI and parser changes are complete.

**Independent Test**: Programmatically call the audio engine with English notation (e.g., `playSvara('S', 'madhya', 1.0)`) and verify correct frequency output.

**Acceptance Scenarios**:

1. **Given** I call the audio engine with svara "S" and octave "madhya", **When** the note plays, **Then** it produces the correct frequency for Shadjam (261.63 Hz)
2. **Given** I call the audio engine with svara "R1" and octave "madhya", **When** the note plays, **Then** it produces the correct frequency for Shuddha Rishabham (277.18 Hz)
3. **Given** I call the audio engine with a sequence using English notation, **When** the sequence plays, **Then** all notes produce correct frequencies

---

### Edge Cases

- What happens when a user inputs mixed Telugu and English notation? (Should reject or warn about unsupported Telugu characters)
- How does the system handle case sensitivity? (Should accept both uppercase and lowercase: 's', 'r1', 'S', 'R1')
- What happens with invalid notation like "R4" or "X"? (Should provide clear error messages)
- How are equivalent svaras handled? (e.g., R2 and G1 are the same frequency - both should be valid inputs)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All piano key labels MUST display English notation (S, R, G, M, P, D, N for white keys; R1, R2, M1, D1, D2 for black keys)
- **FR-002**: The notation parser MUST accept English notation input using the format defined in svara_sthanas.md
- **FR-003**: The notation parser MUST support octave indicators using "." suffix for mandara (lower) and "'" suffix for taara (higher)
- **FR-004**: The notation parser MUST support rhythm markers "|" (single) and "||" (double)
- **FR-005**: All output (display, export, logs) MUST use English notation exclusively
- **FR-006**: The audio engine MUST accept English notation for frequency lookup and playback
- **FR-007**: The svara frequency mappings MUST use English notation as keys
- **FR-008**: All documentation and examples MUST be updated to use English notation

### Key Entities

- **Svara**: A musical note in Carnatic music. Represented by English notation (S, R1, R2, R3, G1, G2, G3, M1, M2, P, D1, D2, D3, N1, N2, N3)
- **Octave**: The pitch range of a svara. Three levels: mandara (lower, "." suffix), madhya (middle, no suffix), taara (higher, "'" suffix)
- **Rhythm Marker**: Beat separators in notation. Single "|" or double "||"

**English Notation Mapping (from svara_sthanas.md)**:

| Position | Telugu | English | Full Name |
|----------|--------|---------|-----------|
| 1 | షడ్జము (స) | S | Shadjam |
| 2 | శుద్ధ ఋషభము (రి) | R1 | Shuddha Rishabham |
| 3 | చతుశ్రుతి ఋషభము (రి) | R2 | Chatusruti Rishabham |
| 3 | శుద్ధ గాంధారము (గ) | G1 | Shuddha Gandharam |
| 4 | షట్చ్రుతి ఋషభము (రి) | R3 | Shatshruti Rishabham |
| 4 | సాధారణ గాంధారము (గ) | G2 | Sadharana Gandharam |
| 5 | అంతర గాంధారము (గ) | G3 | Antara Gandharam |
| 6 | శుద్ధ మధ్యమము (మ) | M1 | Shuddha Madhyamam |
| 7 | ప్రతి మధ్యమము (మ) | M2 | Prati Madhyamam |
| 8 | పంచమము (ప) | P | Panchamam |
| 9 | శుద్ధ ధైవతము (ధ) | D1 | Shuddha Dhaivatam |
| 10 | చతుశ్రుతి ధైవతము (ధ) | D2 | Chatusruti Dhaivatam |
| 10 | శుద్ధ నిషాదము (ని) | N1 | Shuddha Nishadham |
| 11 | షట్చ్రుతి ధైవతము (ధ) | D3 | Shatshruti Dhaivatam |
| 11 | కైసికి నిషాదము (ని) | N2 | Kaisiki Nishadham |
| 12 | కాకలి నిషాదము (ని) | N3 | Kakali Nishadham |

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All piano keys display English notation that is readable on any device without Telugu font support
- **SC-002**: Users can input notation using only English characters (S, R1, R2, G1, G2, G3, M1, M2, P, D1, D2, D3, N1, N2, N3) and the parser correctly identifies 100% of valid inputs
- **SC-003**: All exported or displayed notation uses English notation exclusively
- **SC-004**: Audio playback works correctly when triggered with English notation
- **SC-005**: No Telugu characters remain in any user-facing code, documentation, or examples
