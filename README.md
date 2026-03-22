# Paadu Gajaala

Paadu Gajaala is a browser-based Carnatic music notation player and visualizer using English notation (S, R1, R2, G1, G2, G3, M1, M2, P, D1, D2, D3, N1, N2, N3). It lets you paste notation, parse it into notes, play it back with Web Audio, and follow the sequence visually in the browser.

The repo also includes a standalone Carnatic virtual piano and reusable JavaScript modules for notation parsing, svara frequency lookup, and audio playback.

## What It Includes

- A main Carnatic notation player UI in [paadugajaala/index.html](paadugajaala/index.html)
- A standalone virtual piano demo in [virtual_piano.html](virtual_piano.html)
- A Carnatic notation parser (English notation) in [notation_parser.js](notation_parser.js)
- A Web Audio playback engine in [audio_engine.js](audio_engine.js)
- Svara frequency mappings and tuning helpers in [svara_frequencies.js](svara_frequencies.js)

## Features

- Paste English svara notation directly into the app
- Parse and validate notation before playback
- Play parsed notation in the browser using the Web Audio API
- Follow note playback visually in the notation display
- Adjust tempo and volume
- Load an example phrase instantly
- Import notation from a `.txt` file
- Use a separate virtual piano with mouse, touch, or keyboard input

## Project Structure

```text
PaaduGajaala/
|-- README.md
|-- audio_engine.js
|-- notation_parser.js
|-- svara_frequencies.js
|-- virtual_piano.html
`-- paadugajaala/
    `-- index.html
```

## Running It Locally

This project does not require a build step, package manager, or backend server for basic use.

1. Clone or download the repository.
2. Open [paadugajaala/index.html](paadugajaala/index.html) in a modern browser.
3. Click `Parse` after entering notation.
4. Click `Play` to hear the sequence.

You can also open [virtual_piano.html](virtual_piano.html) directly to use the piano view.

## Troubleshooting

### Page stuck on “Loading Carnatic Music Engine…”

If the loading overlay never disappears, open your browser DevTools Console and look for a JavaScript syntax/runtime error.

Common cause when editing `paadugajaala/index.html`: **taara octave keys** use an apostrophe and must be quoted correctly in JavaScript objects, e.g. `"S'"` (not `"S':`).

## Deploying To Vercel

This repository includes a root-level `vercel.json`, so it can be deployed directly from GitHub without adding a build step.

- `/` serves the main app from [paadugajaala/index.html](paadugajaala/index.html)
- `/piano` serves the standalone piano from [virtual_piano.html](virtual_piano.html)

### Deploy From GitHub

1. Push the latest commit to GitHub.
2. In Vercel, click `Add New > Project`.
3. Import this GitHub repository.
4. Keep the Root Directory as the repository root.
5. Leave the build settings empty.
6. Click `Deploy`.

### Deploy With The Vercel CLI

```bash
npm i -g vercel
vercel
```

When prompted, keep the default project root as this repository folder.

## How To Use The Notation Player

1. Open the main app.
2. Paste English svara notation into the input box.
3. Click `Parse` to validate and preview the notation.
4. Adjust tempo and volume if needed.
5. Click `Play` to start playback.
6. Use `Pause`, `Stop`, `Clear`, or `Load Example` as needed (the example comes from `example.txt`).

Example input:

```text
S R1 G1 M1 | P D1 N1 ||
S' N1 D1 P | M1 G1 R1 ||
```

## Supported Notation

The parser supports English Carnatic notation:

- English svaras: `S`, `R1`, `R2`, `R3`, `G1`, `G2`, `G3`, `M1`, `M2`, `P`, `D1`, `D2`, `D3`, `N1`, `N2`, `N3`
- Octave markers: `.` for lower octave (mandra), `'` for higher octave (taara)
- Rhythm separators: `|` (single beat), `||` (double beat)
- Whitespace-separated or line-based notation input

### Notation Reference

| Notation | Name | Semitone |
|----------|------|----------|
| S | Shadjam | 0 |
| R1 | Shuddha Rishabham | 1 |
| R2 | Chatusruti Rishabham | 2 |
| G1 | Shuddha Gandharam | 2 |
| R3 | Shatshruti Rishabham | 3 |
| G2 | Sadharana Gandharam | 3 |
| G3 | Antara Gandharam | 4 |
| M1 | Shuddha Madhyamam | 5 |
| M2 | Prati Madhyamam | 6 |
| P | Panchamam | 7 |
| D1 | Shuddha Dhaivatam | 8 |
| D2 | Chatusruti Dhaivatam | 9 |
| N1 | Shuddha Nishadham | 9 |
| D3 | Shatshruti Dhaivatam | 10 |
| N2 | Kaisiki Nishadham | 10 |
| N3 | Kakali Nishadham | 11 |

## Browser Requirements

- A modern browser with Web Audio API support
- User interaction before audio starts, because browsers block autoplay by default

Tested behavior is expected to be best in recent versions of Chrome, Edge, or Firefox.

## Developer Notes

The repository contains both standalone demos and reusable logic:

- [notation_parser.js](notation_parser.js) exposes parsing helpers such as `parseNotation`, `parseSvarasOnly`, and validation/stat helpers.
- [audio_engine.js](audio_engine.js) provides an `AudioEngine` class for note and sequence playback.
- [svara_frequencies.js](svara_frequencies.js) contains Carnatic svara frequency mappings and tuning utilities.

## Ideas For Next Improvements

- Add proper module wiring so the main app imports the shared JS files directly
- Add sample compositions and raga presets
- Support export to MIDI or audio
- Support Unicode danda characters (। ॥) as alternative to ASCII
- Add automated browser-based tests for parsing and playback controls

## License

No license file is currently included in this repository. If you plan to distribute or reuse the code, add a license that matches your intent.
