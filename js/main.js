/**
 * ScoreCraft Main Entry Point
 * Initializes all modules and event listeners
 */

import { state, undo, redo, pushHistory, createEmptyMeasure } from './state.js';
import {
  initDOM,
  setSbMode,
  setDuration,
  toggleAcc,
  toggleDot,
  toggleTie,
  toggleArtic,
  toggleDyn,
  shiftOctave,
  updateTempo,
  changeKey,
  changeMeter,
  addMeasure,
  deleteMeasure,
  addRepeatBar,
  clearMeasure,
  editTitle,
  applyTitle,
  openScoreSettings,
  applySettings,
  newScore,
  confirmNewScore,
  togglePlay,
  rewindPlay,
  stopPlay,
  openModal,
  closeModal,
  setupModalDismiss,
  toast,
  setStatus
} from './ui.js';
import {
  saveToStorage,
  loadFromStorage,
  exportAsJSON,
  exportAsMusicXML,
  exportAsSVG,
  openSaveDialog,
  handleSaveFromModal
} from './storage.js';

/**
 * Initialize application
 */
function init() {
  initDOM();
  setupEventListeners();
  setupModalDismiss();
  renderScore();
  
  // Initialize first measure
  if (!state.measures.length) {
    state.measures.push(createEmptyMeasure());
  }
  
  setStatus('Ready to compose. Select note input mode (N) to begin.');
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Topbar actions
  setupActionButtons();
  
  // Sidebar mode buttons
  document.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      setSbMode(btn.dataset.mode);
    });
  });
  
  // Duration buttons
  document.querySelectorAll('[data-dur]').forEach(btn => {
    btn.addEventListener('click', () => {
      setDuration(parseInt(btn.dataset.dur));
    });
  });
  
  // Accidental buttons
  document.querySelectorAll('[data-acc]').forEach(btn => {
    btn.addEventListener('click', () => {
      toggleAcc(btn.dataset.acc);
    });
  });
  
  // Articulation buttons
  document.querySelectorAll('[data-artic]').forEach(btn => {
    btn.addEventListener('click', () => {
      toggleArtic(btn.dataset.artic);
    });
  });
  
  // Dynamic buttons
  document.querySelectorAll('[data-dyn]').forEach(btn => {
    btn.addEventListener('click', () => {
      toggleDyn(btn.dataset.dyn);
    });
  });
  
  // Playbar controls
  document.getElementById('tempoSlider')?.addEventListener('input', (e) => {
    updateTempo(e.target.value);
  });
  
  document.getElementById('keySel')?.addEventListener('change', (e) => {
    changeKey(e.target.value);
  });
  
  document.getElementById('meterSel')?.addEventListener('change', (e) => {
    changeMeter(e.target.value);
  });
  
  // Score title/subtitle click to edit
  document.getElementById('pageTitleEl')?.addEventListener('click', editTitle);
  document.getElementById('pageSubEl')?.addEventListener('click', editTitle);
  
  // Settings modal
  document.getElementById('measPerRow')?.addEventListener('change', () => {
    state.measPerRow = parseInt(document.getElementById('measPerRow').value);
  });
  
  document.getElementById('soundType')?.addEventListener('change', (e) => {
    state.soundType = e.target.value;
  });
  
  document.getElementById('showMeasNums')?.addEventListener('change', (e) => {
    state.showMeasNums = e.target.checked;
  });
  
  // Keyboard shortcuts
  setupKeyboardShortcuts();
  
  // Custom events
  window.addEventListener('scoreUpdate', renderScore);
}

/**
 * Setup action button handlers
 */
function setupActionButtons() {
  const actions = {
    newScore: () => newScore(),
    openSaveDialog: () => openSaveDialog(),
    loadDialog: () => {
      // TODO: Implement load dialog
      toast('Load dialog coming soon');
    },
    exportSVG: () => exportAsSVG(),
    exportMusicXML: () => exportAsMusicXML(),
    undo: () => {
      if (undo()) {
        renderScore();
        toast('Undo');
      } else {
        toast('Nothing to undo');
      }
    },
    redo: () => {
      if (redo()) {
        renderScore();
        toast('Redo');
      } else {
        toast('Nothing to redo');
      }
    },
    zoomOut: () => {
      state.zoom = Math.max(0.5, state.zoom - 0.1);
      updateZoomDisplay();
    },
    zoomIn: () => {
      state.zoom = Math.min(2, state.zoom + 0.1);
      updateZoomDisplay();
    },
    togglePanel: () => {
      const panel = document.getElementById('propPanel');
      if (panel) panel.classList.toggle('hidden');
    },
    addMeasure: () => addMeasure(),
    deleteMeasure: () => deleteMeasure(),
    addRepeatBar: () => addRepeatBar(),
    clearMeasure: () => clearMeasure(),
    openScoreSettings: () => openScoreSettings(),
    octaveDown: () => shiftOctave(-1),
    octaveUp: () => shiftOctave(1),
    toggleDot: () => toggleDot(),
    toggleTie: () => toggleTie(),
    rewind: () => rewindPlay(),
    togglePlay: () => togglePlay(),
    stop: () => stopPlay(),
    applyTitle: () => applyTitle(),
    applySettings: () => applySettings(),
    confirmNewScore: () => confirmNewScore(),
    handleSaveModal: () => handleSaveFromModal(),
    closeModal: (btn) => closeModal(btn.dataset.modal)
  };
  
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (actions[action]) {
        actions[action](btn);
      }
    });
  });
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
  const shortcuts = {
    'n': () => setSbMode('note'),
    'r': () => setSbMode('rest'),
    's': () => setSbMode('select'),
    '1': () => setDuration(1),
    '2': () => setDuration(2),
    '4': () => setDuration(4),
    '6': () => setDuration(8),
    '3': () => setDuration(16),
    ' ': (e) => {
      e.preventDefault();
      togglePlay();
    }
  };
  
  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    
    // Ctrl+Z = Undo
    if (e.ctrlKey && key === 'z') {
      e.preventDefault();
      if (undo()) {
        renderScore();
        toast('Undo');
      }
    }
    
    // Ctrl+Shift+Z = Redo
    if (e.ctrlKey && e.shiftKey && key === 'z') {
      e.preventDefault();
      if (redo()) {
        renderScore();
        toast('Redo');
      }
    }
    
    // Ctrl+Up/Down = Octave shift
    if (e.ctrlKey) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        shiftOctave(1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        shiftOctave(-1);
      }
    }
    
    // Regular shortcuts
    if (shortcuts[key]) {
      shortcuts[key](e);
    }
  });
}

/**
 * Update zoom display
 */
function updateZoomDisplay() {
  const disp = document.getElementById('zoomDisp');
  if (disp) disp.textContent = `${Math.round(state.zoom * 100)}%`;
  const page = document.getElementById('scorePage');
  if (page) page.style.transform = `scale(${state.zoom})`;
}

/**
 * Render the score
 * @todo Implement actual SVG rendering
 */
function renderScore() {
  const container = document.getElementById('systemsContainer');
  if (!container) return;
  
  // Placeholder rendering
  container.innerHTML = state.measures.map((measure, idx) => `
    <div class="measure" data-idx="${idx}">
      <div class="measure-num">${idx + 1}</div>
      <div class="notes">${measure.notes.length} notes</div>
    </div>
  `).join('');
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
