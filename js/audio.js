/**
 * ScoreCraft Audio Engine
 * Handles synthesis and playback
 */

import { state } from './state.js';
import { DYN_GAINS, PLAYBACK_LATENCY, LOWPASS_FREQ, MIN_GAIN } from './constants.js';
import { noteFreq, formatTime } from './utils.js';

let audioCtx = null;
let playTimerID = null;
let playStartTime = 0;

/**
 * Initialize or get audio context
 */
export function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a single note with envelope
 */
export function playNoteAudio(freq, dur, when, dyn) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filt = ctx.createBiquadFilter();
  
  // Setup filter
  filt.type = 'lowpass';
  filt.frequency.value = LOWPASS_FREQ;
  
  // Connect nodes
  osc.connect(filt);
  filt.connect(gain);
  gain.connect(ctx.destination);
  
  // Configure oscillator
  osc.type = state.soundType || 'triangle';
  osc.frequency.value = freq;
  
  // Calculate duration
  const durSec = (60 / state.tempo) * (4 / dur);
  const vol = DYN_GAINS[dyn] || 0.38;
  
  // Setup envelope
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(vol, when + 0.015);
  gain.gain.exponentialRampToValueAtTime(MIN_GAIN, when + Math.max(0.06, durSec * 0.9));
  
  // Play
  osc.start(when);
  osc.stop(when + durSec + 0.08);
}

/**
 * Start playback from current or selected measure
 */
export function startPlayback(onUpdateTime, onComplete) {
  if (state.playing) return;
  
  state.playing = true;
  const ctx = getAudioContext();
  let when = ctx.currentTime + PLAYBACK_LATENCY;
  const beatSec = 60 / state.tempo;
  let measureIdx = state.selectedMeasure || 0;
  let noteIdx = 0;
  playStartTime = Date.now();
  
  function playTick() {
    if (!state.playing) return;
    
    if (measureIdx >= state.measures.length) {
      stopPlayback();
      if (onComplete) onComplete();
      return;
    }
    
    const measure = state.measures[measureIdx];
    const note = measure.notes[noteIdx];
    
    if (note) {
      const durSec = beatSec * (4 / note.dur) * (note.dot ? 1.5 : 1);
      if (!note.rest && note.pitch) {
        playNoteAudio(
          noteFreq(note.pitch, note.octave || 4, note.acc),
          note.dur,
          when,
          note.dynamic
        );
      }
      when += durSec;
    } else {
      when += beatSec;
    }
    
    noteIdx++;
    if (noteIdx >= measure.notes.length) {
      noteIdx = 0;
      measureIdx++;
    }
    
    const lag = Math.max(0, (when - ctx.currentTime - 0.15) * 1000);
    if (state.playing) {
      playTimerID = setTimeout(playTick, lag);
    }
  }
  
  // Update time display
  const timerDisplay = setInterval(() => {
    if (!state.playing) {
      clearInterval(timerDisplay);
      return;
    }
    const elapsed = Math.floor((Date.now() - playStartTime) / 1000);
    if (onUpdateTime) onUpdateTime(formatTime(elapsed));
  }, 500);
  
  playTick();
}

/**
 * Stop playback
 */
export function stopPlayback() {
  state.playing = false;
  if (playTimerID) clearTimeout(playTimerID);
}

/**
 * Rewind to beginning
 */
export function rewindPlayback() {
  stopPlayback();
  state.selectedMeasure = 0;
  state.selectedBeat = null;
}

/**
 * Check if currently playing
 */
export function isPlaying() {
  return state.playing;
}
