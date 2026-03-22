/**
 * Carnatic Music Notation Parser for English Notation
 * 
 * This parser handles:
 * - English svara notation (S, R1, R2, R3, G1, G2, G3, M1, M2, P, D1, D2, D3, N1, N2, N3)
 * - Octave indicators (dots below/above for mandara/taara sthaayi, or . and ' suffixes)
 * - Rhythm markers (|, ||)
 * - Multiple input formats (tab-separated, space-separated)
 * 
 * @author Music Notation Parser
 * @version 2.0.0
 */

// ============================================================================
// CONSTANTS AND CHARACTER DEFINITIONS
// ============================================================================

/**
 * English svara notation mapping
 * Maps notation to full svara names
 */
const SVARA_NOTATION = {
    'S': 'sa',
    'R1': 'ri1',
    'R2': 'ri2',
    'R3': 'ri3',
    'G1': 'ga1',
    'G2': 'ga2',
    'G3': 'ga3',
    'M1': 'ma1',
    'M2': 'ma2',
    'P': 'pa',
    'D1': 'da1',
    'D2': 'da2',
    'D3': 'da3',
    'N1': 'ni1',
    'N2': 'ni2',
    'N3': 'ni3'
};

/**
 * Reverse mapping for svara notation
 */
const SVARA_NAMES = {
    'sa': 'S',
    'ri1': 'R1',
    'ri2': 'R2',
    'ri3': 'R3',
    'ga1': 'G1',
    'ga2': 'G2',
    'ga3': 'G3',
    'ma1': 'M1',
    'ma2': 'M2',
    'pa': 'P',
    'da1': 'D1',
    'da2': 'D2',
    'da3': 'D3',
    'ni1': 'N1',
    'ni2': 'N2',
    'ni3': 'N3'
};

/**
 * Valid svara base characters (first character of any svara)
 */
const SVARA_BASE_CHARS = ['S', 'R', 'G', 'M', 'P', 'D', 'N'];

/**
 * Octave indicator characters
 */
const OCTAVE_MARKERS = {
    // Dot below - Mandra sthaayi (lower octave)
    DOT_BELOW: '\u0323',
    // Dot above - Taara sthaayi (higher octave)
    DOT_ABOVE: '\u0307',
    // Alternative suffixes
    SUFFIX_LOW: '.',
    SUFFIX_HIGH: "'"
};

/**
 * Octave names in Carnatic music
 */
const OCTAVE_NAMES = {
    MANDRA: 'mandra',   // Lower octave
    MADHYA: 'madhya',   // Middle octave
    TAARA: 'taara'      // Higher octave
};

/**
 * Rhythm marker characters
 */
const RHYTHM_MARKERS = {
    SINGLE: '|',   // Single beat separator
    DOUBLE: '||',  // End of line/phrase marker
    SINGLE_UNICODE: '।',   // Unicode single danda
    DOUBLE_UNICODE: '॥'    // Unicode double danda
};

/**
 * Whitespace characters to ignore during parsing
 */
const WHITESPACE_CHARS = /\s/;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a character is a valid svara base character
 * @param {string} char - Character to check
 * @returns {boolean} True if it's a svara base character
 */
function isSvaraBaseChar(char) {
    return SVARA_BASE_CHARS.includes(char);
}

/**
 * Check if a string is a valid svara notation
 * @param {string} str - String to check
 * @returns {boolean} True if it's a valid svara
 */
function isValidSvara(str) {
    return str in SVARA_NOTATION;
}

/**
 * Check if a character/string is a rhythm marker
 * @param {string} char - Character to check
 * @returns {boolean} True if it's a rhythm marker
 */
function isRhythmMarker(char) {
    return char === RHYTHM_MARKERS.SINGLE || 
           char === RHYTHM_MARKERS.SINGLE_UNICODE;
}

/**
 * Check if a string is a double rhythm marker
 * @param {string} str - String to check
 * @returns {boolean} True if it's a double rhythm marker
 */
function isDoubleRhythmMarker(str) {
    return str === RHYTHM_MARKERS.DOUBLE ||
           str === RHYTHM_MARKERS.DOUBLE_UNICODE;
}

/**
 * Check if a character is whitespace
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
    return char === OCTAVE_MARKERS.DOT_BELOW || char === OCTAVE_MARKERS.SUFFIX_LOW;
}

/**
 * Check if a character is a combining dot above (taara sthaayi)
 * @param {string} char - Character to check
 * @returns {boolean} True if it's a dot above
 */
function isDotAbove(char) {
    return char === OCTAVE_MARKERS.DOT_ABOVE || char === OCTAVE_MARKERS.SUFFIX_HIGH;
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
        
        // Check for double rhythm marker first (|| or ॥)
        if (char + nextChar === RHYTHM_MARKERS.DOUBLE ||
            char + nextChar === RHYTHM_MARKERS.DOUBLE_UNICODE) {
            tokens.push({
                type: TOKEN_TYPES.RHYTHM_MARKER,
                value: '||',
                subtype: 'double',
                position: i
            });
            i += 2;
            continue;
        }
        
        // Check for single rhythm marker (| or ।)
        if (char === RHYTHM_MARKERS.SINGLE || char === RHYTHM_MARKERS.SINGLE_UNICODE) {
            tokens.push({
                type: TOKEN_TYPES.RHYTHM_MARKER,
                value: '|',
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
        
        // Check for svara notation
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
    
    // Get the base character (S, R, G, M, P, D, or N)
    const firstChar = text[i];
    if (!isSvaraBaseChar(firstChar)) {
        return null;
    }
    
    svaraBase = firstChar;
    rawChars += firstChar;
    i++;
    
    // Check for number suffix (1, 2, or 3) for R, G, M, D, N
    if (i < text.length) {
        const nextChar = text[i];
        if (['1', '2', '3'].includes(nextChar) && ['R', 'G', 'M', 'D', 'N'].includes(firstChar)) {
            svaraBase += nextChar;
            rawChars += nextChar;
            i++;
        }
    }
    
    // Validate the svara
    if (!isValidSvara(svaraBase)) {
        return null;
    }
    
    // Look for octave modifiers (dots or suffixes that follow)
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
 * Parse Carnatic music notation in English notation
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
 *     svara: 'S',             // Svara notation
 *     svaraName: 'sa',        // Full svara name
 *     octave: 'madhya',       // 'mandra' | 'madhya' | 'taara'
 *     duration: 1,            // Note duration
 *     beatMarker: null | '|' | '||',  // Associated rhythm marker
 *     line: 1,                // Line number in input
 *     position: 0             // Character position in input
 *   },
 *   {
 *     type: 'rhythm_marker',
 *     marker: '|',
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
                    svaraName: SVARA_NOTATION[token.svara],
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
        const svaraName = svara.svara;
        stats.svaraCounts[svaraName] = (stats.svaraCounts[svaraName] || 0) + 1;
        
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
        separator = ' ',
        useOctaveSuffix = true  // Use . and ' instead of combining dots
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
            let svaraStr = note.svara;
            
            // Add octave indicators
            if (useOctaveSuffix) {
                if (note.octave === 'mandra') {
                    svaraStr += '.';
                } else if (note.octave === 'taara') {
                    svaraStr += "'";
                }
            } else {
                if (note.octave === 'mandra') {
                    svaraStr += '\u0323';  // Dot below
                } else if (note.octave === 'taara') {
                    svaraStr += '\u0307';  // Dot above
                }
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
 * @param {string} svara - Base svara (e.g., 'S', 'R1', 'G2', etc.)
 * @param {string} octave - Octave ('mandra', 'madhya', 'taara')
 * @returns {string} Svara with octave indicator
 */
function createSvara(svara, octave = 'madhya') {
    // Validate svara
    if (!isValidSvara(svara)) {
        throw new Error(`Invalid svara: ${svara}`);
    }
    
    let result = svara;
    
    if (octave === 'mandra') {
        result += '.';
    } else if (octave === 'taara') {
        result += "'";
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
            message: 'No svara notation found in input'
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
    
    const input = `S       S     M1    M1    |     R1    R1    |     G1    G1    ||`;
    
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
    
    const input = `S S M1 M1 | R1 R1 | G1 G1 ||
P P D1 D1 | N1 N1 | S' S' ||`;
    
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
    
    // Note: Mandra (dot below/suffix .) and Taara (dot above/suffix ') examples
    const input = `S. S. M1 M1 | R1. R1. | G1 G1 ||
S S R1 R1 | G1 G1 M1' M1' ||`;
    
    console.log('Input:');
    console.log(input);
    console.log('\nParsed Svaras with Octaves:');
    
    const result = parseSvarasOnly(input);
    
    for (const note of result) {
        console.log(`${note.svara} (${note.svaraName}) - ${note.octave}`);
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
    
    const input = `S S M1 M1 | R1 R1 | G1 G1 ||
P P D1 D1 | N1 N1 | S' S' ||`;
    
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
    
    const validInput = `S R1 G1 M1 | P D1 N1 ||`;
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
        { svara: 'S', octave: 'madhya' },
        { svara: 'R1', octave: 'madhya' },
        { svara: 'G1', octave: 'madhya' },
        { svara: 'M1', octave: 'madhya' },
        { marker: '|', rhythm: true },
        { svara: 'P', octave: 'madhya' },
        { svara: 'D1', octave: 'madhya' },
        { svara: 'N1', octave: 'madhya' },
        { svara: 'S', octave: 'taara' },
        { marker: '||', rhythm: true, double: true }
    ];
    
    console.log('Pattern:', JSON.stringify(pattern, null, 2));
    
    // Convert to notation string
    let notation = '';
    for (const item of pattern) {
        if (item.rhythm) {
            notation += item.double ? ' ||' : ' |';
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
        SVARA_NOTATION,
        SVARA_NAMES,
        OCTAVE_NAMES,
        RHYTHM_MARKERS,
        TOKEN_TYPES,
        // Helper functions
        isValidSvara,
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
        SVARA_NOTATION,
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
    console.log('Carnatic Music Notation Parser for English Notation');
    console.log('====================================================\n');
    
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
