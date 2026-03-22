/**
 * Carnatic Music Svara (Note) Frequency Mappings
 * 
 * This file defines the complete frequency mappings for all Carnatic svaras
 * across the three main octaves (sthaayis): Mandra, Madhya, and Taara.
 * 
 * Reference Standard: A4 = 440Hz (Equal Temperament - 12 Tone)
 * Tonic (Sa): C (approximately 261.63 Hz in Madhya sthaayi)
 * 
 * Notation: English notation (S, R1, R2, G1, G2, G3, M1, M2, P, D1, D2, D3, N1, N2, N3)
 * 
 * @author Carnatic Music Theory Research
 * @version 2.0.0
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Standard reference pitch - A4 frequency in Hz
 * This is the international standard for concert pitch
 */
const REFERENCE_A4 = 440.0;

/**
 * Base frequency for Sa (Shadjam) in Madhya sthaayi (middle octave)
 * C4 = 261.625565... Hz (derived from A4 = 440Hz)
 */
const BASE_SA_FREQUENCY = 261.6255653005986;

/**
 * Equal temperament semitone ratio: 2^(1/12)
 * The multiplicative factor between adjacent semitones
 */
const SEMITONE_RATIO = 1.0594630943592953;

/**
 * Just Intonation ratios for Carnatic svaras (alternative to equal temperament)
 * These ratios represent the pure harmonic relationships
 */
const JUST_INTONATION_RATIOS = {
  S:  { ratio: 1/1,    fraction: '1/1',    decimal: 1.000 },
  R1: { ratio: 16/15,  fraction: '16/15',  decimal: 1.067 },  // Shuddha Rishabham
  R2: { ratio: 9/8,    fraction: '9/8',    decimal: 1.125 },  // Chatusruti Rishabham
  R3: { ratio: 6/5,    fraction: '6/5',    decimal: 1.200 },  // Shatshruti Rishabham
  G2: { ratio: 81/64,  fraction: '81/64',  decimal: 1.266 },  // Sadharana Gandharam (alt)
  G3: { ratio: 5/4,    fraction: '5/4',    decimal: 1.250 },  // Antara Gandharam
  M1: { ratio: 4/3,    fraction: '4/3',    decimal: 1.333 },  // Shuddha Madhyamam
  M2: { ratio: 45/32,  fraction: '45/32',  decimal: 1.406 },  // Prati Madhyamam
  P:  { ratio: 3/2,    fraction: '3/2',    decimal: 1.500 },  // Panchamam
  D1: { ratio: 8/5,    fraction: '8/5',    decimal: 1.600 },  // Shuddha Dhaivatam
  D2: { ratio: 5/3,    fraction: '5/3',    decimal: 1.667 },  // Chatusruti Dhaivatam
  D2_alt: { ratio: 27/16, fraction: '27/16', decimal: 1.688 }, // Alternative
  N2: { ratio: 16/9,   fraction: '16/9',   decimal: 1.778 },  // Kaisiki Nishadham
  N3: { ratio: 15/8,   fraction: '15/8',   decimal: 1.875 },  // Kakali Nishadham
};

// ============================================================================
// SVARA FREQUENCY MAPPINGS
// ============================================================================

/**
 * Complete frequency mappings for all Carnatic svaras
 * 
 * Notation:
 *   - S. (dot below) = Mandra sthaayi (lower octave)
 *   - S (no dot)     = Madhya sthaayi (middle octave)  
 *   - S' (dot above) = Taara sthaayi (higher octave)
 * 
 * Each svara object contains:
 *   - frequency: Hz value for the note
 *   - western: Western note equivalent
 *   - semitones: Offset from Sa (0-11)
 *   - name: Full Carnatic name
 */
const SVARA_FREQUENCIES = {
  // ==========================================================================
  // SHADJAM (S) - The tonic/foundation note
  // ==========================================================================
  'S.': {  // Mandra sthaayi (lower octave)
    frequency: 130.81,
    western: 'C3',
    semitones: 0,
    name: 'Shadjam (Mandra)',
    octave: 'mandara'
  },
  'S': {   // Madhya sthaayi (middle octave)
    frequency: 261.63,
    western: 'C4',
    semitones: 0,
    name: 'Shadjam (Madhya)',
    octave: 'madhya'
  },
  "S'": {  // Taara sthaayi (higher octave)
    frequency: 523.25,
    western: 'C5',
    semitones: 0,
    name: 'Shadjam (Taara)',
    octave: 'taara'
  },

  // ==========================================================================
  // RISHABHAM (R) - Second note (3 variations)
  // ==========================================================================
  // Shuddha Rishabham (R1)
  'R1.': {
    frequency: 138.59,
    western: 'C#3/Db3',
    semitones: 1,
    name: 'Shuddha Rishabham (Mandra)',
    octave: 'mandara'
  },
  'R1': {
    frequency: 277.18,
    western: 'C#4/Db4',
    semitones: 1,
    name: 'Shuddha Rishabham (Madhya)',
    octave: 'madhya'
  },
  "R1'": {
    frequency: 554.37,
    western: 'C#5/Db5',
    semitones: 1,
    name: 'Shuddha Rishabham (Taara)',
    octave: 'taara'
  },

  // Chatusruti Rishabham (R2) - Same as Shuddha Gandharam (G1)
  'R2.': {
    frequency: 146.83,
    western: 'D3',
    semitones: 2,
    name: 'Chatusruti Rishabham (Mandra)',
    octave: 'mandara',
    equivalent: 'G1.'
  },
  'R2': {
    frequency: 293.66,
    western: 'D4',
    semitones: 2,
    name: 'Chatusruti Rishabham (Madhya)',
    octave: 'madhya',
    equivalent: 'G1'
  },
  "R2'": {
    frequency: 587.33,
    western: 'D5',
    semitones: 2,
    name: 'Chatusruti Rishabham (Taara)',
    octave: 'taara',
    equivalent: "G1'"
  },

  // Shatshruti Rishabham (R3) - Same as Sadharana Gandharam (G2)
  'R3.': {
    frequency: 155.56,
    western: 'D#3/Eb3',
    semitones: 3,
    name: 'Shatshruti Rishabham (Mandra)',
    octave: 'mandara',
    equivalent: 'G2.'
  },
  'R3': {
    frequency: 311.13,
    western: 'D#4/Eb4',
    semitones: 3,
    name: 'Shatshruti Rishabham (Madhya)',
    octave: 'madhya',
    equivalent: 'G2'
  },
  "R3'": {
    frequency: 622.25,
    western: 'D#5/Eb5',
    semitones: 3,
    name: 'Shatshruti Rishabham (Taara)',
    octave: 'taara',
    equivalent: "G2'"
  },

  // ==========================================================================
  // GANDHARAM (G) - Third note (3 variations)
  // ==========================================================================
  // Shuddha Gandharam (G1) - Same as Chatusruti Rishabham (R2)
  'G1.': {
    frequency: 146.83,
    western: 'D3',
    semitones: 2,
    name: 'Shuddha Gandharam (Mandra)',
    octave: 'mandara',
    equivalent: 'R2.'
  },
  'G1': {
    frequency: 293.66,
    western: 'D4',
    semitones: 2,
    name: 'Shuddha Gandharam (Madhya)',
    octave: 'madhya',
    equivalent: 'R2'
  },
  "G1'": {
    frequency: 587.33,
    western: 'D5',
    semitones: 2,
    name: 'Shuddha Gandharam (Taara)',
    octave: 'taara',
    equivalent: "R2'"
  },

  // Sadharana Gandharam (G2) - Same as Shatshruti Rishabham (R3)
  'G2.': {
    frequency: 155.56,
    western: 'D#3/Eb3',
    semitones: 3,
    name: 'Sadharana Gandharam (Mandra)',
    octave: 'mandara',
    equivalent: 'R3.'
  },
  'G2': {
    frequency: 311.13,
    western: 'D#4/Eb4',
    semitones: 3,
    name: 'Sadharana Gandharam (Madhya)',
    octave: 'madhya',
    equivalent: 'R3'
  },
  "G2'": {
    frequency: 622.25,
    western: 'D#5/Eb5',
    semitones: 3,
    name: 'Sadharana Gandharam (Taara)',
    octave: 'taara',
    equivalent: "R3'"
  },

  // Antara Gandharam (G3)
  'G3.': {
    frequency: 164.81,
    western: 'E3',
    semitones: 4,
    name: 'Antara Gandharam (Mandra)',
    octave: 'mandara'
  },
  'G3': {
    frequency: 329.63,
    western: 'E4',
    semitones: 4,
    name: 'Antara Gandharam (Madhya)',
    octave: 'madhya'
  },
  "G3'": {
    frequency: 659.26,
    western: 'E5',
    semitones: 4,
    name: 'Antara Gandharam (Taara)',
    octave: 'taara'
  },

  // ==========================================================================
  // MADHYAMAM (M) - Fourth note (2 variations)
  // ==========================================================================
  // Shuddha Madhyamam (M1)
  'M1.': {
    frequency: 174.61,
    western: 'F3',
    semitones: 5,
    name: 'Shuddha Madhyamam (Mandra)',
    octave: 'mandara'
  },
  'M1': {
    frequency: 349.23,
    western: 'F4',
    semitones: 5,
    name: 'Shuddha Madhyamam (Madhya)',
    octave: 'madhya'
  },
  "M1'": {
    frequency: 698.46,
    western: 'F5',
    semitones: 5,
    name: 'Shuddha Madhyamam (Taara)',
    octave: 'taara'
  },

  // Prati Madhyamam (M2)
  'M2.': {
    frequency: 185.00,
    western: 'F#3/Gb3',
    semitones: 6,
    name: 'Prati Madhyamam (Mandra)',
    octave: 'mandara'
  },
  'M2': {
    frequency: 369.99,
    western: 'F#4/Gb4',
    semitones: 6,
    name: 'Prati Madhyamam (Madhya)',
    octave: 'madhya'
  },
  "M2'": {
    frequency: 739.99,
    western: 'F#5/Gb5',
    semitones: 6,
    name: 'Prati Madhyamam (Taara)',
    octave: 'taara'
  },

  // ==========================================================================
  // PANCHAMAM (P) - Fifth note (fixed/prakruti svara)
  // ==========================================================================
  'P.': {
    frequency: 196.00,
    western: 'G3',
    semitones: 7,
    name: 'Panchamam (Mandra)',
    octave: 'mandara'
  },
  'P': {
    frequency: 392.00,
    western: 'G4',
    semitones: 7,
    name: 'Panchamam (Madhya)',
    octave: 'madhya'
  },
  "P'": {
    frequency: 783.99,
    western: 'G5',
    semitones: 7,
    name: 'Panchamam (Taara)',
    octave: 'taara'
  },

  // ==========================================================================
  // DHAIVATAM (D) - Sixth note (3 variations)
  // ==========================================================================
  // Shuddha Dhaivatam (D1)
  'D1.': {
    frequency: 207.65,
    western: 'G#3/Ab3',
    semitones: 8,
    name: 'Shuddha Dhaivatam (Mandra)',
    octave: 'mandara'
  },
  'D1': {
    frequency: 415.30,
    western: 'G#4/Ab4',
    semitones: 8,
    name: 'Shuddha Dhaivatam (Madhya)',
    octave: 'madhya'
  },
  "D1'": {
    frequency: 830.61,
    western: 'G#5/Ab5',
    semitones: 8,
    name: 'Shuddha Dhaivatam (Taara)',
    octave: 'taara'
  },

  // Chatusruti Dhaivatam (D2) - Same as Shuddha Nishadham (N1)
  'D2.': {
    frequency: 220.00,
    western: 'A3',
    semitones: 9,
    name: 'Chatusruti Dhaivatam (Mandra)',
    octave: 'mandara',
    equivalent: 'N1.'
  },
  'D2': {
    frequency: 440.00,
    western: 'A4',
    semitones: 9,
    name: 'Chatusruti Dhaivatam (Madhya)',
    octave: 'madhya',
    equivalent: 'N1',
    note: 'Reference pitch A4 = 440Hz'
  },
  "D2'": {
    frequency: 880.00,
    western: 'A5',
    semitones: 9,
    name: 'Chatusruti Dhaivatam (Taara)',
    octave: 'taara',
    equivalent: "N1'"
  },

  // Shatshruti Dhaivatam (D3) - Same as Kaisiki Nishadham (N2)
  'D3.': {
    frequency: 233.08,
    western: 'A#3/Bb3',
    semitones: 10,
    name: 'Shatshruti Dhaivatam (Mandra)',
    octave: 'mandara',
    equivalent: 'N2.'
  },
  'D3': {
    frequency: 466.16,
    western: 'A#4/Bb4',
    semitones: 10,
    name: 'Shatshruti Dhaivatam (Madhya)',
    octave: 'madhya',
    equivalent: 'N2'
  },
  "D3'": {
    frequency: 932.33,
    western: 'A#5/Bb5',
    semitones: 10,
    name: 'Shatshruti Dhaivatam (Taara)',
    octave: 'taara',
    equivalent: "N2'"
  },

  // ==========================================================================
  // NISHADHAM (N) - Seventh note (3 variations)
  // ==========================================================================
  // Shuddha Nishadham (N1) - Same as Chatusruti Dhaivatam (D2)
  'N1.': {
    frequency: 220.00,
    western: 'A3',
    semitones: 9,
    name: 'Shuddha Nishadham (Mandra)',
    octave: 'mandara',
    equivalent: 'D2.'
  },
  'N1': {
    frequency: 440.00,
    western: 'A4',
    semitones: 9,
    name: 'Shuddha Nishadham (Madhya)',
    octave: 'madhya',
    equivalent: 'D2',
    note: 'Reference pitch A4 = 440Hz'
  },
  "N1'": {
    frequency: 880.00,
    western: 'A5',
    semitones: 9,
    name: 'Shuddha Nishadham (Taara)',
    octave: 'taara',
    equivalent: "D2'"
  },

  // Kaisiki Nishadham (N2) - Same as Shatshruti Dhaivatam (D3)
  'N2.': {
    frequency: 233.08,
    western: 'A#3/Bb3',
    semitones: 10,
    name: 'Kaisiki Nishadham (Mandra)',
    octave: 'mandara',
    equivalent: 'D3.'
  },
  'N2': {
    frequency: 466.16,
    western: 'A#4/Bb4',
    semitones: 10,
    name: 'Kaisiki Nishadham (Madhya)',
    octave: 'madhya',
    equivalent: 'D3'
  },
  "N2'": {
    frequency: 932.33,
    western: 'A#5/Bb5',
    semitones: 10,
    name: 'Kaisiki Nishadham (Taara)',
    octave: 'taara',
    equivalent: "D3'"
  },

  // Kakali Nishadham (N3)
  'N3.': {
    frequency: 246.94,
    western: 'B3',
    semitones: 11,
    name: 'Kakali Nishadham (Mandra)',
    octave: 'mandara'
  },
  'N3': {
    frequency: 493.88,
    western: 'B4',
    semitones: 11,
    name: 'Kakali Nishadham (Madhya)',
    octave: 'madhya'
  },
  "N3'": {
    frequency: 987.77,
    western: 'B5',
    semitones: 11,
    name: 'Kakali Nishadham (Taara)',
    octave: 'taara'
  },
};

// ============================================================================
// NOTE DURATION CONSTANTS (for rhythm/tala)
// ============================================================================

/**
 * Standard note durations in Carnatic music
 * Based on a default beat (akshara) duration
 */
const NOTE_DURATIONS = {
  /** 
   * Base unit - one akshara (beat)
   * Default: 500ms at 120 BPM
   */
  AKSHARA_MS: 500,
  
  /**
   * One unit (eka) - full beat
   */
  EKA: 1.0,
  
  /**
   * Half unit (ardha) - half beat
   */
  ARDHA: 0.5,
  
  /**
   * Quarter unit (pada) - quarter beat
   */
  PADA: 0.25,
  
  /**
   * Double unit (dvi) - two beats
   */
  DVI: 2.0,
  
  /**
   * Quadruple unit (chatur) - four beats
   */
  CHATUR: 4.0,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get frequency for a specific svara in a specific octave
 * @param {string} svara - Svara name (e.g., 'S', 'R1', 'G2', etc.)
 * @param {string} octave - Octave name ('mandara', 'madhya', 'taara')
 * @returns {number} Frequency in Hz
 */
function getSvaraFrequency(svara, octave = 'madhya') {
  const octaveSuffix = {
    'mandara': '.',
    'madhya': '',
    'taara': "'"
  };
  
  const key = svara + octaveSuffix[octave];
  const svaraData = SVARA_FREQUENCIES[key];
  
  if (!svaraData) {
    throw new Error(`Unknown svara: ${svara} in octave ${octave}`);
  }
  
  return svaraData.frequency;
}

/**
 * Get all frequencies for a specific svara across all octaves
 * @param {string} svara - Svara name (e.g., 'S', 'R1', 'G2', etc.)
 * @returns {Object} Object with mandara, madhya, taara frequencies
 */
function getAllOctaves(svara) {
  return {
    mandara: getSvaraFrequency(svara, 'mandara'),
    madhya: getSvaraFrequency(svara, 'madhya'),
    taara: getSvaraFrequency(svara, 'taara')
  };
}

/**
 * Calculate frequency using just intonation ratio
 * @param {string} svara - Svara name
 * @param {number} baseFreq - Base Sa frequency
 * @returns {number} Calculated frequency
 */
function getJustIntonationFrequency(svara, baseFreq = BASE_SA_FREQUENCY) {
  const ratioData = JUST_INTONATION_RATIOS[svara];
  if (!ratioData) {
    throw new Error(`No just intonation ratio for svara: ${svara}`);
  }
  return baseFreq * ratioData.ratio;
}

/**
 * Convert frequency to nearest svara
 * @param {number} frequency - Input frequency in Hz
 * @param {string} octave - Target octave
 * @returns {Object} Nearest matching svara
 */
function frequencyToSvara(frequency, octave = 'madhya') {
  const octaveKey = octave === 'mandara' ? '.' : octave === 'taara' ? "'" : '';
  
  let nearestSvara = null;
  let minDiff = Infinity;
  
  for (const [key, data] of Object.entries(SVARA_FREQUENCIES)) {
    if (key.endsWith(octaveKey) || (octave === 'madhya' && !key.includes('.') && !key.includes("'"))) {
      const diff = Math.abs(data.frequency - frequency);
      if (diff < minDiff) {
        minDiff = diff;
        nearestSvara = { key, ...data };
      }
    }
  }
  
  return nearestSvara;
}

// ============================================================================
// SVARA SETS FOR COMMON RAGAS (Melakarta parent scales)
// ============================================================================

/**
 * Svara sets for the 72 Melakarta ragas
 * Each raga is defined by its arohana (ascending) and avarohana (descending)
 */
const MELAKARTA_RAGAS = {
  // Chakra 1: Indu (M1, R1, G1, D1, N1)
  kanakangi: {
    name: 'Kanakangi',
    arohana: ['S', 'R1', 'G1', 'M1', 'P', 'D1', 'N1', "S'"],
    avarohana: ["S'", 'N1', 'D1', 'P', 'M1', 'G1', 'R1', 'S']
  },
  
  // Chakra 6: Rutu (M1, R2, G2, D2, N2) - parent of Shankarabharanam
  shankarabharanam: {
    name: 'Shankarabharanam',
    arohana: ['S', 'R2', 'G3', 'M1', 'P', 'D2', 'N3', "S'"],
    avarohana: ["S'", 'N3', 'D2', 'P', 'M1', 'G3', 'R2', 'S']
  },
  
  // Chakra 7: Rishi (M2, R1, G1, D1, N1)
  salagam: {
    name: 'Salagam',
    arohana: ['S', 'R1', 'G1', 'M2', 'P', 'D1', 'N1', "S'"],
    avarohana: ["S'", 'N1', 'D1', 'P', 'M2', 'G1', 'R1', 'S']
  },
  
  // Chakra 12: Aditya (M2, R2, G2, D2, N2) - parent of Kalyani
  kalyani: {
    name: 'Kalyani',
    arohana: ['S', 'R2', 'G3', 'M2', 'P', 'D2', 'N3', "S'"],
    avarohana: ["S'", 'N3', 'D2', 'P', 'M2', 'G3', 'R2', 'S']
  },
  
  // Mayamalavagowla - important for lessons
  mayamalavagowla: {
    name: 'Mayamalavagowla',
    arohana: ['S', 'R1', 'G3', 'M1', 'P', 'D1', 'N3', "S'"],
    avarohana: ["S'", 'N3', 'D1', 'P', 'M1', 'G3', 'R1', 'S']
  },
  
  // Kharaharapriya - popular raga
  kharaharapriya: {
    name: 'Kharaharapriya',
    arohana: ['S', 'R2', 'G2', 'M1', 'P', 'D2', 'N2', "S'"],
    avarohana: ["S'", 'N2', 'D2', 'P', 'M1', 'G2', 'R2', 'S']
  },
  
  // Hanumatodi - popular raga
  hanumatodi: {
    name: 'Hanumatodi',
    arohana: ['S', 'R1', 'G2', 'M1', 'P', 'D1', 'N2', "S'"],
    avarohana: ["S'", 'N2', 'D1', 'P', 'M1', 'G2', 'R1', 'S']
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

// For ES6 modules
// export { SVARA_FREQUENCIES, NOTE_DURATIONS, MELAKARTA_RAGAS, getSvaraFrequency, getAllOctaves };

// For CommonJS
// module.exports = { SVARA_FREQUENCIES, NOTE_DURATIONS, MELAKARTA_RAGAS, getSvaraFrequency, getAllOctaves };

// For browser global
// window.SvaraFrequencies = { SVARA_FREQUENCIES, NOTE_DURATIONS, MELAKARTA_RAGAS, getSvaraFrequency, getAllOctaves };
