# Paadu Gajaala

Paadu Gajaala is a browser-based Carnatic music notation player and visualizer built around Telugu svara input. It lets you paste notation, parse it into notes, play it back with Web Audio, and follow the sequence visually in the browser.

The repo also includes a standalone Carnatic virtual piano and reusable JavaScript modules for notation parsing, svara frequency lookup, and audio playback.

## What It Includes

- A main Carnatic notation player UI in [paadugajaala/index.html](paadugajaala/index.html)
- A standalone virtual piano demo in [virtual_piano.html](virtual_piano.html)
- A Telugu Carnatic notation parser in [notation_parser.js](notation_parser.js)
- A Web Audio playback engine in [audio_engine.js](audio_engine.js)
- Svara frequency mappings and tuning helpers in [svara_frequencies.js](svara_frequencies.js)

## Features

- Paste Telugu svara notation directly into the app
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

## How To Use The Notation Player

1. Open the main app.
2. Paste Telugu svara notation into the input box.
3. Click `Parse` to validate and preview the notation.
4. Adjust tempo and volume if needed.
5. Click `Play` to start playback.
6. Use `Pause`, `Stop`, `Clear`, or `Load Example` as needed.

Example input:

```text
స రి గ మ । ప ద ని ॥
స̇ ని ద ప । మ గ రి ॥
```

## Supported Notation

The parser is designed for Telugu Carnatic notation and supports:

- Telugu svaras such as `స`, `రి`, `గ`, `మ`, `ప`, `ద`, `ని`
- Octave markers using combining dots above and below
- Rhythm separators such as `।`, `॥`, `|`, and `||`
- Whitespace-separated or line-based notation input

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
- Add English transliteration input as an alternate notation mode
- Add automated browser-based tests for parsing and playback controls

## License

No license file is currently included in this repository. If you plan to distribute or reuse the code, add a license that matches your intent.
