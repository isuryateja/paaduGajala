<script lang="ts">
  // /dodo/arch — Architecture deep-dive
</script>

<svelte:head>
  <title>arch — paaduGajala</title>
</svelte:head>

<article class="doc">
  <header class="doc-header">
    <h1 class="doc-title">architecture</h1>
    <p class="doc-subtitle">
      a complete technical map of paaduGajala — how notation becomes sound.
    </p>
  </header>

  <!-- ────────────────────────────── OVERVIEW ──────────────────────────────── -->
  <section>
    <h2>overview</h2>
    <p>
      paaduGajala is a browser-only Carnatic music notation player. there is no backend, no server, no
      database. everything lives in the browser. the user types (or loads) notation in English svara
      shorthand, the app parses it into a structured AST, resolves each svara to a frequency, and
      drives the Web Audio API to produce sound.
    </p>
    <p>
      the stack: <strong>SvelteKit + Vite</strong> for the app shell, <strong>Svelte 5</strong>
      (runes mode) for the UI, <strong>TypeScript 5</strong> everywhere, and the <strong>Web Audio API</strong>
      for sound synthesis. there are no external audio libraries.
    </p>

    <div class="diagram">
      <div class="flow-row">
        <div class="box">notation text</div>
        <div class="arrow">→</div>
        <div class="box accent">tokenizer</div>
        <div class="arrow">→</div>
        <div class="box accent">parser</div>
        <div class="arrow">→</div>
        <div class="box">ParsedNotationNode[]</div>
      </div>
      <div class="flow-row" style="margin-top: 0.75rem;">
        <div class="box">ParsedNotationNode[]</div>
        <div class="arrow">→</div>
        <div class="box accent">frequency resolver</div>
        <div class="arrow">→</div>
        <div class="box accent">AudioEngine</div>
        <div class="arrow">→</div>
        <div class="box">🔊 sound</div>
      </div>
    </div>
  </section>

  <!-- ─────────────────────────── DIRECTORY LAYOUT ─────────────────────────── -->
  <section>
    <h2>directory layout</h2>
    <p>the source is split into four clean layers inside <code>src/</code>:</p>

    <div class="code-block">
<pre>src/
├── domain/           ← pure domain logic (no Svelte, no DOM)
│   ├── notation/     ← parser types, validation, stats
│   ├── pitch/        ← svara → frequency resolution
│   ├── audio/        ← AudioEngine class, voice types, presets
│   ├── piano/        ← keyboard layout and key-id mapping
│   └── shared/       ← shared types (OctaveName, WaveformType, …)
│
├── app/              ← application layer (orchestrates domain + stores)
│   ├── stores/       ← Svelte writable stores (notation, playback, settings, ui)
│   ├── actions/      ← stateful handlers that mutate stores
│   └── services/     ← view-model builders, complex page logic
│
├── components/       ← Svelte UI components
│   ├── notation/     ← editor, preview, token rendering
│   ├── piano/        ← piano keyboard visualizer
│   ├── playback/     ← controls, tempo, waveform pickers
│   ├── layout/       ← chrome, header, overlay
│   └── common/       ← toasts, loading, utility components
│
├── infra/            ← browser-specific wrappers (file reader, storage)
├── routes/           ← SvelteKit file-based routing
├── styles/           ← global CSS
└── lib/              ← tiny pure utilities (clamp, createId, formatDuration…)</pre>
    </div>

    <p>
      the key architectural boundary: <strong>domain knows nothing about Svelte</strong>.
      the domain layer is pure TypeScript — classes, functions, interfaces. the app layer
      bridges domain → stores → UI.
    </p>
    <p>
      the legacy JS files (<code>notation_parser.js</code>, <code>svara_frequencies.js</code>)
      live at the root. they are the original pre-migration parser and frequency table.
      the TypeScript domain layer wraps them with typed facades — it doesn't duplicate logic,
      it re-exports with types. this is intentional: the JS files are the ground truth for
      parsing and pitch maths; the TS wrappers add type safety on top.
    </p>
  </section>

  <!-- ──────────────────────────── NOTATION SYNTAX ─────────────────────────── -->
  <section>
    <h2>notation syntax</h2>
    <p>
      paaduGajala uses <strong>English svara shorthand</strong>, not Devanagari or solfège.
      each svara is one or two characters:
    </p>

    <table>
      <thead>
        <tr><th>token</th><th>svara</th><th>full name</th><th>semitones from Sa</th></tr>
      </thead>
      <tbody>
        <tr><td><code>S</code></td><td>Shadjam</td><td>Sa</td><td>0</td></tr>
        <tr><td><code>R1</code></td><td>Shuddha Rishabham</td><td>Ri₁</td><td>1</td></tr>
        <tr><td><code>R2</code></td><td>Chatusruti Rishabham</td><td>Ri₂</td><td>2</td></tr>
        <tr><td><code>R3</code></td><td>Shatshruti Rishabham</td><td>Ri₃</td><td>3</td></tr>
        <tr><td><code>G1</code></td><td>Shuddha Gandharam</td><td>Ga₁</td><td>2 ≡ R2</td></tr>
        <tr><td><code>G2</code></td><td>Sadharana Gandharam</td><td>Ga₂</td><td>3 ≡ R3</td></tr>
        <tr><td><code>G3</code></td><td>Antara Gandharam</td><td>Ga₃</td><td>4</td></tr>
        <tr><td><code>M1</code></td><td>Shuddha Madhyamam</td><td>Ma₁</td><td>5</td></tr>
        <tr><td><code>M2</code></td><td>Prati Madhyamam</td><td>Ma₂</td><td>6</td></tr>
        <tr><td><code>P</code></td><td>Panchamam</td><td>Pa</td><td>7</td></tr>
        <tr><td><code>D1</code></td><td>Shuddha Dhaivatam</td><td>Da₁</td><td>8</td></tr>
        <tr><td><code>D2</code></td><td>Chatusruti Dhaivatam</td><td>Da₂</td><td>9 ≡ N1</td></tr>
        <tr><td><code>D3</code></td><td>Shatshruti Dhaivatam</td><td>Da₃</td><td>10 ≡ N2</td></tr>
        <tr><td><code>N1</code></td><td>Shuddha Nishadham</td><td>Ni₁</td><td>9 ≡ D2</td></tr>
        <tr><td><code>N2</code></td><td>Kaisiki Nishadham</td><td>Ni₂</td><td>10 ≡ D3</td></tr>
        <tr><td><code>N3</code></td><td>Kakali Nishadham</td><td>Ni₃</td><td>11</td></tr>
      </tbody>
    </table>

    <p>
      octave is indicated by a suffix on the svara token:
    </p>
    <table>
      <thead>
        <tr><th>suffix</th><th>octave (sthaayi)</th><th>example</th></tr>
      </thead>
      <tbody>
        <tr><td><code>.</code> (period / combining dot-below U+0323)</td><td>Mandra (lower)</td><td><code>S.</code> <code>R1.</code></td></tr>
        <tr><td>(none)</td><td>Madhya (middle)</td><td><code>S</code> <code>G3</code></td></tr>
        <tr><td><code>'</code> (apostrophe / combining dot-above U+0307)</td><td>Taara (higher)</td><td><code>S'</code> <code>N3'</code></td></tr>
      </tbody>
    </table>

    <p>
      rhythm is marked with <code>|</code> (single danda — beat separator) and <code>||</code>
      (double danda — end of phrase/line). Unicode dandas (। ॥) are also accepted. whitespace and
      tabs between svaras is ignored. each newline starts a new line-group.
    </p>

    <p>example notation:</p>
    <div class="code-block">
<pre>S     S     R1    R1    |     G3    G3    |     M1    M1    ||
R1    R1    G3    G3    |     M1    M1    |     P     P     ||
G3    G3    M1    M1 |   P     P    |    D1    D1    ||</pre>
    </div>
  </section>

  <!-- ────────────────────────── SVARA STHANAS ─────────────────────────────── -->
  <section>
    <h2>svara sthanas (note positions)</h2>
    <p>
      Carnatic music divides an octave into <strong>16 svara positions</strong> (sthanas), mapped
      onto 12 semitones. some positions share the same semitone — this is the core of the
      <em>suddha / vikrita</em> system and why Carnatic notation has more symbol-names than Western
      pitch-classes:
    </p>

    <table>
      <thead>
        <tr>
          <th>semitone</th><th>western (C-based)</th><th>svara names</th><th>note</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>0</td><td>C</td><td>S</td><td>Shadjam — fixed (prakruti svara)</td></tr>
        <tr><td>1</td><td>C♯ / D♭</td><td>R1</td><td>Shuddha Rishabham</td></tr>
        <tr><td>2</td><td>D</td><td>R2, G1</td><td>Chatusruti Ri = Shuddha Ga — same pitch</td></tr>
        <tr><td>3</td><td>D♯ / E♭</td><td>R3, G2</td><td>Shatshruti Ri = Sadharana Ga — same pitch</td></tr>
        <tr><td>4</td><td>E</td><td>G3</td><td>Antara Gandharam</td></tr>
        <tr><td>5</td><td>F</td><td>M1</td><td>Shuddha Madhyamam</td></tr>
        <tr><td>6</td><td>F♯ / G♭</td><td>M2</td><td>Prati Madhyamam</td></tr>
        <tr><td>7</td><td>G</td><td>P</td><td>Panchamam — fixed (prakruti svara)</td></tr>
        <tr><td>8</td><td>G♯ / A♭</td><td>D1</td><td>Shuddha Dhaivatam</td></tr>
        <tr><td>9</td><td>A</td><td>D2, N1</td><td>Chatusruti Da = Shuddha Ni — same pitch (A4 = 440 Hz)</td></tr>
        <tr><td>10</td><td>A♯ / B♭</td><td>D3, N2</td><td>Shatshruti Da = Kaisiki Ni — same pitch</td></tr>
        <tr><td>11</td><td>B</td><td>N3</td><td>Kakali Nishadham</td></tr>
      </tbody>
    </table>

    <p>
      important implications: <strong>S and P never change</strong> in any raga (they are
      <em>prakruti svaras</em> — nature-fixed). the other five (R, G, M, D, N) each have
      multiple varieties (<em>vikrita svaras</em>). a raga picks exactly one variety of each
      svara, giving it a characteristic scale.
    </p>

    <p>
      the shared-pitch pairs (R2↔G1, R3↔G2, D2↔N1, D3↔N2) mean the app resolves them to the
      same frequency; the distinction is semantic/grammatical (which raga they belong to), not
      acoustic.
    </p>
  </section>

  <!-- ──────────────────────────── PARSING PIPELINE ────────────────────────── -->
  <section>
    <h2>parsing pipeline</h2>
    <p>
      parsing is a two-phase <strong>tokenize → parse</strong> pipeline implemented in
      <code>notation_parser.js</code> and imported via typed facades in
      <code>src/domain/notation/notation.parser.ts</code>.
    </p>

    <h3>phase 1 — tokenizer</h3>
    <p>
      the tokenizer walks the input character-by-character and emits a flat token stream.
      order of precedence at each position:
    </p>
    <ol>
      <li>double rhythm marker (<code>||</code> or <code>॥</code>) — consumes 2 chars</li>
      <li>single rhythm marker (<code>|</code> or <code>।</code>)</li>
      <li>newline <code>\n</code></li>
      <li>whitespace</li>
      <li><code>extractSvara()</code> — tries to build a svara token:
        <ul>
          <li>first char must be a svara base (<code>S R G M P D N</code>)</li>
          <li>optionally followed by <code>1</code>, <code>2</code>, or <code>3</code> for the variety</li>
          <li>then zero or more octave modifiers (<code>.</code> / U+0323 for mandra, <code>'</code> / U+0307 for taara)</li>
          <li>result validated against the known svara table</li>
        </ul>
      </li>
      <li>unknown char — emitted as-is for validation warnings</li>
    </ol>

    <p>token types emitted: <code>svara | rhythm_marker | newline | whitespace | unknown</code></p>

    <h3>phase 2 — parser</h3>
    <p>
      the parser walks the token stream and produces <code>ParsedNotationNode[]</code>. each svara
      token becomes a <code>ParsedSvara</code> node. rhythm markers are attached to the
      <em>preceding svara</em> as <code>beatMarker</code> and also emitted as standalone
      <code>RhythmMarkerNode</code> entries (for visualisation). newlines emit a
      <code>NewlineNode</code> and reset the line counter.
    </p>

    <div class="code-block">
<pre>// ParsedSvara shape
&#123;
  type: 'svara',
  svara: 'G3',             // canonical token (e.g. G3)
  svaraName: 'ga3',        // full name key
  octave: 'madhya',        // 'mandra' | 'madhya' | 'taara'
  duration: 1,             // default; 1 = one akshara (beat)
  beatMarker: '|' | null,  // rhythm marker attached to this note
  line: 1,
  position: 42
&#125;</pre>
    </div>

    <h3>additional parser entry points</h3>
    <table>
      <thead>
        <tr><th>function</th><th>returns</th><th>used for</th></tr>
      </thead>
      <tbody>
        <tr><td><code>parseNotation(text)</code></td><td><code>ParsedNotationNode[]</code></td><td>full AST — playback + visualisation</td></tr>
        <tr><td><code>parseSvarasOnly(text)</code></td><td><code>ParsedSvara[]</code></td><td>quick svara count, validation check</td></tr>
        <tr><td><code>parseNotationByLines(text)</code></td><td><code>ParsedSvara[][]</code></td><td>line-by-line stats</td></tr>
        <tr><td><code>tokenize(text)</code></td><td><code>NotationToken[]</code></td><td>raw token stream for debugging</td></tr>
        <tr><td><code>buildPreviewNotationTokens(nodes)</code></td><td><code>PreviewNotationToken[]</code></td><td>renders the styled notation preview in the UI</td></tr>
      </tbody>
    </table>

    <h3>validation</h3>
    <p>
      <code>validateNotation(text)</code> runs the tokenizer and checks: (a) at least one valid
      svara exists, (b) any unknown tokens get surfaced as warnings. it returns a
      <code>NotationValidationResult</code> with a <code>valid</code> boolean and an
      <code>issues[]</code> array. validation runs before any parse in <code>parseCurrentNotation()</code>.
    </p>
  </section>

  <!-- ──────────────────────────── FREQUENCY RESOLUTION ───────────────────── -->
  <section>
    <h2>svara → frequency resolution</h2>
    <p>
      once parsed, each <code>ParsedSvara</code> needs a frequency in Hz.
      this is handled by <code>src/domain/pitch/svara-frequencies.ts</code> which wraps
      <code>svara_frequencies.js</code>.
    </p>

    <h3>tuning modes</h3>
    <p>the engine supports two tuning models, switchable at runtime:</p>

    <table>
      <thead>
        <tr><th>mode</th><th>how it works</th><th>sounds like</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>equal temperament</strong> (default)</td>
          <td>
            lookup from the pre-computed <code>SVARA_FREQUENCIES</code> table.
            tonic Sa = C4 = 261.63 Hz (derived from A4 = 440 Hz).
            each semitone = previous × 2¹/¹² ≈ 1.05946.
          </td>
          <td>familiar / Western compatible</td>
        </tr>
        <tr>
          <td><strong>just intonation</strong></td>
          <td>
            frequency = baseFrequency × <code>JUST_INTONATION_RATIOS[svara].ratio</code>.
            ratios are pure harmonic fractions (S=1/1, M1=4/3, P=3/2, …).
            octave shift: mandra×0.5, madhya×1, taara×2.
          </td>
          <td>richer consonance, slight "shimmer" on sustained notes</td>
        </tr>
      </tbody>
    </table>

    <h3>reference pitches</h3>
    <div class="code-block">
<pre>REFERENCE_A4     = 440.0 Hz   (international concert pitch)
BASE_SA_FREQUENCY = 261.63 Hz  (C4 — tonic Sa in madhya sthaayi)

// Equal temperament table samples:
S   (madhya) = 261.63 Hz  ← C4
R1  (madhya) = 277.18 Hz  ← C#4
G3  (madhya) = 329.63 Hz  ← E4
M1  (madhya) = 349.23 Hz  ← F4
P   (madhya) = 392.00 Hz  ← G4
D2  (madhya) = 440.00 Hz  ← A4  (= N1, the reference A)
N3  (madhya) = 493.88 Hz  ← B4
S'  (taara)  = 523.25 Hz  ← C5</pre>
    </div>

    <h3>key lookup flow</h3>
    <p>
      <code>getSvaraFrequency(svara, octave)</code> normalises the svara name (via
      <code>normalizeSvaraName</code>) and octave alias (via <code>normalizeOctaveName</code>),
      then builds a key like <code>"G3"</code>, <code>"G3."</code>, or <code>"G3'"</code> and
      looks it up in <code>SVARA_FREQUENCIES</code>.
    </p>
    <p>
      <code>normalizeOctaveName</code> accepts strings like <code>'low'</code>, <code>'1'</code>,
      <code>'mandra'</code>, <code>'mandara'</code> — all resolve to <code>'mandra'</code>.
      <code>normalizeSvaraName</code> lower-cases and strips whitespace, then maps aliases
      (e.g. bare <code>'r'</code> → <code>'R2'</code>, <code>'g'</code> → <code>'G3'</code>).
    </p>
  </section>

  <!-- ──────────────────────────── AUDIO ENGINE ───────────────────────────── -->
  <section>
    <h2>audio engine</h2>
    <p>
      <code>AudioEngine</code> in <code>src/domain/audio/audio-engine.ts</code> is a class that
      owns the Web Audio API graph. one singleton instance is created in
      <code>src/app/actions/playback.actions.ts</code> and shared across the entire app.
    </p>

    <h3>audio graph</h3>
    <div class="diagram">
      <div class="flow-row">
        <div class="box">OscillatorNode</div>
        <div class="arrow">→</div>
        <div class="box">envelopeGain (ADSR)</div>
        <div class="arrow">→</div>
        <div class="box">voiceGain (velocity)</div>
        <div class="arrow">→</div>
        <div class="box accent">DynamicsCompressor</div>
        <div class="arrow">→</div>
        <div class="box accent">masterGain</div>
        <div class="arrow">→</div>
        <div class="box">AudioDestination</div>
      </div>
    </div>

    <p>
      each played note spawns an independent <strong>voice</strong> (oscillator + gain chain).
      voices are tracked in <code>activeVoices: Map&lt;string, AudioVoice&gt;</code>. they
      clean themselves up via <code>oscillator.onended</code>.
    </p>

    <h3>ADSR envelope</h3>
    <p>
      every voice has an ADSR envelope applied to <code>envelopeGain</code> using the Web Audio
      scheduled parameter API (<code>setValueAtTime</code> / <code>linearRampToValueAtTime</code>):
    </p>
    <div class="code-block">
<pre>defaults:
  attack  = 0.02s   // ramp from 0 → 1
  decay   = 0.05s   // ramp from 1 → sustain
  sustain = 0.70    // hold level (0–1)
  release = 0.15s   // ramp from sustain → 0 on noteOff</pre>
    </div>

    <h3>waveform presets</h3>
    <p>
      the oscillator type maps to an instrument preset. defaults apply to the envelope too:
    </p>
    <table>
      <thead>
        <tr><th>preset</th><th>waveform</th><th>attack</th><th>decay</th><th>sustain</th><th>release</th></tr>
      </thead>
      <tbody>
        <tr><td>flute (default-ish)</td><td>sine</td><td>0.05</td><td>0.10</td><td>0.80</td><td>0.20</td></tr>
        <tr><td>veena (app default)</td><td>triangle</td><td>0.02</td><td>0.05</td><td>0.75</td><td>0.15</td></tr>
        <tr><td>violin</td><td>sawtooth</td><td>0.10</td><td>0.20</td><td>0.70</td><td>0.30</td></tr>
        <tr><td>harmonium</td><td>square</td><td>0.03</td><td>0.10</td><td>0.80</td><td>0.20</td></tr>
      </tbody>
    </table>

    <h3>sequence playback</h3>
    <p>
      <code>playSequence(notes, tempo)</code> schedules all notes ahead-of-time using
      <code>audioContext.currentTime</code> as a cursor. this avoids setInterval jitter — audio
      scheduling is sample-accurate. for each note:
    </p>
    <ol>
      <li>a <code>scheduleSequenceNoteIndex</code> call plants a <code>setTimeout</code> timed to
        emit a <code>noteIndex</code> event when the note starts playing (used to light up the
        correct svara in the notation preview)</li>
      <li><code>playSvara(…, when: cursor)</code> creates the voice at the scheduled audio time</li>
      <li>the cursor advances by <code>duration × beatDuration</code></li>
    </ol>
    <p>
      <code>beatDuration = 60 / tempo</code> (seconds per beat). default tempo is 120 BPM.
      tempo is clamped to 30–300 BPM.
    </p>

    <h3>pause / resume</h3>
    <p>
      pause is implemented by capturing remaining notes from the current position into
      <code>pausedPlayback</code>, calling <code>stopAll()</code>, and snapshotting state.
      resume re-schedules from that snapshot. stop clears everything.
    </p>

    <h3>engine events</h3>
    <table>
      <thead>
        <tr><th>event</th><th>when</th><th>payload</th></tr>
      </thead>
      <tbody>
        <tr><td><code>ready</code></td><td>AudioContext initialized</td><td>audioContext ref</td></tr>
        <tr><td><code>noteOn</code></td><td>voice starts</td><td>svara, octave, frequency, voiceId</td></tr>
        <tr><td><code>noteOff</code></td><td>voice ends</td><td>svara, octave, voiceId</td></tr>
        <tr><td><code>noteIndex</code></td><td>UI beat sync</td><td>index (into parsed svaras array)</td></tr>
        <tr><td><code>sequenceStart</code></td><td>playback begins</td><td>notes, tempo</td></tr>
        <tr><td><code>sequenceEnd</code></td><td>playback finishes or stops</td><td>cancelled bool</td></tr>
      </tbody>
    </table>
  </section>

  <!-- ──────────────────────────── STATE MANAGEMENT ───────────────────────── -->
  <section>
    <h2>state management</h2>
    <p>
      state is held in four Svelte <code>writable</code> stores. they are plain JS objects —
      there is no Zustand, Redux, or custom atom system.
    </p>

    <table>
      <thead>
        <tr><th>store</th><th>owns</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><code>notationStore</code></td>
          <td>raw input text, parsed AST, validation result, note statistics, input source (manual | example | file)</td>
        </tr>
        <tr>
          <td><code>playbackStore</code></td>
          <td>status (ready / playing / paused), currentIndex (which note is highlighted), sequenceLength</td>
        </tr>
        <tr>
          <td><code>settingsStore</code></td>
          <td>tempo (BPM), volume (0–1), waveform, tuning mode, active preset name</td>
        </tr>
        <tr>
          <td><code>uiStore</code></td>
          <td>loading flag, toast queue, status bar (tone + text)</td>
        </tr>
      </tbody>
    </table>

    <p>
      stores are mutated exclusively through <strong>action functions</strong> in
      <code>src/app/actions/</code>. components never call <code>store.set()</code> directly.
      this keeps mutation logic testable and co-located with domain calls.
    </p>
  </section>

  <!-- ──────────────────────────── PIANO VISUALIZER ───────────────────────── -->
  <section>
    <h2>piano keyboard visualizer</h2>
    <p>
      the keyboard visualizer maps each playing svara to a physical key on a rendered piano.
      the mapping is defined in <code>PLAYBACK_KEY_MAP_BY_OCTAVE</code>:
    </p>
    <div class="code-block">
<pre>madhya octave:
  S  → key 's:2'   (C4)
  R1 → key 'r1:2'
  G3 → key 'g:2'   (E4)
  M1 → key 'm:2'
  P  → key 'p:2'
  D2 / N1 → key 'd2:2'   (A4)
  N3 → key 'n:2'

key-id format:  "&#123;shortName&#125;:&#123;octaveIndex&#125;"
                octaveIndex = 1 (mandra), 2 (madhya), 3 (taara)</pre>
    </div>
    <p>
      <code>createPlaybackPianoVisualizer()</code> subscribes to <code>noteOn</code> /
      <code>noteOff</code> engine events, resolves the svara to a key ID, and calls
      <code>onChange(activeKeys)</code> with an updated <code>Record&lt;string, boolean&gt;</code>.
      the piano component renders this as visual key-press state.
    </p>
    <p>
      per the Svelte 5 guidelines for this project: key-press <em>visual feedback</em> uses
      direct DOM manipulation via <code>element.style</code> writes rather than reactive store
      updates — this avoids the Svelte re-render cycle for sub-200ms animations.
    </p>
  </section>

  <!-- ──────────────────────────── ROUTING ────────────────────────────────── -->
  <section>
    <h2>routing</h2>
    <p>
      SvelteKit file-based routing. current routes:
    </p>
    <table>
      <thead>
        <tr><th>path</th><th>what</th></tr>
      </thead>
      <tbody>
        <tr><td><code>/</code></td><td>main player (notation editor + piano + playback controls)</td></tr>
        <tr><td><code>/piano</code></td><td>standalone interactive piano keyboard</td></tr>
        <tr><td><code>/sruti-to-swara</code></td><td>frequency → svara lookup tool</td></tr>
        <tr><td><code>/theory</code></td><td>placeholder (theory content pending)</td></tr>
        <tr><td><code>/dodo/*</code></td><td>this secret section (arch, theory, plans)</td></tr>
      </tbody>
    </table>
    <p>
      the root layout (<code>+layout.svelte</code>) mounts the loading overlay and toast
      container globally. the <code>/dodo</code> section has its own nested layout with its own
      dark shell — it does not inherit any navigation from the main app.
    </p>
  </section>

  <!-- ──────────────────────────── DATA FLOW ──────────────────────────────── -->
  <section>
    <h2>end-to-end data flow</h2>
    <p>tracing what happens from "user types <code>S G3 M1 P</code> and clicks play":</p>
    <ol>
      <li>keystrokes → <code>notationStore.rawText</code> updated via <code>setNotationText()</code></li>
      <li>"Parse" button → <code>parseCurrentNotation()</code>:
        <ul>
          <li>runs <code>validateNotation(rawText)</code></li>
          <li>calls <code>parseSvarasOnly()</code> to confirm svaras exist</li>
          <li>calls <code>parseNotation()</code> → full AST stored in <code>notationStore.parsed</code></li>
          <li>calls <code>getNotationStats()</code> → stats stored in <code>notationStore.stats</code></li>
          <li><code>uiStore</code> gets "Parsed" status + success toast</li>
        </ul>
      </li>
      <li>"Play" button → <code>startPlayback()</code>:
        <ul>
          <li><code>createSequenceNotes()</code> — filters <code>parsed</code> for type=svara → <code>SequenceNote[]</code></li>
          <li><code>audioEngine.init()</code> — creates AudioContext on first play (browser policy)</li>
          <li><code>audioEngine.playSequence(notes, tempo)</code> — schedules all notes</li>
          <li><code>playbackStore</code> set to status=playing</li>
        </ul>
      </li>
      <li>AudioEngine fires <code>noteIndex</code> events → <code>playbackStore.currentIndex</code>
        updated → notation preview highlights the current svara</li>
      <li>AudioEngine fires <code>noteOn</code> / <code>noteOff</code> → piano visualizer
        lights keys</li>
      <li>sequence ends → <code>sequenceEnd</code> event → stores reset to ready state</li>
    </ol>
  </section>

  <!-- ──────────────────────────── KNOWN CONSTRAINTS ──────────────────────── -->
  <section>
    <h2>known constraints & design decisions</h2>

    <ul class="bullets">
      <li>
        <strong>AudioContext user-gesture requirement</strong> — browsers require a user action
        before creating an AudioContext. <code>audioEngine.init()</code> is called inside the Play
        handler, never at module load time.
      </li>
      <li>
        <strong>one oscillator per note</strong> — polyphony is unlimited; every
        <code>playSvara</code> call spawns a new oscillator. oscillators are cheap in the Web Audio
        API and clean themselves up via <code>onended</code>. there is no voice-stealing system.
      </li>
      <li>
        <strong>duration is always 1 akshara</strong> — the parser sets <code>duration: 1</code>
        for every svara. the notation syntax does not yet express held notes (e.g. a svara worth
        2 beats). this is a planned extension.
      </li>
      <li>
        <strong>no gamakam</strong> — ornaments (gamakam, meend, kan svaras) are not modelled.
        every note is a plain sustained tone at its fundamental frequency.
      </li>
      <li>
        <strong>Svelte 5 reactivity rules</strong> — reactive state for template rendering uses
        <code>$state()</code> runes and <code>Record&lt;string, T&gt;</code> for key-maps (not
        <code>Set</code>/<code>Map</code> which are untracked). transient visual states (key press
        animations) use direct DOM <code>element.style</code> writes.
      </li>
      <li>
        <strong>legacy JS files</strong> — <code>notation_parser.js</code> and
        <code>svara_frequencies.js</code> predate the TypeScript migration. they are intentionally
        kept as-is and imported via typed ESM facades. rewriting them in TS is a future task.
      </li>
      <li>
        <strong>no persistence</strong> — notation text is not saved across sessions. the only
        persistence is <code>sessionStorage</code> for settings (key: <code>paadugajala-settings</code>).
      </li>
    </ul>
  </section>

</article>

<style>
  .doc {
    color: #d4d4d8;
    padding-bottom: 6rem;
  }

  .doc-header {
    margin-bottom: 3rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #1e1e2e;
  }

  .doc-title {
    font-size: 1.6rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    margin: 0 0 0.5rem;
    color: #e4e4e7;
  }

  .doc-subtitle {
    font-size: 0.82rem;
    color: #52525b;
    margin: 0;
    letter-spacing: 0.04em;
    line-height: 1.6;
  }

  section {
    margin-bottom: 3rem;
  }

  h2 {
    font-size: 0.95rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: lowercase;
    color: #a78bfa;
    margin: 0 0 1rem;
    padding-bottom: 0.4rem;
    border-bottom: 1px solid #1e1e2e;
  }

  h3 {
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    color: #71717a;
    text-transform: lowercase;
    margin: 1.5rem 0 0.6rem;
  }

  p {
    font-size: 0.82rem;
    line-height: 1.8;
    color: #a1a1aa;
    margin: 0 0 0.75rem;
  }

  strong {
    color: #d4d4d8;
    font-weight: 500;
  }

  em {
    color: #c4b5fd;
    font-style: italic;
  }

  code {
    font-family: inherit;
    font-size: 0.78rem;
    background: #18181b;
    color: #c4b5fd;
    padding: 0.1em 0.35em;
    border-radius: 3px;
    border: 1px solid #27272a;
  }

  ol, ul {
    font-size: 0.82rem;
    line-height: 1.8;
    color: #a1a1aa;
    padding-left: 1.5rem;
    margin: 0.5rem 0 0.75rem;
  }

  li code {
    background: #18181b;
    border-color: #27272a;
  }

  ul.bullets {
    list-style: none;
    padding-left: 0;
  }

  ul.bullets li {
    padding: 0.6rem 0.75rem;
    border-left: 2px solid #27272a;
    margin-bottom: 0.5rem;
    background: #0d0d10;
  }

  ul.bullets li strong {
    display: block;
    margin-bottom: 0.2rem;
    color: #d4d4d8;
    font-size: 0.8rem;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.78rem;
    margin: 0.75rem 0 1rem;
    background: #0d0d10;
  }

  th {
    text-align: left;
    padding: 0.5rem 0.75rem;
    color: #52525b;
    font-weight: 400;
    letter-spacing: 0.08em;
    border-bottom: 1px solid #27272a;
    white-space: nowrap;
  }

  td {
    padding: 0.45rem 0.75rem;
    color: #a1a1aa;
    border-bottom: 1px solid #18181b;
    vertical-align: top;
    line-height: 1.6;
  }

  tr:hover td {
    background: #111115;
  }

  /* Code blocks */
  .code-block {
    background: #0d0d10;
    border: 1px solid #1e1e2e;
    border-radius: 4px;
    padding: 1rem 1.25rem;
    margin: 0.75rem 0 1rem;
    overflow-x: auto;
  }

  .code-block pre {
    margin: 0;
    font-size: 0.75rem;
    line-height: 1.7;
    color: #a1a1aa;
    font-family: inherit;
    white-space: pre;
  }

  /* Flow diagrams */
  .diagram {
    padding: 1.25rem;
    background: #0d0d10;
    border: 1px solid #1e1e2e;
    border-radius: 4px;
    margin: 0.75rem 0 1rem;
    overflow-x: auto;
  }

  .flow-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .box {
    font-size: 0.72rem;
    padding: 0.3rem 0.65rem;
    background: #18181b;
    border: 1px solid #27272a;
    border-radius: 3px;
    color: #71717a;
    white-space: nowrap;
    letter-spacing: 0.04em;
  }

  .box.accent {
    border-color: #4c1d95;
    color: #c4b5fd;
    background: #1a0a2e;
  }

  .arrow {
    color: #3f3f46;
    font-size: 0.8rem;
    flex-shrink: 0;
  }
</style>
