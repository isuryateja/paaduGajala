# Implementation Plan: Convert to English Notation

**Branch**: `001-english-notation` | **Date**: 2026-03-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-english-notation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Convert all Telugu notation (స, రి, గ, మ, ప, ద, ని) to English notation (S, R1, R2, G1, G2, G3, M1, M2, P, D1, D2, D3, N1, N2, N3) across the entire codebase. This involves updating the virtual piano display, notation parser, frequency mappings, audio engine, and all documentation to use universal English characters instead of Telugu script.

## Technical Context

**Language/Version**: JavaScript (ES6+), HTML5, CSS3  
**Primary Dependencies**: Web Audio API, Native browser APIs  
**Storage**: N/A (in-memory)  
**Testing**: Manual browser testing, console validation  
**Target Platform**: Web browsers (desktop/mobile)  
**Project Type**: Web application (virtual piano + notation parser)  
**Performance Goals**: Real-time audio playback, 60fps UI interactions  
**Constraints**: Must work without Telugu font support; backward compatibility not required  
**Scale/Scope**: Single-user web app, local execution

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

This project is a client-side web application. The constitution template is not yet customized, so we proceed with standard web development practices:

- ✓ Simplicity: Changes are straightforward string replacements
- ✓ Testability: Each component can be tested independently
- ✓ No architectural complexity added

## Project Structure

### Documentation (this feature)

```text
specs/001-english-notation/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
/
├── virtual_piano.html       # Piano UI with key labels
├── notation_parser.js       # Input parsing logic
├── svara_frequencies.js     # Frequency mappings for svaras
├── audio_engine.js          # Audio playback engine
├── svara_sthanas.md         # Reference documentation
├── example.txt              # Example notation files
└── README.md                # Project documentation
```

**Structure Decision**: This is a simple web application with HTML/CSS/JS files at the root. No complex directory structure needed.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. This is a straightforward refactoring task with minimal complexity.

---

## Phase 0: Research & Unknowns

### Unknowns Identified

1. **Octave Indicator Format**: Should we use Unicode combining dots (̇, ˙) or ASCII suffixes (', .)?
   - **Decision**: Use ASCII suffixes for maximum compatibility
   - Lower octave (mandra): `.` suffix (e.g., `S.`, `R1.`)
   - Upper octave (taara): `'` suffix (e.g., `S'`, `R1'`)
   - Middle octave (madhya): no suffix (e.g., `S`, `R1`)

2. **Case Sensitivity**: Should parser accept lowercase?
   - **Decision**: Accept both uppercase and lowercase for flexibility
   - Input: `s r1 g1` should work same as `S R1 G1`
   - Output: Always uppercase for consistency

3. **Equivalent Svaras**: R2=G1, R3=G2, D2=N1, D3=N2 - how to handle?
   - **Decision**: Both notations are valid inputs; internally normalize to canonical form
   - R2 and G1 both accepted, both map to same frequency
   - Output uses whatever was input (preserve user choice)

4. **Rhythm Markers**: Keep Telugu (। ॥) or use ASCII (| ||)?
   - **Decision**: Use ASCII `|` and `||` for universal compatibility
   - Also accept Unicode dandas for backward compatibility during transition

### Files Requiring Changes

| File | Changes Needed |
|------|----------------|
| `virtual_piano.html` | Update key labels (స→S, రి→R, etc.) |
| `notation_parser.js` | Replace Telugu parsing with English parsing |
| `svara_frequencies.js` | Change object keys from Telugu to English |
| `audio_engine.js` | Update frequency lookup mappings |
| `svara_sthanas.md` | Already has English notation column (reference) |
| `example.txt` | Convert examples to English notation |
| `README.md` | Update documentation and examples |

### Research Findings

**English Notation Mapping** (from svara_sthanas.md):

| Position | Telugu | English | Frequency Key |
|----------|--------|---------|---------------|
| 1 | స | S | S, S., S' |
| 2 | రి (shuddha) | R1 | R1, R1., R1' |
| 3 | రి (chatusruti) | R2 | R2, R2., R2' |
| 3 | గ (shuddha) | G1 | G1, G1., G1' |
| 4 | రి (shatshruti) | R3 | R3, R3., R3' |
| 4 | గ (sadharana) | G2 | G2, G2., G2' |
| 5 | గ (antara) | G3 | G3, G3., G3' |
| 6 | మ (shuddha) | M1 | M1, M1., M1' |
| 7 | మ (prati) | M2 | M2, M2., M2' |
| 8 | ప | P | P, P., P' |
| 9 | ధ (shuddha) | D1 | D1, D1., D1' |
| 10 | ధ (chatusruti) | D2 | D2, D2., D2' |
| 10 | ని (shuddha) | N1 | N1, N1., N1' |
| 11 | ధ (shatshruti) | D3 | D3, D3., D3' |
| 11 | ని (kaisiki) | N2 | N2, N2., N2' |
| 12 | ని (kakali) | N3 | N3, N3., N3' |

---

## Phase 1: Design & Contracts

### Data Model

See [data-model.md](./data-model.md) for detailed entity definitions.

**Key Entities**:
- **Svara**: { notation: string, name: string, frequency: number, octave: string }
- **ParsedNote**: { type: 'svara', svara: string, octave: 'mandra'|'madhya'|'taara', duration: number }
- **RhythmMarker**: { type: 'rhythm', marker: '|' || '||' }

### Interface Contracts

See [contracts/](./contracts/) directory for:
- [Notation Parser Contract](./contracts/notation-parser.md)
- [Audio Engine Contract](./contracts/audio-engine.md)

### Quick Start

See [quickstart.md](./quickstart.md) for:
- How to use English notation
- Examples of valid input
- Migration guide from Telugu notation

---

## Phase 2: Task Planning

To be generated by `/speckit.tasks` command.

Expected task categories:
1. Update virtual_piano.html labels
2. Rewrite notation_parser.js for English
3. Update svara_frequencies.js keys
4. Update audio_engine.js mappings
5. Update example.txt
6. Update README.md documentation
