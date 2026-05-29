/**
 * ScoreCraft UI Management
 * Event handlers, modals, and DOM interactions
 */

import { state, setState, pushHistory, resetState } from './state.js';
import { MODES, MODE_ICONS, MODE_LABELS, MODE_MESSAGES, MODAL_FOCUS_DELAY, TOAST_DURATION } from './constants.js';
import { startPlayback, stopPlayback, rewindPlayback } from './audio.js';

// DOM cache
const DOM = {};

/**
 * Initialize DOM cache
 */
export function initDOM() {
  DOM.statusMsg = document.getElementById('statusMsg');
  DOM.playBtn = document.getElementById('playBtn');
  DOM.playIcon = document.getElementById('playIcon');
  DOM.playheadIndicator = document.getElementById('playheadIndicator');
  DOM.modeBadge = document.getElementById('modeBadge');
  DOM.scoreArea = document.getElementById('scoreArea');
  DOM.tempoSlider = document.getElementById('tempoSlider');
  DOM.tempoDisp = document.getElementById('tempoDisp');
  DOM.timeDisp = document.getElementById('timeDisp');
  DOM.octaveDisp = document.getElementById('octaveDisp');
  DOM.toastContainer = document.getElementById('toastContainer');
  DOM.titleInput = document.getElementById('titleInput');
  DOM.subtitleInput = document.getElementById('subtitleInput');
  DOM.composerInput = document.getElementById('composerInput');
  DOM.pageTitleEl = document.getElementById('pageTitleEl');
  DOM.pageSubEl = document.getElementById('pageSubEl');
  DOM.topTitle = document.getElementById('topTitle');
}

/**
 * Set status message in playbar
 */
export function setStatus(msg) {
  if (DOM.statusMsg) DOM.statusMsg.textContent = msg;
}

/**
 * Show toast notification
 */
export function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  if (DOM.toastContainer) DOM.toastContainer.appendChild(t);
  setTimeout(() => t.remove(), TOAST_DURATION);
}

/**
 * Set editor mode (select, note, rest)
 */
export function setSbMode(mode) {
  setState({ mode });
  
  // Update sidebar buttons
  ['sbSelect', 'sbNote', 'sbRest'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.classList.remove('active');
  });
  
  const modeMap = { select: 'sbSelect', note: 'sbNote', rest: 'sbRest' };
  const btn = document.getElementById(modeMap[mode]);
  if (btn) btn.classList.add('active');
  
  // Update mode badge
  if (DOM.modeBadge) {
    DOM.modeBadge.className = `mode-badge mode-${mode}`;
    DOM.modeBadge.innerHTML = `<i class="ti ${MODE_ICONS[mode]}"></i> ${MODE_LABELS[mode]}`;
  }
  
  setStatus(MODE_MESSAGES[mode] || '');
  
  // Update cursor
  if (DOM.scoreArea) {
    DOM.scoreArea.style.cursor = (mode === 'note' || mode === 'rest') ? 'crosshair' : 'default';
  }
}

/**
 * Set note duration (1, 2, 4, 8, 16)
 */
export function setDuration(dur) {
  setState({ duration: dur });
  document.querySelectorAll('[data-dur]').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-dur="${dur}"]`)?.classList.add('active');
}

/**
 * Toggle accidental (flat, natural, sharp)
 */
export function toggleAcc(acc) {
  const current = state.accidental === acc ? null : acc;
  setState({ accidental: current });
  
  ['accFlat', 'accNat', 'accSharp'].forEach(id => {
    document.getElementById(id).classList.remove('active');
  });
  
  if (current) {
    const map = { b: 'accFlat', n: 'accNat', '#': 'accSharp' };
    document.getElementById(map[acc])?.classList.add('active');
  }
}

/**
 * Toggle dotted note
 */
export function toggleDot() {
  setState({ dot: !state.dot });
  const btn = document.getElementById('dotBtn');
  if (btn) btn.classList.toggle('active', state.dot);
}

/**
 * Toggle tied note
 */
export function toggleTie() {
  setState({ tie: !state.tie });
  const btn = document.getElementById('tieBtn');
  if (btn) btn.classList.toggle('active', state.tie);
}

/**
 * Toggle articulation (staccato, accent, tenuto, fermata)
 */
export function toggleArtic(artic) {
  const current = state.artic === artic ? null : artic;
  setState({ artic: current });
  
  const map = {
    staccato: 'artStacc',
    accent: 'artAccent',
    tenuto: 'artTenuto',
    fermata: 'artFermata'
  };
  
  Object.entries(map).forEach(([key, id]) => {
    const btn = document.getElementById(id);
    if (btn) btn.classList.toggle('active', current === key);
  });
}

/**
 * Toggle dynamic marking
 */
export function toggleDyn(dyn) {
  const current = state.dynamic === dyn ? null : dyn;
  setState({ dynamic: current });
  
  ['pp', 'p', 'mf', 'f', 'ff'].forEach(d => {
    const id = 'dyn' + d.charAt(0).toUpperCase() + d.slice(1);
    const btn = document.getElementById(id);
    if (btn) btn.classList.toggle('active', current === d);
  });
}

/**
 * Shift octave up or down
 */
export function shiftOctave(direction) {
  const newOctave = Math.max(2, Math.min(7, state.octave + direction));
  setState({ octave: newOctave });
  if (DOM.octaveDisp) DOM.octaveDisp.textContent = newOctave;
}

/**
 * Update tempo
 */
export function updateTempo(value) {
  const tempo = parseInt(value);
  setState({ tempo });
  if (DOM.tempoDisp) DOM.tempoDisp.textContent = tempo;
}

/**
 * Change key signature
 */
export function changeKey(key) {
  setState({ key });
  // Trigger re-render (implement in rendering module)
  window.dispatchEvent(new CustomEvent('scoreUpdate'));
}

/**
 * Change time signature
 */
export function changeMeter(meter) {
  setState({ meter });
  window.dispatchEvent(new CustomEvent('scoreUpdate'));
}

/**
 * Add new measure
 */
export function addMeasure() {
  pushHistory();
  state.measures.push({ notes: [], repeat: null });
  toast('Measure added');
  window.dispatchEvent(new CustomEvent('scoreUpdate'));
}

/**
 * Delete last measure
 */
export function deleteMeasure() {
  if (state.measures.length > 1) {
    pushHistory();
    state.measures.pop();
    if (state.selectedMeasure >= state.measures.length) {
      setState({ selectedMeasure: null });
    }
    toast('Measure removed');
    window.dispatchEvent(new CustomEvent('scoreUpdate'));
  }
}

/**
 * Add repeat markers
 */
export function addRepeatBar() {
  if (state.selectedMeasure === null) {
    toast('Select a measure first');
    return;
  }
  
  pushHistory();
  const measure = state.measures[state.selectedMeasure];
  measure.repeat = measure.repeat === 'start' ? null : 'start';
  toast(measure.repeat ? 'Repeat start added' : 'Repeat removed');
  window.dispatchEvent(new CustomEvent('scoreUpdate'));
}

/**
 * Clear current measure
 */
export function clearMeasure() {
  if (state.selectedMeasure === null) {
    toast('Select a measure first');
    return;
  }
  
  pushHistory();
  state.measures[state.selectedMeasure].notes = [];
  setState({ selectedBeat: null });
  toast('Measure cleared');
  window.dispatchEvent(new CustomEvent('scoreUpdate'));
}

/**
 * Open modal
 */
export function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('show');
}

/**
 * Close modal
 */
export function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('show');
}

/**
 * Setup modal close on background click
 */
export function setupModalDismiss() {
  document.querySelectorAll('.modal-bg').forEach(bg => {
    bg.addEventListener('click', (e) => {
      if (e.target === bg) {
        bg.classList.remove('show');
      }
    });
  });
}

/**
 * Edit score title and metadata
 */
export function editTitle() {
  if (DOM.titleInput) DOM.titleInput.value = state.title;
  if (DOM.subtitleInput) DOM.subtitleInput.value = state.subtitle;
  if (DOM.composerInput) DOM.composerInput.value = state.composer || '';
  
  openModal('titleModal');
  setTimeout(() => DOM.titleInput?.focus(), MODAL_FOCUS_DELAY);
}

/**
 * Apply title changes
 */
export function applyTitle() {
  const title = (DOM.titleInput?.value || '').trim() || 'Untitled Score';
  const subtitle = (DOM.subtitleInput?.value || '').trim();
  const composer = (DOM.composerInput?.value || '').trim();
  
  setState({ title, subtitle, composer });
  
  if (DOM.pageTitleEl) DOM.pageTitleEl.textContent = title;
  if (DOM.topTitle) DOM.topTitle.textContent = title;
  
  closeModal('titleModal');
}

/**
 * Open score settings
 */
export function openScoreSettings() {
  const measInput = document.getElementById('measPerRow');
  const soundSelect = document.getElementById('soundType');
  const showMeasCheck = document.getElementById('showMeasNums');
  
  if (measInput) measInput.value = state.measPerRow;
  if (soundSelect) soundSelect.value = state.soundType;
  if (showMeasCheck) showMeasCheck.checked = state.showMeasNums;
  
  openModal('settingsModal');
}

/**
 * Apply score settings
 */
export function applySettings() {
  const measPerRow = parseInt(document.getElementById('measPerRow')?.value || 4);
  const soundType = document.getElementById('soundType')?.value || 'triangle';
  const showMeasNums = document.getElementById('showMeasNums')?.checked ?? true;
  
  setState({ measPerRow, soundType, showMeasNums });
  closeModal('settingsModal');
  window.dispatchEvent(new CustomEvent('scoreUpdate'));
}

/**
 * Create new score with confirmation
 */
export function newScore() {
  openModal('newModal');
}

/**
 * Confirm new score
 */
export function confirmNewScore() {
  resetState();
  closeModal('newModal');
  window.dispatchEvent(new CustomEvent('scoreUpdate'));
}

/**
 * Toggle playback
 */
export function togglePlay() {
  if (state.playing) {
    stopPlayback();
    if (DOM.playIcon) DOM.playIcon.className = 'ti ti-player-play';
    if (DOM.playheadIndicator) DOM.playheadIndicator.classList.remove('active');
  } else {
    startPlayback(
      (time) => {
        if (DOM.timeDisp) DOM.timeDisp.textContent = time;
      },
      () => {
        if (DOM.playIcon) DOM.playIcon.className = 'ti ti-player-play';
        if (DOM.playheadIndicator) DOM.playheadIndicator.classList.remove('active');
      }
    );
    if (DOM.playIcon) DOM.playIcon.className = 'ti ti-player-pause';
    if (DOM.playheadIndicator) DOM.playheadIndicator.classList.add('active');
  }
}

/**
 * Rewind playback
 */
export function rewindPlay() {
  rewindPlayback();
  setStatus('Rewound to beginning');
  window.dispatchEvent(new CustomEvent('scoreUpdate'));
}

/**
 * Stop playback
 */
export function stopPlay() {
  stopPlayback();
  if (DOM.playIcon) DOM.playIcon.className = 'ti ti-player-play';
  if (DOM.playheadIndicator) DOM.playheadIndicator.classList.remove('active');
}
