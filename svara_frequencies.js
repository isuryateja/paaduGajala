/**
 * Carnatic Music Svara (Note) Frequency Mappings
 * 
 * This file defines the complete frequency mappings for all Carnatic svaras
 * across the three main octaves (sthaayis): Mandra, Madhya, and Taara.
 * 
 * Reference Standard: A4 = 440Hz (Equal Temperament - 12 Tone)
 * Tonic (Sa): C (approximately 261.63 Hz in Madhya sthaayi)
 * 
 * @author Carnatic Music Theory Research
 * @version 1.0.0
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
  sa:  { ratio: 1/1,    fraction: '1/1',    decimal: 1.000 },
  ri1: { ratio: 16/15,  fraction: '16/15',  decimal: 1.067 },  // Shuddha Rishabham
  ri2: { ratio: 9/8,    fraction: '9/8',    decimal: 1.125 },  // Chatusruti Rishabham
  ri3: { ratio: 6/5,    fraction: '6/5',    decimal: 1.200 },  // Shatshruti Rishabham
  ga2: { ratio: 81/64,  fraction: '81/64',  decimal: 1.266 },  // Sadharana Gandharam (alt)
  ga3: { ratio: 5/4,    fraction: '5/4',    decimal: 1.250 },  // Antara Gandharam
  ma1: { ratio: 4/3,    fraction: '4/3',    decimal: 1.333 },  // Shuddha Madhyamam
  ma2: { ratio: 45/32,  fraction: '45/32',  decimal: 1.406 },  // Prati Madhyamam
  pa:  { ratio: 3/2,    fraction: '3/2',    decimal: 1.500 },  // Panchamam
  da1: { ratio: 8/5,    fraction: '8/5',    decimal: 1.600 },  // Shuddha Dhaivatam
  da2: { ratio: 5/3,    fraction: '5/3',    decimal: 1.667 },  // Chatusruti Dhaivatam
  da2_alt: { ratio: 27/16, fraction: '27/16', decimal: 1.688 }, // Alternative
  ni2: { ratio: 16/9,   fraction: '16/9',   decimal: 1.778 },  // Kaisiki Nishadham
  ni3: { ratio: 15/8,   fraction: '15/8',   decimal: 1.875 },  // Kakali Nishadham
};

// ============================================================================
// SVARA FREQUENCY MAPPINGS
// ============================================================================

/**
 * Complete frequency mappings for all Carnatic svaras
 * 
 * Notation:
 *   - స. (dot below) = Mandra sthaayi (lower octave)
 *   - స (no dot)     = Madhya sthaayi (middle octave)  
 *   - స̇ (dot above)  = Taara sthaayi (higher octave)
 * 
 * Each svara object contains:
 *   - frequency: Hz value for the note
 *   - western: Western note equivalent
 *   - semitones: Offset from Sa (0-11)
 *   - name: Full Carnatic name
 */
const SVARA_FREQUENCIES = {
  // ==========================================================================
  // SHADJAM (స) - The tonic/foundation note
  // ==========================================================================
  'స.': {  // Mandra sthaayi (lower octave)
    frequency: 130.81,
    western: 'C3',
    semitones: 0,
    name: 'Shadjam (Mandra)',
    octave: 'mandara'
  },
  'స': {   // Madhya sthaayi (middle octave)
    frequency: 261.63,
    western: 'C4',
    semitones: 0,
    name: 'Shadjam (Madhya)',
    octave: 'madhya'
  },
  'స̇': {  // Taara sthaayi (higher octave)
    frequency: 523.25,
    western: 'C5',
    semitones: 0,
    name: 'Shadjam (Taara)',
    octave: 'taara'
  },

  // ==========================================================================
  // RISHABHAM (రి) - Second note (3 variations)
  // ==========================================================================
  // Shuddha Rishabham (Ri1)
  'రి1.': {
    frequency: 138.59,
    western: 'C#3/Db3',
    semitones: 1,
    name: 'Shuddha Rishabham (Mandra)',
    octave: 'mandara'
  },
  'రి1': {
    frequency: 277.18,
    western: 'C#4/Db4',
    semitones: 1,
    name: 'Shuddha Rishabham (Madhya)',
    octave: 'madhya'
  },
  'రి1̇': {
    frequency: 554.37,
    western: 'C#5/Db5',
    semitones: 1,
    name: 'Shuddha Rishabham (Taara)',
    octave: 'taara'
  },

  // Chatusruti Rishabham (Ri2) - Same as Shuddha Gandharam (Ga1)
  'రి2.': {
    frequency: 146.83,
    western: 'D3',
    semitones: 2,
    name: 'Chatusruti Rishabham (Mandra)',
    octave: 'mandara',
    equivalent: 'గ1.'
  },
  'రి2': {
    frequency: 293.66,
    western: 'D4',
    semitones: 2,
    name: 'Chatusruti Rishabham (Madhya)',
    octave: 'madhya',
    equivalent: 'గ1'
  },
  'రి2̇': {
    frequency: 587.33,
    western: 'D5',
    semitones: 2,
    name: 'Chatusruti Rishabham (Taara)',
    octave: 'taara',
    equivalent: 'గ1̇'
  },

  // Shatshruti Rishabham (Ri3) - Same as Sadharana Gandharam (Ga2)
  'రి3.': {
    frequency: 155.56,
    western: 'D#3/Eb3',
    semitones: 3,
    name: 'Shatshruti Rishabham (Mandra)',
    octave: 'mandara',
    equivalent: 'గ2.'
  },
  'రి3': {
    frequency: 311.13,
    western: 'D#4/Eb4',
    semitones: 3,
    name: 'Shatshruti Rishabham (Madhya)',
    octave: 'madhya',
    equivalent: 'గ2'
  },
  'రి3̇': {
    frequency: 622.25,
    western: 'D#5/Eb5',
    semitones: 3,
    name: 'Shatshruti Rishabham (Taara)',
    octave: 'taara',
    equivalent: 'గ2̇'
  },

  // ==========================================================================
  // GANDHARAM (గ) - Third note (3 variations)
  // ==========================================================================
  // Shuddha Gandharam (Ga1) - Same as Chatusruti Rishabham (Ri2)
  'గ1.': {
    frequency: 146.83,
    western: 'D3',
    semitones: 2,
    name: 'Shuddha Gandharam (Mandra)',
    octave: 'mandara',
    equivalent: 'రి2.'
  },
  'గ1': {
    frequency: 293.66,
    western: 'D4',
    semitones: 2,
    name: 'Shuddha Gandharam (Madhya)',
    octave: 'madhya',
    equivalent: 'రి2'
  },
  'గ1̇': {
    frequency: 587.33,
    western: 'D5',
    semitones: 2,
    name: 'Shuddha Gandharam (Taara)',
    octave: 'taara',
    equivalent: 'రి2̇'
  },

  // Sadharana Gandharam (Ga2) - Same as Shatshruti Rishabham (Ri3)
  'గ2.': {
    frequency: 155.56,
    western: 'D#3/Eb3',
    semitones: 3,
    name: 'Sadharana Gandharam (Mandra)',
    octave: 'mandara',
    equivalent: 'రి3.'
  },
  'గ2': {
    frequency: 311.13,
    western: 'D#4/Eb4',
    semitones: 3,
    name: 'Sadharana Gandharam (Madhya)',
    octave: 'madhya',
    equivalent: 'రి3'
  },
  'గ2̇': {
    frequency: 622.25,
    western: 'D#5/Eb5',
    semitones: 3,
    name: 'Sadharana Gandharam (Taara)',
    octave: 'taara',
    equivalent: 'రి3̇'
  },

  // Antara Gandharam (Ga3)
  'గ3.': {
    frequency: 164.81,
    western: 'E3',
    semitones: 4,
    name: 'Antara Gandharam (Mandra)',
    octave: 'mandara'
  },
  'గ3': {
    frequency: 329.63,
    western: 'E4',
    semitones: 4,
    name: 'Antara Gandharam (Madhya)',
    octave: 'madhya'
  },
  'గ3̇': {
    frequency: 659.26,
    western: 'E5',
    semitones: 4,
    name: 'Antara Gandharam (Taara)',
    octave: 'taara'
  },

  // ==========================================================================
  // MADHYAMAM (మ) - Fourth note (2 variations)
  // ==========================================================================
  // Shuddha Madhyamam (Ma1)
  'మ1.': {
    frequency: 174.61,
    western: 'F3',
    semitones: 5,
    name: 'Shuddha Madhyamam (Mandra)',
    octave: 'mandara'
  },
  'మ1': {
    frequency: 349.23,
    western: 'F4',
    semitones: 5,
    name: 'Shuddha Madhyamam (Madhya)',
    octave: 'madhya'
  },
  'మ1̇': {
    frequency: 698.46,
    western: 'F5',
    semitones: 5,
    name: 'Shuddha Madhyamam (Taara)',
    octave: 'taara'
  },

  // Prati Madhyamam (Ma2)
  'మ2.': {
    frequency: 185.00,
    western: 'F#3/Gb3',
    semitones: 6,
    name: 'Prati Madhyamam (Mandra)',
    octave: 'mandara'
  },
  'మ2': {
    frequency: 369.99,
    western: 'F#4/Gb4',
    semitones: 6,
    name: 'Prati Madhyamam (Madhya)',
    octave: 'madhya'
  },
  'మ2̇': {
    frequency: 739.99,
    western: 'F#5/Gb5',
    semitones: 6,
    name: 'Prati Madhyamam (Taara)',
    octave: 'taara'
  },

  // ==========================================================================
  // PANCHAMAM (ప) - Fifth note (fixed/prakruti svara)
  // ==========================================================================
  'ప.': {
    frequency: 196.00,
    western: 'G3',
    semitones: 7,
    name: 'Panchamam (Mandra)',
    octave: 'mandara'
  },
  'ప': {
    frequency: 392.00,
    western: 'G4',
    semitones: 7,
    name: 'Panchamam (Madhya)',
    octave: 'madhya'
  },
  'ప̇': {
    frequency: 783.99,
    western: 'G5',
    semitones: 7,
    name: 'Panchamam (Taara)',
    octave: 'taara'
  },

  // ==========================================================================
  // DHAIVATAM (ద) - Sixth note (3 variations)
  // ==========================================================================
  // Shuddha Dhaivatam (Da1)
  'ద1.': {
    frequency: 207.65,
    western: 'G#3/Ab3',
    semitones: 8,
    name: 'Shuddha Dhaivatam (Mandra)',
    octave: 'mandara'
  },
  'ద1': {
    frequency: 415.30,
    western: 'G#4/Ab4',
    semitones: 8,
    name: 'Shuddha Dhaivatam (Madhya)',
    octave: 'madhya'
  },
  'ద1̇': {
    frequency: 830.61,
    western: 'G#5/Ab5',
    semitones: 8,
    name: 'Shuddha Dhaivatam (Taara)',
    octave: 'taara'
  },

  // Chatusruti Dhaivatam (Da2) - Same as Shuddha Nishadham (Ni1)
  'ద2.': {
    frequency: 220.00,
    western: 'A3',
    semitones: 9,
    name: 'Chatusruti Dhaivatam (Mandra)',
    octave: 'mandara',
    equivalent: 'ని1.'
  },
  'ద2': {
    frequency: 440.00,
    western: 'A4',
    semitones: 9,
    name: 'Chatusruti Dhaivatam (Madhya)',
    octave: 'madhya',
    equivalent: 'ని1',
    note: 'Reference pitch A4 = 440Hz'
  },
  'ద2̇': {
    frequency: 880.00,
    western: 'A5',
    semitones: 9,
    name: 'Chatusruti Dhaivatam (Taara)',
    octave: 'taara',
    equivalent: 'ని1̇'
  },

  // Shatshruti Dhaivatam (Da3) - Same as Kaisiki Nishadham (Ni2)
  'ద3.': {
    frequency: 233.08,
    western: 'A#3/Bb3',
    semitones: 10,
    name: 'Shatshruti Dhaivatam (Mandra)',
    octave: 'mandara',
    equivalent: 'ని2.'
  },
  'ద3': {
    frequency: 466.16,
    western: 'A#4/Bb4',
    semitones: 10,
    name: 'Shatshruti Dhaivatam (Madhya)',
    octave: 'madhya',
    equivalent: 'ని2'
  },
  'ద3̇': {
    frequency: 932.33,
    western: 'A#5/Bb5',
    semitones: 10,
    name: 'Shatshruti Dhaivatam (Taara)',
    octave: 'taara',
    equivalent: 'ని2̇'
  },

  // ==========================================================================
  // NISHADHAM (ని) - Seventh note (3 variations)
  // ==========================================================================
  // Shuddha Nishadham (Ni1) - Same as Chatusruti Dhaivatam (Da2)
  'ని1.': {
    frequency: 220.00,
    western: 'A3',
    semitones: 9,
    name: 'Shuddha Nishadham (Mandra)',
    octave: 'mandara',
    equivalent: 'ద2.'
  },
  'ని1': {
    frequency: 440.00,
    western: 'A4',
    semitones: 9,
    name: 'Shuddha Nishadham (Madhya)',
    octave: 'madhya',
    equivalent: 'ద2',
    note: 'Reference pitch A4 = 440Hz'
  },
  'ని1̇': {
    frequency: 880.00,
    western: 'A5',
    semitones: 9,
    name: 'Shuddha Nishadham (Taara)',
    octave: 'taara',
    equivalent: 'ద2̇'
  },

  // Kaisiki Nishadham (Ni2) - Same as Shatshruti Dhaivatam (Da3)
  'ని2.': {
    frequency: 233.08,
    western: 'A#3/Bb3',
    semitones: 10,
    name: 'Kaisiki Nishadham (Mandra)',
    octave: 'mandara',
    equivalent: 'ద3.'
  },
  'ని2': {
    frequency: 466.16,
    western: 'A#4/Bb4',
    semitones: 10,
    name: 'Kaisiki Nishadham (Madhya)',
    octave: 'madhya',
    equivalent: 'ద3'
  },
  'ని2̇': {
    frequency: 932.33,
    western: 'A#5/Bb5',
    semitones: 10,
    name: 'Kaisiki Nishadham (Taara)',
    octave: 'taara',
    equivalent: 'ద3̇'
  },

  // Kakali Nishadham (Ni3)
  'ని3.': {
    frequency: 246.94,
    western: 'B3',
    semitones: 11,
    name: 'Kakali Nishadham (Mandra)',
    octave: 'mandara'
  },
  'ని3': {
    frequency: 493.88,
    western: 'B4',
    semitones: 11,
    name: 'Kakali Nishadham (Madhya)',
    octave: 'madhya'
  },
  'ని3̇': {
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
 * @param {string} svara - Svara name (e.g., 'స', 'రి1', 'గ2', etc.)
 * @param {string} octave - Octave name ('mandara', 'madhya', 'taara')
 * @returns {number} Frequency in Hz
 */
function getSvaraFrequency(svara, octave = 'madhya') {
  const octaveSuffix = {
    'mandara': '.',
    'madhya': '',
    'taara': '̇'
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
 * @param {string} svara - Svara name (e.g., 'స', 'రి1', 'గ2', etc.)
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
  const octaveKey = octave === 'mandara' ? '.' : octave === 'taara' ? '̇' : '';
  
  let nearestSvara = null;
  let minDiff = Infinity;
  
  for (const [key, data] of Object.entries(SVARA_FREQUENCIES)) {
    if (key.endsWith(octaveKey) || (octave === 'madhya' && !key.includes('.') && !key.includes('̇'))) {
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
  // Chakra 1: Indu (Ma1, Ri1, Ga1, Da1, Ni1)
  kanakangi: {
    name: 'Kanakangi',
    arohana: ['స', 'రి1', 'గ1', 'మ1', 'ప', 'ద1', 'ని1', 'స̇'],
    avarohana: ['స̇', 'ని1', 'ద1', 'ప', 'మ1', 'గ1', 'రి1', 'స']
  },
  
  // Chakra 6: Rutu (Ma1, Ri2, Ga2, Da2, Ni2) - parent of Shankarabharanam
  shankarabharanam: {
    name: 'Shankarabharanam',
    arohana: ['స', 'రి2', 'గ3', 'మ1', 'ప', 'ద2', 'ని3', 'స̇'],
    avarohana: ['స̇', 'ని3', 'ద2', 'ప', 'మ1', 'గ3', 'రి2', 'స']
  },
  
  // Chakra 7: Rishi (Ma2, Ri1, Ga1, Da1, Ni1)
  salagam: {
    name: 'Salagam',
    arohana: ['స', 'రి1', 'గ1', 'మ2', 'ప', 'ద1', 'ని1', 'స̇'],
    avarohana: ['స̇', 'ని1', 'ద1', 'ప', 'మ2', 'గ1', 'రి1', 'స']
  },
  
  // Chakra 12: Aditya (Ma2, Ri2, Ga2, Da2, Ni2) - parent of Kalyani
  kalyani: {
    name: 'Kalyani',
    arohana: ['స', 'రి2', 'గ3', 'మ2', 'ప', 'ద2', 'ని3', 'స̇'],
    avarohana: ['స̇', 'ని3', 'ద2', 'ప', 'మ2', 'గ3', 'రి2', 'స']
  },
  
  // Mayamalavagowla - important for lessons
  mayamalavagowla: {
    name: 'Mayamalavagowla',
    arohana: ['స', 'రి1', 'గ3', 'మ1', 'ప', 'ద1', 'ని3', 'స̇'],
    avarohana: ['స̇', 'ని3', 'ద1', 'ప', 'మ1', 'గ3', 'రి1', 'స']
  },
  
  // Kharaharapriya - popular raga
  kharaharapriya: {
    name: 'Kharaharapriya',
    arohana: ['స', 'రి2', 'గ2', 'మ1', 'ప', 'ద2', 'ని2', 'స̇'],
    avarohana: ['స̇', 'ని2', 'ద2', 'ప', 'మ1', 'గ2', 'రి2', 'స']
  },
  
  // Hanumatodi - popular raga
  hanumatodi: {
    name: 'Hanumatodi',
    arohana: ['స', 'రి1', 'గ2', 'మ1', 'ప', 'ద1', 'ని2', 'స̇'],
    avarohana: ['స̇', 'ని2', 'ద1', 'ప', 'మ1', 'గ2', 'రి1', 'స']
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
