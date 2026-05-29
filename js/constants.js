/**
 * ScoreCraft Constants
 * All magic numbers and configuration values
 */

// Staff rendering
export const NOTE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const LINE_SPACING = 10;
export const STAFF_TOP = 34;
export const CLEF_WIDTH = 44;
export const NOTE_HEAD_RX = 4.8;
export const NOTE_HEAD_RY = 3.5;

// Audio
export const DYN_GAINS = {
  pp: 0.12,
  p: 0.22,
  mp: 0.32,
  mf: 0.44,
  f: 0.60,
  ff: 0.78
};

export const PLAYBACK_LOOKAHEAD = 0.15; // seconds
export const PLAYBACK_LATENCY = 0.08; // seconds
export const LOWPASS_FREQ = 2800; // Hz
export const MIN_GAIN = 0.001;

// History
export const HISTORY_LIMIT = 80;

// Timing
export const MODAL_FOCUS_DELAY = 150; // ms
export const TOAST_DURATION = 2100; // ms
export const TOAST_ANIMATION_TIME = 200; // ms

// Key signatures
export const KEY_SIGS = {
  'C': { acc: [], type: '#' },
  'G': { acc: ['F'], type: '#' },
  'D': { acc: ['F', 'C'], type: '#' },
  'A': { acc: ['F', 'C', 'G'], type: '#' },
  'E': { acc: ['F', 'C', 'G', 'D'], type: '#' },
  'B': { acc: ['F', 'C', 'G', 'D', 'A'], type: '#' },
  'F': { acc: ['B'], type: 'b' },
  'Bb': { acc: ['B', 'E'], type: 'b' },
  'Eb': { acc: ['B', 'E', 'A'], type: 'b' },
  'Ab': { acc: ['B', 'E', 'A', 'D'], type: 'b' },
  'Am': { acc: [], type: '#' },
  'Em': { acc: ['F'], type: '#' },
  'Bm': { acc: ['F', 'C'], type: '#' },
  'Dm': { acc: ['B'], type: 'b' },
  'Gm': { acc: ['B', 'E'], type: 'b' },
  'Cm': { acc: ['B', 'E', 'A'], type: 'b' }
};

export const SHARP_STAFF_POS = { F: 5, C: 4, G: 3, D: 6, A: 3 };
export const FLAT_STAFF_POS = { B: 4, E: 3, A: 2, D: 5, G: 4 };

// UI modes
export const MODES = {
  SELECT: 'select',
  NOTE: 'note',
  REST: 'rest'
};

// Defaults
export const DEFAULT_STATE = {
  title: 'Untitled Score',
  subtitle: 'for Piano — click to edit',
  composer: '',
  key: 'C',
  meter: '4/4',
  tempo: 120,
  measures: [],
  selectedMeasure: null,
  selectedBeat: null,
  mode: 'select',
  duration: 4,
  accidental: null,
  dot: false,
  tie: false,
  artic: null,
  dynamic: null,
  octave: 4,
  history: [],
  future: [],
  playing: false,
  zoom: 1,
  measPerRow: 4,
  soundType: 'triangle',
  showMeasNums: true
};

export const TIME_SIGNATURES = ['4/4', '3/4', '6/8', '2/4', '2/2', '5/4', '7/8', '12/8'];
export const OCTAVE_RANGE = { min: 2, max: 7 };
export const MEASURES_PER_ROW_RANGE = { min: 1, max: 8 };
export const TEMPO_RANGE = { min: 40, max: 240 };
