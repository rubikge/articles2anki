# Gemini Term Extraction Feature Tasks

- [x] Add environment variables to `backend/.env` (`GEMINI_API_KEY`, `GEMINI_MODEL`, `ANKI_PARENT_DECK`).
- [x] Create `backend/services/gemini.js` with the `extractTerms` function calling Gemini API with structured JSON output schema.
- [x] Add `sanitizeDeckName` helper to `backend/server.js` replacing illegal characters and preserving `::`.
- [x] Modify `backend/server.js` to import `extractTerms`, use the parent/nested deck naming, invoke term extraction on scraped content, add cards in a batch, and sync.
- [x] Add `backend/test-gemini.js` script to manually verify the Gemini term extraction functionality.
- [x] Verify Gemini term extraction and local Fastify server integration end-to-end.

