/**
 * Carnatic Music Notation Parser for Telugu Script
 * 
 * This parser handles:
 * - Telugu svaras (స, రి, గ, మ, ప, ద, ని)
 * - Octave indicators (dots above/below for taara/mandra sthaayi)
 * - Rhythm markers (।, ॥)
 * - Multiple input formats (tab-separated, space-separated)
 * 
 * @author Music Notation Parser
 * @version 1.0.0
 */

// ============================================================================
// CONSTANTS AND CHARACTER DEFINITIONS
// ============================================================================

/**
 * Telugu svara characters mapping
 */
const SVARA_CHARS = {
    'స': 'sa',
    'రి': 'ri',
    'గ': 'ga',
    'మ': 'ma',
    'ప': 'pa',
    'ద': 'da',
    'ని': 'ni'
};

/**
 * Reverse mapping for svara names
 */
const SVARA_NAMES = {
    'sa': 'స',
    'ri': 'రి',
    'ga': 'గ',
    'ma': 'మ',
    'pa': 'ప',
    'da': 'ద',
    'ni': 'ని'
};

/**
 * Octave indicator characters
 * Note: These are combining characters that appear with the svara
 */
const OCTAVE_MARKERS = {
    // Dot below - Mandra sthaayi (lower octave)
    DOT_BELOW: '\u0323',  // Combining dot below (˙)
    // Dot above - Taara sthaayi (higher octave)
    DOT_ABOVE: '\u0307',  // Combining dot above (̇)
};

/**
 * Octave names in Carnatic music
 */
const OCTAVE_NAMES = {
    MANDRA: 'mandra',   // Lower octave (dot below)
    MADHYA: 'madhya',   // Middle octave (no dot)
    TAARA: 'taara'      // Higher octave (dot above)
};

/**
 * Rhythm marker characters
 */
const RHYTHM_MARKERS = {
    SINGLE: '।',   // Single beat separator (danda)
    DOUBLE: '॥',   // End of line/phrase marker (double danda)
    SINGLE_LATIN: '|',  // Alternative single beat
    DOUBLE_LATIN: '||'  // Alternative double beat
};

/**
 * Whitespace characters to ignore during parsing
 */
const WHITESPACE_CHARS = /\s/;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a character is a Telugu svara
 * @param {string} char - Character to check
 * @returns {boolean} True if it's a svara character
 */
function isSvaraChar(char) {
    return char in SVARA_CHARS;
}

/**
 * Check if a character is a Telugu svara base (without modifiers)
 * This handles the case where Telugu characters may be composed of multiple Unicode points
 * @param {string} char - Character to check
 * @returns {boolean} True if it's a base svara character
 */
function isSvaraBase(char) {
    // Check for base Telugu svara characters
    const baseChars = ['స', 'ర', 'ి', 'గ', 'మ', 'ప', 'ద', 'న'];
    return baseChars.includes(char);
}

/**
 * Check if a character/string is a rhythm marker
 * @param {string} char - Character to check
 * @returns {boolean} True if it's a rhythm marker
 */
function isRhythmMarker(char) {
    return char === RHYTHM_MARKERS.SINGLE || 
           char === RHYTHM_MARKERS.DOUBLE ||
           char === RHYTHM_MARKERS.SINGLE_LATIN ||
           char === RHYTHM_MARKERS.DOUBLE_LATIN;
}

/**
 * Check if a character is a whitespace
 * @param {string} char - Character to check
 * @returns {boolean} True if it's whitespace
 */
function isWhitespace(char) {
    return WHITESPACE_CHARS.test(char);
}

/**
 * Check if a character is a combining dot below (mandra sthaayi)
 * @param {string} char - Character to check
 * @returns {boolean} True if it's a dot below
 */
function isDotBelow(char) {
    return char === OCTAVE_MARKERS.DOT_BELOW;
}

/**
 * Check if a character is a combining dot above (taara sthaayi)
 * @param {string} char - Character to check
 * @returns {boolean} True if it's a dot above
 */
function isDotAbove(char) {
    return char === OCTAVE_MARKERS.DOT_ABOVE;
}

/**
 * Check if a character is an octave modifier
 * @param {string} char - Character to check
 * @returns {boolean} True if it's an octave modifier
 */
function isOctaveModifier(char) {
    return isDotBelow(char) || isDotAbove(char);
}

/**
 * Get the octave based on modifiers
 * @param {boolean} hasDotBelow - Has dot below marker
 * @param {boolean} hasDotAbove - Has dot above marker
 * @returns {string} Octave name
 */
function getOctave(hasDotBelow, hasDotAbove) {
    if (hasDotBelow) return OCTAVE_NAMES.MANDRA;
    if (hasDotAbove) return OCTAVE_NAMES.TAARA;
    return OCTAVE_NAMES.MADHYA;
}

/**
 * Normalize input text - clean up common issues
 * @param {string} text - Input text
 * @returns {string} Normalized text
 */
function normalizeInput(text) {
    if (!text || typeof text !== 'string') {
        return '';
    }
    
    return text
        // Normalize line endings
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Convert tabs to spaces for consistent parsing
        .replace(/\t/g, ' ')
        // Trim leading/trailing whitespace
        .trim();
}

// ============================================================================
// TOKENIZER
// ============================================================================

/**
 * Token types for the parser
 */
const TOKEN_TYPES = {
    SVARA: 'svara',
    RHYTHM_MARKER: 'rhythm_marker',
    NEWLINE: 'newline',
    WHITESPACE: 'whitespace',
    UNKNOWN: 'unknown'
};

/**
 * Tokenize the input text into individual tokens
 * @param {string} text - Input notation text
 * @returns {Array} Array of token objects
 */
function tokenize(text) {
    const normalizedText = normalizeInput(text);
    const tokens = [];
    let i = 0;
    
    while (i < normalizedText.length) {
        const char = normalizedText[i];
        const nextChar = normalizedText[i + 1] || '';
        const nextNextChar = normalizedText[i + 2] || '';
        
        // Check for double rhythm marker first (॥)
        if (char + nextChar === RHYTHM_MARKERS.DOUBLE) {
            tokens.push({
                type: TOKEN_TYPES.RHYTHM_MARKER,
                value: RHYTHM_MARKERS.DOUBLE,
                subtype: 'double',
                position: i
            });
            i += 2;
            continue;
        }
        
        // Check for single rhythm marker (।)
        if (char === RHYTHM_MARKERS.SINGLE) {
            tokens.push({
                type: TOKEN_TYPES.RHYTHM_MARKER,
                value: RHYTHM_MARKERS.SINGLE,
                subtype: 'single',
                position: i
            });
            i++;
            continue;
        }
        
        // Check for newline
        if (char === '\n') {
            tokens.push({
                type: TOKEN_TYPES.NEWLINE,
                value: char,
                position: i
            });
            i++;
            continue;
        }
        
        // Check for whitespace
        if (isWhitespace(char)) {
            tokens.push({
                type: TOKEN_TYPES.WHITESPACE,
                value: char,
                position: i
            });
            i++;
            continue;
        }
        
        // Check for Telugu svara with modifiers
        // Telugu characters can be complex - handle the common patterns
        const svaraResult = extractSvara(normalizedText, i);
        if (svaraResult) {
            tokens.push({
                type: TOKEN_TYPES.SVARA,
                svara: svaraResult.svara,
                octave: svaraResult.octave,
                raw: svaraResult.raw,
                position: i
            });
            i = svaraResult.nextIndex;
            continue;
        }
        
        // Unknown character - skip but log
        tokens.push({
            type: TOKEN_TYPES.UNKNOWN,
            value: char,
            position: i
        });
        i++;
    }
    
    return tokens;
}

/**
 * Extract a svara with its octave modifiers from the text
 * Handles Telugu character composition and octave dots
 * @param {string} text - Full text
 * @param {number} startIndex - Starting position
 * @returns {Object|null} Svara info or null if not a svara
 */
function extractSvara(text, startIndex) {
    let i = startIndex;
    let svaraBase = '';
    let hasDotBelow = false;
    let hasDotAbove = false;
    let rawChars = '';
    
    // Collect the base svara character(s)
    // Telugu "రి" is composed of "ర" + "ి" (consonant + vowel sign)
    while (i < text.length) {
        const char = text[i];
        
        // Check for base Telugu characters
        if (!svaraBase && isSvaraBase(char)) {
            svaraBase += char;
            rawChars += char;
            i++;
            
            // Check for vowel sign following the consonant (for రి)
            if (char === 'ర' && i < text.length && text[i] === 'ి') {
                svaraBase += text[i];
                rawChars += text[i];
                i++;
            }
            break;
        } else if (!svaraBase) {
            // Not a svara start
            break;
        } else {
            break;
        }
    }
    
    // Check if we have a valid svara
    if (!svaraBase || !isSvaraChar(svaraBase)) {
        return null;
    }
    
    // Look for octave modifiers (combining characters that follow)
    while (i < text.length) {
        const char = text[i];
        if (isDotBelow(char)) {
            hasDotBelow = true;
            rawChars += char;
            i++;
        } else if (isDotAbove(char)) {
            hasDotAbove = true;
            rawChars += char;
            i++;
        } else {
            break;
        }
    }
    
    return {
        svara: svaraBase,
        octave: getOctave(hasDotBelow, hasDotAbove),
        raw: rawChars,
        nextIndex: i
    };
}

// ============================================================================
// MAIN PARSER
// ============================================================================

/**
 * Parse Carnatic music notation in Telugu script
 * 
 * @param {string} text - The notation text to parse
 * @param {Object} options - Parsing options
 * @param {boolean} options.includeWhitespace - Include whitespace tokens (default: false)
 * @param {boolean} options.includeUnknown - Include unknown character tokens (default: false)
 * @param {number} options.defaultDuration - Default note duration (default: 1)
 * @returns {Array} Array of parsed note objects
 * 
 * Output format:
 * [
 *   {
 *     type: 'svara',
 *     svara: 'స',           // Telugu svara character
 *     svaraLatin: 'sa',      // Latin representation
 *     octave: 'madhya',      // 'mandra' | 'madhya' | 'taara'
 *     duration: 1,           // Note duration
 *     beatMarker: null | '।' | '॥',  // Associated rhythm marker
 *     line: 1,               // Line number in input
 *     position: 0            // Character position in input
 *   },
 *   {
 *     type: 'rhythm_marker',
 *     marker: '।',
 *     subtype: 'single',
 *     line: 1,
 *     position: 10
 *   }
 * ]
 */
function parseNotation(text, options = {}) {
    const {
        includeWhitespace = false,
        includeUnknown = false,
        defaultDuration = 1
    } = options;
    
    // Tokenize the input
    const tokens = tokenize(text);
    
    // Process tokens into structured notes
    const notes = [];
    let currentLine = 1;
    let lastSvaraIndex = -1;  // Track last svara for attaching rhythm markers
    
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        
        switch (token.type) {
            case TOKEN_TYPES.SVARA:
                const note = {
                    type: 'svara',
                    svara: token.svara,
                    svaraLatin: SVARA_CHARS[token.svara],
                    octave: token.octave,
                    duration: defaultDuration,
                    beatMarker: null,
                    line: currentLine,
                    position: token.position
                };
                notes.push(note);
                lastSvaraIndex = notes.length - 1;
                break;
                
            case TOKEN_TYPES.RHYTHM_MARKER:
                // Attach rhythm marker to the previous svara if exists
                if (lastSvaraIndex >= 0 && notes[lastSvaraIndex].type === 'svara') {
                    notes[lastSvaraIndex].beatMarker = token.value;
                }
                
                // Also add as separate marker for rhythm tracking
                notes.push({
                    type: 'rhythm_marker',
                    marker: token.value,
                    subtype: token.subtype,
                    line: currentLine,
                    position: token.position
                });
                break;
                
            case TOKEN_TYPES.NEWLINE:
                currentLine++;
                lastSvaraIndex = -1;  // Reset for new line
                notes.push({
                    type: 'newline',
                    line: currentLine - 1,
                    position: token.position
                });
                break;
                
            case TOKEN_TYPES.WHITESPACE:
                if (includeWhitespace) {
                    notes.push({
                        type: 'whitespace',
                        line: currentLine,
                        position: token.position
                    });
                }
                break;
                
            case TOKEN_TYPES.UNKNOWN:
                if (includeUnknown) {
                    notes.push({
                        type: 'unknown',
                        value: token.value,
                        line: currentLine,
                        position: token.position
                    });
                }
                break;
        }
    }
    
    return notes;
}

// ============================================================================
// ADVANCED PARSING FUNCTIONS
// ============================================================================

/**
 * Parse notation and group by lines/phrases
 * @param {string} text - Input notation
 * @returns {Array} Array of lines, each containing notes
 */
function parseNotationByLines(text) {
    const notes = parseNotation(text);
    const lines = [];
    let currentLine = [];
    
    for (const note of notes) {
        if (note.type === 'newline') {
            if (currentLine.length > 0) {
                lines.push([...currentLine]);
                currentLine = [];
            }
        } else if (note.type === 'svara') {
            currentLine.push(note);
        }
    }
    
    // Don't forget the last line
    if (currentLine.length > 0) {
        lines.push(currentLine);
    }
    
    return lines;
}

/**
 * Parse notation and get only svara notes (filter out rhythm markers)
 * @param {string} text - Input notation
 * @returns {Array} Array of svara note objects
 */
function parseSvarasOnly(text) {
    const notes = parseNotation(text);
    return notes.filter(note => note.type === 'svara');
}

/**
 * Get statistics about the notation
 * @param {string} text - Input notation
 * @returns {Object} Statistics object
 */
function getNotationStats(text) {
    const notes = parseNotation(text);
    const svaras = notes.filter(n => n.type === 'svara');
    
    const stats = {
        totalNotes: svaras.length,
        totalRhythmMarkers: notes.filter(n => n.type === 'rhythm_marker').length,
        svaraCounts: {},
        octaveDistribution: {
            mandra: 0,
            madhya: 0,
            taara: 0
        },
        lines: parseNotationByLines(text).length
    };
    
    for (const svara of svaras) {
        // Count by svara type
        const latinName = svara.svaraLatin;
        stats.svaraCounts[latinName] = (stats.svaraCounts[latinName] || 0) + 1;
        
        // Count by octave
        stats.octaveDistribution[svara.octave]++;
    }
    
    return stats;
}

/**
 * Convert parsed notation back to string representation
 * @param {Array} notes - Parsed notes array
 * @param {Object} options - Formatting options
 * @returns {string} Formatted notation string
 */
function notationToString(notes, options = {}) {
    const { 
        useLatin = false,
        separator = ' '
    } = options;
    
    let result = '';
    let currentLine = 1;
    
    for (const note of notes) {
        if (note.type === 'svara') {
            // Add separator if not at start of line
            if (result && !result.endsWith('\n') && !result.endsWith(separator)) {
                result += separator;
            }
            
            // Add the svara
            let svaraStr = useLatin ? note.svaraLatin : note.svara;
            
            // Add octave indicators
            if (note.octave === 'mandra') {
                svaraStr += '\u0323';  // Dot below
            } else if (note.octave === 'taara') {
                svaraStr += '\u0307';  // Dot above
            }
            
            result += svaraStr;
            
            // Add beat marker if present
            if (note.beatMarker) {
                result += separator + note.beatMarker;
            }
        } else if (note.type === 'rhythm_marker' && !note.marker) {
            // Standalone rhythm marker
            if (result && !result.endsWith(separator)) {
                result += separator;
            }
            result += note.marker;
        } else if (note.type === 'newline') {
            result += '\n';
            currentLine++;
        }
    }
    
    return result.trim();
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a svara with specified octave
 * @param {string} svara - Base svara (e.g., 'స', 'sa')
 * @param {string} octave - Octave ('mandra', 'madhya', 'taara')
 * @returns {string} Svara with octave indicator
 */
function createSvara(svara, octave = 'madhya') {
    // Convert latin to telugu if needed
    let teluguSvara = svara;
    if (svara in SVARA_NAMES) {
        teluguSvara = SVARA_NAMES[svara];
    }
    
    let result = teluguSvara;
    
    if (octave === 'mandra') {
        result += OCTAVE_MARKERS.DOT_BELOW;
    } else if (octave === 'taara') {
        result += OCTAVE_MARKERS.DOT_ABOVE;
    }
    
    return result;
}

/**
 * Validate notation text
 * @param {string} text - Input notation
 * @returns {Object} Validation result
 */
function validateNotation(text) {
    const issues = [];
    const tokens = tokenize(text);
    
    let hasSvara = false;
    let hasRhythmMarker = false;
    
    for (const token of tokens) {
        if (token.type === TOKEN_TYPES.SVARA) {
            hasSvara = true;
        } else if (token.type === TOKEN_TYPES.RHYTHM_MARKER) {
            hasRhythmMarker = true;
        } else if (token.type === TOKEN_TYPES.UNKNOWN) {
            issues.push({
                type: 'warning',
                message: `Unknown character at position ${token.position}: "${token.value}"`,
                position: token.position
            });
        }
    }
    
    if (!hasSvara) {
        issues.push({
            type: 'error',
            message: 'No svara characters found in notation'
        });
    }
    
    return {
        valid: issues.filter(i => i.type === 'error').length === 0,
        issues: issues,
        hasSvara,
        hasRhythmMarker
    };
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example 1: Basic parsing
 */
function example1() {
    console.log('='.repeat(60));
    console.log('Example 1: Basic Parsing');
    console.log('='.repeat(60));
    
    const input = `స      	స    	మ    	మ    	।    	రి   	రి   	।    	గ    	గ    	॥`;
    
    console.log('Input:');
    console.log(input);
    console.log('\nParsed Result:');
    
    const result = parseNotation(input);
    console.log(JSON.stringify(result, null, 2));
    
    return result;
}

/**
 * Example 2: Multi-line notation
 */
function example2() {
    console.log('\n' + '='.repeat(60));
    console.log('Example 2: Multi-line Notation');
    console.log('='.repeat(60));
    
    const input = `స స మ మ । రి రি । గ గ ॥
ప ప ద ద । ని ని । స̇ స̇ ॥`;
    
    console.log('Input:');
    console.log(input);
    console.log('\nParsed by Lines:');
    
    const result = parseNotationByLines(input);
    console.log(JSON.stringify(result, null, 2));
    
    return result;
}

/**
 * Example 3: With octave indicators
 */
function example3() {
    console.log('\n' + '='.repeat(60));
    console.log('Example 3: Octave Indicators');
    console.log('='.repeat(60));
    
    // Note: Mandra (dot below) and Taara (dot above) examples
    const input = `స˙ స˙ మ మ । రి˙ రి˙ । గ గ ॥
స స రి రి । గ గ మ̇ మ̇ ॥`;
    
    console.log('Input:');
    console.log(input);
    console.log('\nParsed Svaras with Octaves:');
    
    const result = parseSvarasOnly(input);
    
    for (const note of result) {
        console.log(`${note.svara} (${note.svaraLatin}) - ${note.octave}`);
    }
    
    return result;
}

/**
 * Example 4: Statistics
 */
function example4() {
    console.log('\n' + '='.repeat(60));
    console.log('Example 4: Notation Statistics');
    console.log('='.repeat(60));
    
    const input = `స స మ మ । రి రి । గ గ ॥
ప ప ద ద । ని ని । స̇ స̇ ॥`;
    
    console.log('Input:');
    console.log(input);
    console.log('\nStatistics:');
    
    const stats = getNotationStats(input);
    console.log(JSON.stringify(stats, null, 2));
    
    return stats;
}

/**
 * Example 5: Validation
 */
function example5() {
    console.log('\n' + '='.repeat(60));
    console.log('Example 5: Validation');
    console.log('='.repeat(60));
    
    const validInput = `స రి గ మ । ప ద ని ॥`;
    const invalidInput = `Hello World! 123`;
    
    console.log('Valid Input:', validInput);
    console.log('Validation Result:', validateNotation(validInput));
    
    console.log('\nInvalid Input:', invalidInput);
    console.log('Validation Result:', validateNotation(invalidInput));
}

/**
 * Example 6: Creating notation programmatically
 */
function example6() {
    console.log('\n' + '='.repeat(60));
    console.log('Example 6: Programmatic Notation Creation');
    console.log('='.repeat(60));
    
    // Create a simple sarali varisai pattern
    const pattern = [
        { svara: 'స', octave: 'madhya' },
        { svara: 'రి', octave: 'madhya' },
        { svara: 'గ', octave: 'madhya' },
        { svara: 'మ', octave: 'madhya' },
        { svara: '।', rhythm: true },
        { svara: 'ప', octave: 'madhya' },
        { svara: 'ద', octave: 'madhya' },
        { svara: 'ని', octave: 'madhya' },
        { svara: 'స̇', octave: 'taara' },
        { svara: '॥', rhythm: true, double: true }
    ];
    
    console.log('Pattern:', JSON.stringify(pattern, null, 2));
    
    // Convert to Telugu notation string
    let notation = '';
    for (const item of pattern) {
        if (item.rhythm) {
            notation += item.double ? ' ॥' : ' ।';
        } else {
            notation += ' ' + createSvara(item.svara, item.octave);
        }
    }
    
    console.log('\nGenerated Notation:');
    console.log(notation.trim());
    
    // Parse it back
    console.log('\nParsed Back:');
    const parsed = parseNotation(notation);
    console.log(JSON.stringify(parsed.filter(n => n.type === 'svara'), null, 2));
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// For Node.js/CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        parseNotation,
        parseNotationByLines,
        parseSvarasOnly,
        getNotationStats,
        notationToString,
        createSvara,
        validateNotation,
        tokenize,
        // Constants
        SVARA_CHARS,
        SVARA_NAMES,
        OCTAVE_NAMES,
        RHYTHM_MARKERS,
        TOKEN_TYPES,
        // Helper functions
        isSvaraChar,
        isRhythmMarker,
        getOctave,
        normalizeInput,
        // Examples
        example1,
        example2,
        example3,
        example4,
        example5,
        example6
    };
}

// For browser environments
if (typeof window !== 'undefined') {
    window.CarnaticNotationParser = {
        parseNotation,
        parseNotationByLines,
        parseSvarasOnly,
        getNotationStats,
        notationToString,
        createSvara,
        validateNotation,
        tokenize,
        SVARA_CHARS,
        SVARA_NAMES,
        OCTAVE_NAMES,
        RHYTHM_MARKERS,
        TOKEN_TYPES
    };
}

// ============================================================================
// RUN EXAMPLES IF EXECUTED DIRECTLY
// ============================================================================

if (typeof require !== 'undefined' && require.main === module) {
    console.log('Carnatic Music Notation Parser for Telugu Script');
    console.log('================================================\n');
    
    example1();
    example2();
    example3();
    example4();
    example5();
    example6();
    
    console.log('\n' + '='.repeat(60));
    console.log('All examples completed!');
    console.log('='.repeat(60));
}

// Return the main parser function as the default export
// Note: For ES6 modules, use: export default parseNotation;
// This file uses CommonJS exports for Node.js compatibility
