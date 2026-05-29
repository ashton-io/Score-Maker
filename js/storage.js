/**
 * ScoreCraft Storage Management
 * Save and load scores from browser storage
 */

import { state } from './state.js';

const STORAGE_PREFIX = 'scorecraft_';
const STORAGE_INDEX_KEY = STORAGE_PREFIX + 'index';

/**
 * Save score to localStorage
 */
export function saveToStorage(name) {
  const scoreName = (name || state.title || 'Untitled Score').trim();
  const key = STORAGE_PREFIX + scoreName;
  
  const scoreData = {
    title: state.title,
    subtitle: state.subtitle,
    composer: state.composer,
    key: state.key,
    meter: state.meter,
    tempo: state.tempo,
    measures: state.measures,
    savedAt: new Date().toISOString()
  };
  
  localStorage.setItem(key, JSON.stringify(scoreData));
  
  // Update index
  const index = getSavedScores();
  if (!index.find(s => s.name === scoreName)) {
    index.push({ name: scoreName, savedAt: scoreData.savedAt });
    localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(index));
  }
  
  return { success: true, name: scoreName };
}

/**
 * Load score from localStorage
 */
export function loadFromStorage(name) {
  const key = STORAGE_PREFIX + name;
  const data = localStorage.getItem(key);
  
  if (!data) {
    return { success: false, error: 'Score not found' };
  }
  
  try {
    const scoreData = JSON.parse(data);
    return { success: true, data: scoreData };
  } catch (e) {
    return { success: false, error: 'Failed to parse saved score' };
  }
}

/**
 * Get list of saved scores
 */
export function getSavedScores() {
  const index = localStorage.getItem(STORAGE_INDEX_KEY);
  if (!index) return [];
  
  try {
    return JSON.parse(index);
  } catch {
    return [];
  }
}

/**
 * Delete score from storage
 */
export function deleteScore(name) {
  const key = STORAGE_PREFIX + name;
  localStorage.removeItem(key);
  
  // Update index
  const index = getSavedScores();
  const filtered = index.filter(s => s.name !== name);
  localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(filtered));
  
  return { success: true };
}

/**
 * Export score as JSON
 */
export function exportAsJSON() {
  const scoreData = {
    version: '1.0',
    title: state.title,
    subtitle: state.subtitle,
    composer: state.composer,
    key: state.key,
    meter: state.meter,
    tempo: state.tempo,
    measures: state.measures,
    exportedAt: new Date().toISOString()
  };
  
  const json = JSON.stringify(scoreData, null, 2);
  downloadFile(json, `${state.title || 'score'}.json`, 'application/json');
}

/**
 * Export score as MusicXML
 * @todo Implement full MusicXML export
 */
export function exportAsMusicXML() {
  // Placeholder - full MusicXML export implementation needed
  const musicXml = buildBasicMusicXML();
  downloadFile(musicXml, `${state.title || 'score'}.musicxml`, 'application/xml');
}

/**
 * Build basic MusicXML structure
 */
function buildBasicMusicXML() {
  // Simplified MusicXML generation
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">\n';
  xml += '<score-partwise version="4.0">\n';
  xml += '<work>\n';
  xml += `<work-title>${escapeXml(state.title)}</work-title>\n`;
  xml += '</work>\n';
  
  if (state.composer) {
    xml += '<identification>\n';
    xml += `<composer>${escapeXml(state.composer)}</composer>\n`;
    xml += '</identification>\n';
  }
  
  xml += '<part-list>\n';
  xml += '<score-part id="P1">\n';
  xml += '<part-name>Piano</part-name>\n';
  xml += '</score-part>\n';
  xml += '</part-list>\n';
  
  xml += '<part id="P1">\n';
  
  // Add measures
  state.measures.forEach((measure, idx) => {
    xml += `<measure number="${idx + 1}">\n`;
    
    if (idx === 0) {
      const [beats, beatType] = state.meter.split('/');
      xml += '<attributes>\n';
      xml += `<time><beats>${beats}</beats><beat-type>${beatType}</beat-type></time>\n`;
      xml += `<key><fifths>0</fifths></key>\n`; // Simplified
      xml += '</attributes>\n';
    }
    
    measure.notes.forEach(note => {
      xml += '<note>\n';
      if (!note.rest) {
        xml += `<pitch>\n<step>${note.pitch}</step>\n<octave>${note.octave || 4}</octave>\n</pitch>\n`;
      } else {
        xml += '<rest/>\n';
      }
      xml += `<duration>${4 / note.dur}</duration>\n`;
      xml += '</note>\n';
    });
    
    xml += '</measure>\n';
  });
  
  xml += '</part>\n';
  xml += '</score-partwise>\n';
  
  return xml;
}

/**
 * Escape XML special characters
 */
function escapeXml(str) {
  return String(str).replace(/[&<>"']/g, c => {
    const escaped = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;'
    };
    return escaped[c];
  });
}

/**
 * Export as SVG
 * @todo Implement full SVG export
 */
export function exportAsSVG() {
  const svg = buildSVG();
  downloadFile(svg, `${state.title || 'score'}.svg`, 'image/svg+xml');
}

/**
 * Build SVG representation (placeholder)
 */
function buildSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
    <text x="50" y="50" font-size="24" font-family="serif">${escapeXml(state.title)}</text>
    <text x="50" y="100">Export implementation pending</text>
  </svg>`;
}

/**
 * Download file to user's computer
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Open save dialog
 */
export function openSaveDialog() {
  const input = document.getElementById('saveNameInput');
  if (input) input.value = state.title;
  const modal = document.getElementById('saveModal');
  if (modal) modal.classList.add('show');
}

/**
 * Handle save from modal
 */
export function handleSaveFromModal() {
  const input = document.getElementById('saveNameInput');
  const name = (input?.value || '').trim();
  if (name) {
    const result = saveToStorage(name);
    if (result.success) {
      const modal = document.getElementById('saveModal');
      if (modal) modal.classList.remove('show');
    }
  }
}
