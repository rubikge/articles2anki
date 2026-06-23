const ANKICONNECT_URL = process.env.ANKICONNECT_URL || 'http://localhost:8765';

async function invoke(action, version = 6, params = {}) {
  const response = await fetch(ANKICONNECT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, version, params })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

(async () => {
  try {
    const deck = 'Articles2Anki::Прокачиваем RAG часть 1';
    console.log(`Fetching notes from deck: "${deck}"...`);
    
    const noteIds = await invoke('findNotes', 6, { query: `deck:"${deck}"` });
    console.log(`Found ${noteIds.length} notes.`);
    
    if (noteIds.length === 0) {
      console.log('No notes found.');
      return;
    }
    
    const notesInfo = await invoke('notesInfo', 6, { notes: noteIds });
    console.log('\n--- Extracted Notes Details ---');
    notesInfo.forEach((note, index) => {
      const front = note.fields.Front.value;
      const back = note.fields.Back.value;
      console.log(`${index + 1}. [${front}] -> ${back}`);
    });
    console.log('--------------------------------');
  } catch (error) {
    console.error('Error verifying cards:', error.message);
  }
})();
