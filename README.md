# Terms Logger Scaffold (Articles2Anki)

This project is a Google Chrome extension that extracts text from any webpage (including local HTML files) and sends it to a local backend service to generate Anki flashcards via Google Gemini.

## Architecture
- **Extension**: A Manifest V3 Chrome extension. Clicking the extension icon injects a script that automatically scrolls the page to trigger lazy-loaded elements, extracts the full text of the page, and sends it to the local backend.
- **Backend**: A fast and lightweight Fastify server running on Node.js locally. It receives the text, uses the Google Gemini API to extract technical terms and abbreviations, and communicates with your local Anki desktop application (via AnkiConnect) to generate the cards.

## Prerequisites
1. **Node.js** and **pnpm** installed.
2. **Anki Desktop** running on your machine.
3. **AnkiConnect** add-on installed in Anki (add-on code: 2055492159). Make sure AnkiConnect allows connections from `http://localhost:8080` (usually default or configured in the add-on settings).
4. A **Gemini API Key**.

## Setup & Running Locally

### 1. Configure the Backend
```bash
cd backend
# Create a .env file based on the environment variables needed
# Add your GEMINI_API_KEY to the .env file
# (e.g. GEMINI_API_KEY=your_api_key_here)
# (e.g. API_SECRET_KEY=SuperSecretAnkiToken123)
```

### 2. Start the Backend
```bash
cd backend
pnpm install
pnpm start
```
The server will start on `http://localhost:8080`. Keep it running in the terminal.

### 3. Load the Extension
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** in the top right corner.
3. Click **Load unpacked** and select the `extension/` directory.

### 4. Usage
1. Open any standard webpage or local HTML file (`file://...`). Note: Chrome prevents content scripts from running on `chrome://` or Chrome Web Store pages.
2. Click the Terms Logger extension icon.
3. The extension will quickly scroll to the bottom of the page to load all content.
4. Check the backend terminal to see the extraction and Anki card generation logs.
5. Open your Anki desktop app and check the new cards!
