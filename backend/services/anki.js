const ANKICONNECT_URL = process.env.ANKICONNECT_URL || 'http://localhost:8765';

/**
 * Generic fetch wrapper for AnkiConnect API
 */
async function invoke(action, version = 6, params = {}) {
  try {
    const response = await fetch(ANKICONNECT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action, version, params })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data.result;
  } catch (err) {
    console.error(`[AnkiConnect] Error invoking action "${action}":`, err.message);
    throw err;
  }
}

async function getDeckNames() {
  return await invoke('deckNames');
}

async function createDeck(deck) {
  return await invoke('createDeck', 6, { deck });
}

async function addNotes(notes) {
  return await invoke('addNotes', 6, { notes });
}

async function sync() {
  return await invoke('sync');
}

module.exports = {
  getDeckNames,
  createDeck,
  addNotes,
  sync
};
