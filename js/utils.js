/**
 * ScoreCraft Utility Functions
 * Pitch, staff position, and helper calculations
 */

import { NOTE_NAMES, LINE_SPACING, STAFF_TOP } from './constants.js';

/**
 * Convert staff position to note name and octave
 */
export function staffPosToNote(pos) {
  let noteIdx = 6 + pos;
  let octave = 4;
  
  while (noteIdx < 0) {
    noteIdx += 7;
    octave--;
  }
  while (noteIdx >= 7) {
    noteIdx -= 7;
    octave++;
  }
  
  return { pitch: NOTE_NAMES[noteIdx], octave };
}

/**
 * Convert note name and octave to staff position
 */
export function noteToStaffPos(pitch, octave) {
  const idx = NOTE_NAMES.indexOf(pitch);
  return (idx - 6) + (octave - 4) * 7;
}

/**
 * Convert staff position to Y coordinate
 */
export function staffPosToY(pos, staffTop = STAFF_TOP) {
  return staffTop + 2 * LINE_SPACING - pos * (LINE_SPACING / 2);
}

/**
 * Convert Y coordinate to staff position
 */
export function yToStaffPos(y, staffTop = STAFF_TOP) {
  const midY = staffTop + 2 * LINE_SPACING;
  return Math.round((midY - y) / (LINE_SPACING / 2));
}

/**
 * Calculate frequency in Hz from note name, octave, and accidental
 */
export function noteFreq(name, octave, acc) {
  const midi = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  let n = midi[name] + (octave + 1) * 12;
  
  if (acc === '#') n++;
  if (acc === 'b') n--;
  
  return 440 * Math.pow(2, (n - 69) / 12);
}

/**
 * Debounce function to limit function call frequency
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to enforce maximum call frequency
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Format time in MM:SS format
 */
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Clamp value between min and max
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Generate unique ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
