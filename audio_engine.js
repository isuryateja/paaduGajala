/**
 * Carnatic Music Audio Engine
 * 
 * A Web Audio API-based sound engine for playing Carnatic music svaras (notes).
 * Features precise frequency control, ADSR envelopes, sequence playback,
 * and visual synchronization events.
 * 
 * @author Carnatic Music Audio Research
 * @version 1.0.0
 */

// ============================================================================
// AUDIO ENGINE CLASS
// ============================================================================

/**
 * AudioEngine - Main class for generating and controlling Carnatic music sounds
 * 
 * Usage:
 *   const engine = new AudioEngine();
 *   await engine.init();  // Required due to browser autoplay policies
 *   
 *   // Play a single note
 *   engine.playSvara('స', 'madhya', 1.0);
 *   
 *   // Play a sequence
 *   engine.playSequence([
 *     { svara: 'స', octave: 'madhya', duration: 0.5 },
 *     { svara: 'రి2', octave: 'madhya', duration: 0.5 },
 *     { svara: 'గ3', octave: 'madhya', duration: 1.0 }
 *   ], 120);
 */
class AudioEngine {
  /**
   * Creates a new AudioEngine instance
   * @param {Object} options - Configuration options
   * @param {string} options.waveform - Oscillator waveform ('sine', 'triangle', 'sawtooth', 'square')
   * @param {Object} options.envelope - ADSR envelope settings
   * @param {number} options.masterVolume - Master volume (0.0 to 1.0)
   * @param {string} options.tuning - Tuning system ('equal' or 'just')
   */
  constructor(options = {}) {
    // Audio Context (created in init())
    this.audioContext = null;
    this.isInitialized = false;
    
    // Master output chain
    this.masterGain = null;
    this.compressor = null;
    
    // Configuration
    this.config = {
      // Waveform type: 'sine' for pure tone, 'triangle' for slightly richer
      waveform: options.waveform || 'triangle',
      
      // ADSR Envelope settings (in seconds)
      envelope: {
        attack: options.envelope?.attack ?? 0.02,   // Quick attack for responsiveness
        decay: options.envelope?.decay ?? 0.05,     // Short decay to sustain level
        sustain: options.envelope?.sustain ?? 0.7,  // Sustain level (0-1)
        release: options.envelope?.release ?? 0.15  // Release time
      },
      
      // Master volume
      masterVolume: options.masterVolume ?? 0.7,
      
      // Tuning system
      tuning: options.tuning || 'equal', // 'equal' or 'just'
      
      // Base frequency for Sa (can be adjusted for different shrutis)
      baseFrequency: options.baseFrequency ?? 261.6255653005986
    };
    
    // Playback state
    this.activeVoices = new Map();  // Currently playing voices
    this.isPlaying = false;
    this.currentSequence = null;
    this.sequenceTimeout = null;
    
    // Tempo control (BPM)
    this.tempo = 120;
    this.beatDuration = 60 / this.tempo; // Duration of one beat in seconds
    
    // Event callbacks for visual synchronization
    this.eventListeners = {
      noteOn: [],
      noteOff: [],
      sequenceStart: [],
      sequenceEnd: [],
      ready: []
    };
    
    // Bind methods
    this._scheduleNote = this._scheduleNote.bind(this);
  }
  
  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  /**
   * Initialize the AudioContext and audio chain
   * Must be called after user interaction due to browser autoplay policies
   * @returns {Promise<boolean>} True if initialization successful
   */
  async init() {
    if (this.isInitialized) {
      return true;
    }
    
    try {
      // Create AudioContext with cross-browser support
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('Web Audio API not supported in this browser');
      }
      
      this.audioContext = new AudioContextClass({
        latencyHint: 'interactive',  // Optimize for low latency
        sampleRate: 44100
      });
      
      // Create master gain for volume control
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.config.masterVolume;
      
      // Create compressor to prevent clipping and even out dynamics
      this.compressor = this.audioContext.createDynamicsCompressor();
      this.compressor.threshold.value = -24;    // Start compressing at -24dB
      this.compressor.knee.value = 30;          // Soft knee
      this.compressor.ratio.value = 12;         // Compression ratio
      this.compressor.attack.value = 0.003;     // Fast attack
      this.compressor.release.value = 0.25;     // Moderate release
      
      // Connect audio chain: compressor -> masterGain -> destination
      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);
      
      // Handle suspended state (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      this.isInitialized = true;
      this._emit('ready', { audioContext: this.audioContext });
      
      console.log('AudioEngine initialized successfully');
      return true;
      
    } catch (error) {
      console.error('AudioEngine initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Resume audio context (useful after browser suspension)
   * @returns {Promise<void>}
   */
  async resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
  
  /**
   * Suspend audio context (pause processing)
   * @returns {Promise<void>}
   */
  async suspend() {
    if (this.audioContext && this.audioContext.state === 'running') {
      await this.audioContext.suspend();
    }
  }
  
  // ============================================================================
  // EVENT SYSTEM
  // ============================================================================
  
  /**
   * Register an event listener
   * @param {string} event - Event name ('noteOn', 'noteOff', 'sequenceStart', 'sequenceEnd', 'ready')
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.eventListeners[event]) {
      throw new Error(`Unknown event: ${event}`);
    }
    
    this.eventListeners[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.eventListeners[event].indexOf(callback);
      if (index > -1) {
        this.eventListeners[event].splice(index, 1);
      }
    };
  }
  
  /**
   * Emit an event to all registered listeners
   * @param {string} event - Event name
   * @param {*} data - Event data
   * @private
   */
  _emit(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }
  
  // ============================================================================
  // FREQUENCY CALCULATION
  // ============================================================================
  
  /**
   * Get frequency for a svara using the configured tuning system
   * @param {string} svara - Svara name (e.g., 'స', 'రి1', 'గ3')
   * @param {string} octave - Octave ('mandara', 'madhya', 'taara')
   * @returns {number} Frequency in Hz
   */
  getFrequency(svara, octave = 'madhya') {
    if (this.config.tuning === 'just') {
      return this._getJustIntonationFrequency(svara, octave);
    }
    return this._getEqualTemperamentFrequency(svara, octave);
  }
  
  /**
   * Get frequency using equal temperament
   * @private
   */
  _getEqualTemperamentFrequency(svara, octave) {
    const octaveSuffix = {
      'mandara': '.',
      'madhya': '',
      'taara': '̇'
    };
    
    const key = svara + octaveSuffix[octave];
    
    // Use global SVARA_FREQUENCIES if available, otherwise calculate
    if (typeof SVARA_FREQUENCIES !== 'undefined' && SVARA_FREQUENCIES[key]) {
      return SVARA_FREQUENCIES[key].frequency;
    }
    
    // Fallback calculation
    return this._calculateFrequency(svara, octave);
  }
  
  /**
   * Get frequency using just intonation ratios
   * @private
   */
  _getJustIntonationFrequency(svara, octave) {
    // Map svara names to just intonation ratio keys
    const ratioMap = {
      'స': 'sa',
      'రి1': 'ri1', 'గ1': 'ri2',
      'రి2': 'ri2', 'గ2': 'ri3',
      'రి3': 'ri3', 'గ3': 'ga3',
      'మ1': 'ma1', 'మ2': 'ma2',
      'ప': 'pa',
      'ద1': 'da1', 'ని1': 'da2',
      'ద2': 'da2', 'ని2': 'da3',
      'ద3': 'da3', 'ని3': 'ni3'
    };
    
    const ratioKey = ratioMap[svara];
    if (!ratioKey || typeof JUST_INTONATION_RATIOS === 'undefined') {
      return this._getEqualTemperamentFrequency(svara, octave);
    }
    
    const ratio = JUST_INTONATION_RATIOS[ratioKey]?.ratio;
    if (!ratio) {
      return this._getEqualTemperamentFrequency(svara, octave);
    }
    
    // Apply octave multiplier
    const octaveMultiplier = {
      'mandara': 0.5,
      'madhya': 1.0,
      'taara': 2.0
    };
    
    return this.config.baseFrequency * ratio * octaveMultiplier[octave];
  }
  
  /**
   * Calculate frequency from scratch (fallback method)
   * @private
   */
  _calculateFrequency(svara, octave) {
    // Semitone offsets from Sa
    const semitoneMap = {
      'స': 0,
      'రి1': 1, 'గ1': 2,
      'రి2': 2, 'గ2': 3,
      'రి3': 3, 'గ3': 4,
      'మ1': 5, 'మ2': 6,
      'ప': 7,
      'ద1': 8, 'ని1': 9,
      'ద2': 9, 'ని2': 10,
      'ద3': 10, 'ని3': 11
    };
    
    const semitones = semitoneMap[svara];
    if (semitones === undefined) {
      throw new Error(`Unknown svara: ${svara}`);
    }
    
    const octaveMultiplier = {
      'mandara': 0.5,
      'madhya': 1.0,
      'taara': 2.0
    };
    
    const semitoneRatio = 1.0594630943592953;
    return this.config.baseFrequency * Math.pow(semitoneRatio, semitones) * octaveMultiplier[octave];
  }
  
  // ============================================================================
  // VOICE MANAGEMENT
  // ============================================================================
  
  /**
   * Create a voice (oscillator + envelope) for playing a note
   * @param {number} frequency - Frequency in Hz
   * @param {number} startTime - When to start (AudioContext time)
   * @param {number} duration - Note duration in seconds
   * @param {number} velocity - Note velocity/volume (0.0 to 1.0)
   * @returns {Object} Voice object with control methods
   * @private
   */
  _createVoice(frequency, startTime, duration, velocity = 1.0) {
    const ctx = this.audioContext;
    const env = this.config.envelope;
    
    // Create oscillator
    const oscillator = ctx.createOscillator();
    oscillator.type = this.config.waveform;
    oscillator.frequency.value = frequency;
    
    // Create envelope gain node
    const envelopeGain = ctx.createGain();
    envelopeGain.gain.value = 0; // Start silent
    
    // Create voice gain for velocity
    const voiceGain = ctx.createGain();
    voiceGain.gain.value = velocity;
    
    // Connect chain: oscillator -> envelopeGain -> voiceGain -> compressor
    oscillator.connect(envelopeGain);
    envelopeGain.connect(voiceGain);
    voiceGain.connect(this.compressor);
    
    // Calculate envelope timing
    const attackEnd = startTime + env.attack;
    const decayEnd = attackEnd + env.decay;
    const releaseStart = startTime + duration;
    const releaseEnd = releaseStart + env.release;
    
    // Schedule envelope
    const gainParam = envelopeGain.gain;
    
    // Attack: 0 to 1
    gainParam.setValueAtTime(0, startTime);
    gainParam.linearRampToValueAtTime(1, attackEnd);
    
    // Decay: 1 to sustain level
    gainParam.exponentialRampToValueAtTime(env.sustain, decayEnd);
    
    // Sustain: hold until release
    gainParam.setValueAtTime(env.sustain, releaseStart);
    
    // Release: sustain to 0
    gainParam.exponentialRampToValueAtTime(0.001, releaseEnd);
    
    // Schedule oscillator start/stop
    oscillator.start(startTime);
    oscillator.stop(releaseEnd + 0.1); // Stop after release completes
    
    // Create voice object
    const voiceId = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const voice = {
      id: voiceId,
      oscillator,
      envelopeGain,
      voiceGain,
      frequency,
      startTime,
      duration,
      releaseEnd,
      
      // Stop the voice early
      stop: (when = ctx.currentTime) => {
        try {
          const releaseDuration = env.release;
          const actualReleaseStart = Math.max(when, ctx.currentTime);
          const actualReleaseEnd = actualReleaseStart + releaseDuration;
          
          // Cancel scheduled values and do release
          gainParam.cancelScheduledValues(actualReleaseStart);
          gainParam.setValueAtTime(gainParam.value, actualReleaseStart);
          gainParam.exponentialRampToValueAtTime(0.001, actualReleaseEnd);
          
          oscillator.stop(actualReleaseEnd + 0.05);
        } catch (e) {
          // Voice may already be stopped
        }
        this.activeVoices.delete(voiceId);
      }
    };
    
    // Auto-cleanup when done
    oscillator.onended = () => {
      this.activeVoices.delete(voiceId);
      try {
        oscillator.disconnect();
        envelopeGain.disconnect();
        voiceGain.disconnect();
      } catch (e) {
        // Already disconnected
      }
    };
    
    this.activeVoices.set(voiceId, voice);
    return voice;
  }
  
  // ============================================================================
  // NOTE PLAYBACK
  // ============================================================================
  
  /**
   * Play a single svara (note)
   * @param {string} svara - Svara name (e.g., 'స', 'రి1', 'గ3')
   * @param {string} octave - Octave ('mandara', 'madhya', 'taara')
   * @param {number} duration - Duration in beats (or seconds if tempo not set)
   * @param {number} velocity - Note velocity (0.0 to 1.0)
   * @param {number} when - When to play (AudioContext time, default: now)
   * @returns {Object} Voice object
   */
  playSvara(svara, octave = 'madhya', duration = 1.0, velocity = 1.0, when = null) {
    if (!this.isInitialized) {
      console.warn('AudioEngine not initialized. Call init() first.');
      return null;
    }
    
    // Ensure context is running
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    // Calculate timing
    const startTime = when !== null ? when : this.audioContext.currentTime;
    const durationSeconds = duration * this.beatDuration;
    
    // Get frequency
    const frequency = this.getFrequency(svara, octave);
    
    // Create and schedule voice
    const voice = this._createVoice(frequency, startTime, durationSeconds, velocity);
    
    // Emit noteOn event for visual sync
    // Emit slightly before actual start for visual preparation
    const emitTime = Math.max(0, (startTime - this.audioContext.currentTime) * 1000);
    setTimeout(() => {
      this._emit('noteOn', {
        svara,
        octave,
        frequency,
        voiceId: voice.id,
        startTime,
        duration: durationSeconds
      });
    }, emitTime);
    
    // Emit noteOff event
    const noteOffTime = emitTime + (durationSeconds * 1000);
    setTimeout(() => {
      this._emit('noteOff', {
        svara,
        octave,
        voiceId: voice.id
      });
    }, noteOffTime);
    
    return voice;
  }
  
  /**
   * Play a note by frequency directly
   * @param {number} frequency - Frequency in Hz
   * @param {number} duration - Duration in beats
   * @param {number} velocity - Note velocity (0.0 to 1.0)
   * @param {number} when - When to play (AudioContext time)
   * @returns {Object} Voice object
   */
  playFrequency(frequency, duration = 1.0, velocity = 1.0, when = null) {
    if (!this.isInitialized) {
      console.warn('AudioEngine not initialized. Call init() first.');
      return null;
    }
    
    const startTime = when !== null ? when : this.audioContext.currentTime;
    const durationSeconds = duration * this.beatDuration;
    
    const voice = this._createVoice(frequency, startTime, durationSeconds, velocity);
    
    return voice;
  }
  
  // ============================================================================
  // SEQUENCE PLAYBACK
  // ============================================================================
  
  /**
   * Play a sequence of notes
   * @param {Array} notes - Array of note objects
   * @param {number} tempo - Tempo in BPM (beats per minute)
   * @param {Object} options - Playback options
   * @param {boolean} options.loop - Whether to loop the sequence
   * @param {number} options.loopCount - Number of times to loop
   * @returns {Object} Sequence controller
   * 
   * Note object format:
   *   {
   *     svara: 'స',        // Svara name
   *     octave: 'madhya',  // Octave
   *     duration: 1.0,     // Duration in beats
   *     velocity: 1.0,     // Optional: note velocity
   *     rest: false        // Optional: if true, this is a rest (silence)
   *   }
   */
  playSequence(notes, tempo = 120, options = {}) {
    if (!this.isInitialized) {
      console.warn('AudioEngine not initialized. Call init() first.');
      return null;
    }
    
    // Stop any existing sequence
    this.stopSequence();
    
    // Update tempo
    this.setTempo(tempo);
    
    const { loop = false, loopCount = Infinity } = options;
    let currentLoop = 0;
    let isCancelled = false;
    
    // Sequence state
    const sequenceState = {
      notes,
      tempo,
      loop,
      loopCount,
      currentIndex: 0,
      isPlaying: true,
      cancel: () => { isCancelled = true; }
    };
    
    this.currentSequence = sequenceState;
    this._emit('sequenceStart', { notes, tempo });
    
    // Schedule all notes using Web Audio API's precise timing
    const scheduleSequence = () => {
      if (isCancelled) return;
      
      const startTime = this.audioContext.currentTime;
      let currentTime = startTime;
      
      for (let i = 0; i < notes.length; i++) {
        if (isCancelled) break;
        
        const note = notes[i];
        
        // Handle rest
        if (note.rest) {
          currentTime += note.duration * this.beatDuration;
          continue;
        }
        
        // Schedule the note
        this._scheduleNote(note, currentTime);
        
        // Advance time
        currentTime += note.duration * this.beatDuration;
      }
      
      // Handle looping
      const sequenceDuration = (currentTime - startTime) * 1000;
      
      if (loop && currentLoop < loopCount - 1 && !isCancelled) {
        currentLoop++;
        this.sequenceTimeout = setTimeout(scheduleSequence, sequenceDuration);
      } else {
        // Sequence complete
        this.sequenceTimeout = setTimeout(() => {
          if (!isCancelled) {
            this._emit('sequenceEnd', { notes, tempo });
            sequenceState.isPlaying = false;
            this.currentSequence = null;
          }
        }, sequenceDuration);
      }
    };
    
    // Start scheduling
    scheduleSequence();
    
    return sequenceState;
  }
  
  /**
   * Schedule a single note for sequence playback
   * @param {Object} note - Note object
   * @param {number} when - When to play (AudioContext time)
   * @private
   */
  _scheduleNote(note, when) {
    const { svara, octave = 'madhya', duration = 1.0, velocity = 1.0 } = note;
    this.playSvara(svara, octave, duration, velocity, when);
  }
  
  /**
   * Stop the current sequence
   */
  stopSequence() {
    if (this.sequenceTimeout) {
      clearTimeout(this.sequenceTimeout);
      this.sequenceTimeout = null;
    }
    
    if (this.currentSequence) {
      this.currentSequence.cancel();
      this.currentSequence.isPlaying = false;
      this._emit('sequenceEnd', { cancelled: true });
      this.currentSequence = null;
    }
  }
  
  // ============================================================================
  // GLOBAL CONTROLS
  // ============================================================================
  
  /**
   * Stop all playing sounds
   */
  stopAll() {
    // Stop sequence if playing
    this.stopSequence();
    
    // Stop all active voices
    this.activeVoices.forEach(voice => {
      voice.stop();
    });
    this.activeVoices.clear();
  }
  
  /**
   * Set the tempo (BPM)
   * @param {number} bpm - Beats per minute
   */
  setTempo(bpm) {
    this.tempo = Math.max(30, Math.min(300, bpm)); // Clamp between 30-300 BPM
    this.beatDuration = 60 / this.tempo;
  }
  
  /**
   * Set master volume
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  setVolume(volume) {
    this.config.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.config.masterVolume;
    }
  }
  
  /**
   * Set envelope parameters
   * @param {Object} envelope - Envelope settings
   */
  setEnvelope(envelope) {
    Object.assign(this.config.envelope, envelope);
  }
  
  /**
   * Set waveform type
   * @param {string} waveform - 'sine', 'triangle', 'sawtooth', 'square'
   */
  setWaveform(waveform) {
    const validWaveforms = ['sine', 'triangle', 'sawtooth', 'square'];
    if (validWaveforms.includes(waveform)) {
      this.config.waveform = waveform;
    }
  }
  
  /**
   * Set tuning system
   * @param {string} tuning - 'equal' or 'just'
   */
  setTuning(tuning) {
    if (tuning === 'equal' || tuning === 'just') {
      this.config.tuning = tuning;
    }
  }
  
  /**
   * Set base frequency (shruti)
   * @param {number} frequency - Base Sa frequency in Hz
   */
  setBaseFrequency(frequency) {
    this.config.baseFrequency = frequency;
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  /**
   * Get current audio context time
   * @returns {number} Current time in seconds
   */
  getCurrentTime() {
    return this.audioContext ? this.audioContext.currentTime : 0;
  }
  
  /**
   * Check if audio is currently playing
   * @returns {boolean}
   */
  isAudioPlaying() {
    return this.activeVoices.size > 0 || 
           (this.currentSequence && this.currentSequence.isPlaying);
  }
  
  /**
   * Get number of active voices
   * @returns {number}
   */
  getActiveVoiceCount() {
    return this.activeVoices.size;
  }
  
  /**
   * Dispose of the audio engine and free resources
   */
  dispose() {
    this.stopAll();
    
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    this.isInitialized = false;
    this.eventListeners = {
      noteOn: [],
      noteOff: [],
      sequenceStart: [],
      sequenceEnd: [],
      ready: []
    };
  }
}

// ============================================================================
// PRESET CONFIGURATIONS
// ============================================================================

/**
 * Preset configurations for different instrument sounds
 */
const AudioEnginePresets = {
  /**
   * Pure sine wave - flute-like, very clean
   */
  flute: {
    waveform: 'sine',
    envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.2 },
    masterVolume: 0.8
  },
  
  /**
   * Triangle wave - veena-like, slightly richer
   */
  veena: {
    waveform: 'triangle',
    envelope: { attack: 0.02, decay: 0.05, sustain: 0.75, release: 0.15 },
    masterVolume: 0.75
  },
  
  /**
   * Sawtooth wave - violin-like, rich harmonics
   */
  violin: {
    waveform: 'sawtooth',
    envelope: { attack: 0.1, decay: 0.2, sustain: 0.7, release: 0.3 },
    masterVolume: 0.6
  },
  
  /**
   * Square wave - harmonium-like, hollow sound
   */
  harmonium: {
    waveform: 'square',
    envelope: { attack: 0.03, decay: 0.1, sustain: 0.8, release: 0.2 },
    masterVolume: 0.5
  },
  
  /**
   * Plucked string - short attack, quick decay
   */
  plucked: {
    waveform: 'triangle',
    envelope: { attack: 0.005, decay: 0.3, sustain: 0.3, release: 0.1 },
    masterVolume: 0.8
  }
};

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example 1: Basic usage
 */
async function exampleBasicUsage() {
  // Create engine with default settings
  const engine = new AudioEngine();
  
  // Initialize (must be called after user interaction)
  await engine.init();
  
  // Play single notes
  engine.playSvara('స', 'madhya', 1.0);  // Play Sa for 1 beat
  engine.playSvara('రి2', 'madhya', 0.5); // Play Ri for 0.5 beats
  engine.playSvara('గ3', 'madhya', 0.5);  // Play Ga for 0.5 beats
  
  // Change tempo and play sequence
  engine.setTempo(100);
  
  const sequence = engine.playSequence([
    { svara: 'స', octave: 'madhya', duration: 1 },
    { svara: 'రి2', octave: 'madhya', duration: 1 },
    { svara: 'గ3', octave: 'madhya', duration: 1 },
    { svara: 'మ1', octave: 'madhya', duration: 1 },
    { svara: 'ప', octave: 'madhya', duration: 1 },
    { svara: 'ద2', octave: 'madhya', duration: 1 },
    { svara: 'ని3', octave: 'madhya', duration: 1 },
    { svara: 'స̇', octave: 'madhya', duration: 2 }
  ], 100);
}

/**
 * Example 2: Visual synchronization
 */
function exampleVisualSync() {
  const engine = new AudioEngine();
  
  // Register event listeners for visual feedback
  engine.on('noteOn', (data) => {
    console.log(`Note ON: ${data.svara} (${data.octave}) - ${data.frequency.toFixed(2)} Hz`);
    // Highlight piano key, update UI, etc.
    // highlightKey(data.svara, data.octave);
  });
  
  engine.on('noteOff', (data) => {
    console.log(`Note OFF: ${data.svara} (${data.octave})`);
    // Remove highlight from piano key
    // unhighlightKey(data.svara, data.octave);
  });
  
  engine.on('sequenceStart', (data) => {
    console.log('Sequence started');
  });
  
  engine.on('sequenceEnd', (data) => {
    console.log('Sequence ended');
  });
  
  return engine;
}

/**
 * Example 3: Using presets
 */
async function examplePresets() {
  // Create engine with flute preset
  const flute = new AudioEngine(AudioEnginePresets.flute);
  await flute.init();
  
  // Create engine with veena preset
  const veena = new AudioEngine(AudioEnginePresets.veena);
  await veena.init();
  
  // Play same note with different timbres
  flute.playSvara('స', 'madhya', 1.0);
  veena.playSvara('స', 'madhya', 1.0);
}

/**
 * Example 4: Raga playback
 */
async function exampleRagaPlayback() {
  const engine = new AudioEngine();
  await engine.init();
  
  // Shankarabharanam arohana (ascending)
  const shankarabharanamArohana = [
    { svara: 'స', octave: 'madhya', duration: 1 },
    { svara: 'రి2', octave: 'madhya', duration: 1 },
    { svara: 'గ3', octave: 'madhya', duration: 1 },
    { svara: 'మ1', octave: 'madhya', duration: 1 },
    { svara: 'ప', octave: 'madhya', duration: 1 },
    { svara: 'ద2', octave: 'madhya', duration: 1 },
    { svara: 'ని3', octave: 'madhya', duration: 1 },
    { svara: 'స̇', octave: 'madhya', duration: 2 }
  ];
  
  engine.playSequence(shankarabharanamArohana, 80);
}

/**
 * Example 5: Just intonation vs Equal temperament
 */
async function exampleTuningComparison() {
  // Equal temperament (default)
  const equalEngine = new AudioEngine({ tuning: 'equal' });
  await equalEngine.init();
  
  // Just intonation
  const justEngine = new AudioEngine({ tuning: 'just' });
  await justEngine.init();
  
  // Play chord with both tunings
  console.log('Equal temperament:');
  equalEngine.playSvara('స', 'madhya', 2.0);
  equalEngine.playSvara('గ3', 'madhya', 2.0);
  equalEngine.playSvara('ప', 'madhya', 2.0);
  
  setTimeout(() => {
    console.log('Just intonation:');
    justEngine.playSvara('స', 'madhya', 2.0);
    justEngine.playSvara('గ3', 'madhya', 2.0);
    justEngine.playSvara('ప', 'madhya', 2.0);
  }, 2500);
}

// ============================================================================
// EXPORTS
// ============================================================================

// For ES6 modules
// export { AudioEngine, AudioEnginePresets };

// For CommonJS
// module.exports = { AudioEngine, AudioEnginePresets };

// For browser global
// window.CarnaticAudio = { AudioEngine, AudioEnginePresets };
