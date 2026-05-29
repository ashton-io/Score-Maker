/**
 * ScoreCraft State Management
 * Centralized state with history/undo support
 */

import { DEFAULT_STATE, HISTORY_LIMIT } from './constants.js';

export let state = { ...DEFAULT_STATE };

/**
 * Push current measures to history (for undo)
 */
export function pushHistory() {
  state.history.push(JSON.stringify(state.measures));
  state.future = [];
  if (state.history.length > HISTORY_LIMIT) {
    state.history.shift();
  }
}

/**
 * Undo last action
 */
export function undo() {
  if (!state.history.length) return false;
  state.future.push(JSON.stringify(state.measures));
  state.measures = JSON.parse(state.history.pop());
  state.selectedMeasure = null;
  state.selectedBeat = null;
  return true;
}

/**
 * Redo last undone action
 */
export function redo() {
  if (!state.future.length) return false;
  state.history.push(JSON.stringify(state.measures));
  state.measures = JSON.parse(state.future.pop());
  state.selectedMeasure = null;
  state.selectedBeat = null;
  return true;
}

/**
 * Reset state to initial values
 */
export function resetState() {
  state = { ...DEFAULT_STATE };
}

/**
 * Update state property
 */
export function setState(updates) {
  Object.assign(state, updates);
}

/**
 * Get current state
 */
export function getState() {
  return { ...state };
}

/**
 * Create empty measure object
 */
export function createEmptyMeasure() {
  return { notes: [], repeat: null };
}

/**
 * Get beats per measure from current meter
 */
export function beatsPerMeasure() {
  const [n] = state.meter.split('/').map(Number);
  return n;
}

/**
 * Convert duration to beats based on meter
 */
export function durToBeats(dur) {
  const [, d] = state.meter.split('/').map(Number);
  return d / dur;
}

/**
 * Calculate total beats used in a measure
 */
export function measureBeatsUsed(measure) {
  return measure.notes.reduce(
    (sum, note) => sum + durToBeats(note.dur) * (note.dot ? 1.5 : 1),
    0
  );
}

/**
 * Check if measure is at capacity
 */
export function isMeasureFull(measure) {
  return measureBeatsUsed(measure) >= beatsPerMeasure() - 0.01;
}
