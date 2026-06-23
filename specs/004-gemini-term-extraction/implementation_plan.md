# Technical Implementation Plan: Gemini Term Extraction

**Feature Branch**: `feature/gemini-term-extraction`

**Parent Specification**: [spec.md](file:///home/sergei-privalov/projects/mine/articles2anki/specs/004-gemini-term-extraction/spec.md)

**Created**: 2026-06-23

**Status**: Draft (Pending Review)

---

## 1. Goal Description

The goal is to modify the existing `articles2anki` workflow to extract technical terms and abbreviations from webpage content using Google Gemini, and save them as individual cards in Anki. 

Currently, when the extension is clicked, the backend scrapes the webpage content and saves a single card containing a snippet of the article. With this feature, the backend will send the scraped content to the Gemini API, request a structured JSON response containing terms and definitions (in Russian), and create a separate card for each term. Additionally, we will support organizing these decks under a configured parent deck in Anki (e.g., `Articles::[Article Title]`).

---

## 2. Proposed Changes

### Configuration

#### [MODIFY] [.env](file:///home/sergei-privalov/projects/mine/articles2anki/backend/.env)
- Add `GEMINI_API_KEY` environment variable.
- Add optional `GEMINI_MODEL` (default: `gemini-3.5-flash`).
- Add optional `ANKI_PARENT_DECK` (default: `Articles2Anki`).

---

### Backend Service: Gemini Client

#### [NEW] [gemini.js](file:///home/sergei-privalov/projects/mine/articles2anki/backend/services/gemini.js)
- Implement a service client to call Google Gemini API using native Node `fetch`.
- Require `GEMINI_API_KEY` from environment.
- Formulate a prompt directing Gemini to extract technical terms and abbreviations from the provided text and provide clear, concise explanations/definitions in Russian.
- Specify `generationConfig` with `responseMimeType: "application/json"` and `responseSchema` (array of `{term, definition}` objects).
- Export `extractTerms(text)` function returning `[{term, definition}, ...]`.

---

### Backend Server Update

#### [MODIFY] [server.js](file:///home/sergei-privalov/projects/mine/articles2anki/backend/server.js)
- Import `extractTerms` from `services/gemini`.
- Add a helper function `sanitizeDeckName(name)` to remove characters that are illegal in Anki deck names (e.g., `\`, `/`, `:`, `*`, `?`, `"`, `<`, `>`, `|`), replacing them with spaces or hyphens.
- Modify the `/api/terms` handler:
  - Determine the deck name:
    - If `ANKI_PARENT_DECK` is set, sanitize it and the article title, and join them: `${parentDeck}::${sanitizedTitle}`.
    - Otherwise, use the sanitized article title directly.
  - In the background worker:
    - Fetch page content using Firecrawl.
    - Call `extractTerms(content)` to obtain the list of terms.
    - Loop through the terms and generate a batch of Anki notes (Basic model, Front: term, Back: definition).
    - Call `anki.createDeck(deckName)`.
    - Add all notes to Anki in one call using `anki.addNotes(notes)`.
    - Sync AnkiWeb.

---

## 3. Verification Plan

### Automated Tests
Currently, there is no unit testing framework set up in this scaffold. We will perform manual and integration verification using curl and test scripts.
- To verify the server can be started: `pnpm start` in the `backend` directory.

### Manual Verification
1. **Mock Request Testing**:
   Create a test script `backend/test-gemini.js` to run the Gemini term extraction directly on sample text.
2. **End-to-End Test**:
   - Configure a valid `GEMINI_API_KEY` in `backend/.env`.
   - Start the backend: `pnpm start`.
   - Trigger the Chrome Extension on a webpage with technical content (e.g., a Wikipedia article or documentation page).
   - Check the backend console output to verify that:
     1. The page is scraped via Firecrawl.
     2. The content is sent to Gemini.
     3. Gemini returns a JSON list of terms.
     4. A deck (nested under `Articles2Anki` if configured) is created in Anki.
     5. Multiple cards appear in Anki.
     6. Cards sync to AnkiWeb.

---

## 4. Constitution Check

- [x] Tech stack matches `GEMINI.md` constraints (Fastify, vanilla JS, simple tooling).
- [x] No implementation code was written before plan approval.
- [x] Language boundary rules are respected (plan in English, communication in Russian).
- [x] Roles and assignments conform to the subagents pool.

---

## 5. Open Questions

- **Q:** How should we handle articles where Gemini finds no technical terms?
  **A:** (Recommended) We will log a warning and skip card creation, but the request will still succeed. Alternatively, we could create a single default card stating that no terms were found.
- **Q:** Should the explanation/definition language be strictly Russian, or match the user's browser language?
  **A:** (Recommended) The prompt will ask Gemini to explain in Russian (as requested in the user prompt). We can make the target language configurable later if needed.

---

## 6. Subagent Tasks Assignment

### Backend Developer
- [ ] Create `backend/services/gemini.js` with `extractTerms` function.
- [ ] Add `sanitizeDeckName` helper to `backend/server.js` or `backend/services/anki.js`.
- [ ] Modify `backend/server.js` to orchestrate Firecrawl scraping, Gemini term extraction, nested deck creation, and batch card additions.
- [ ] Add environment variable configuration for `GEMINI_API_KEY`, `GEMINI_MODEL`, and `ANKI_PARENT_DECK` in `backend/.env` (and document in `.env.example` if applicable).

### Tester
- [ ] Create `backend/test-gemini.js` to test the Gemini API connection and schema validation.
- [ ] Verify end-to-end integration by running the backend locally and triggering the extension.
