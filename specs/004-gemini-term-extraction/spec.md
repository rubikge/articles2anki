# Feature Specification: Gemini Term Extraction

**Feature Branch**: `feature/gemini-term-extraction`

**Created**: 2026-06-23

**Status**: Draft

**Input**: User description: "Необходимо анализировать содержание статей и страниц через Google Gemini 3.5 Flash Medium и извлекать технические термины, аббревиатуры и их отправлять в колоду Anki с названием соответствующим статье. Если есть, можно было бы ещё сделать колоду более верхнего уровня, чтобы внутри неё были колоды с названиями статей, а внутри этих колод лежали карточки с терминами."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Term Extraction and Card Creation (Priority: P1)

As a user, when I click the extension on an article page, the backend should extract the page content, analyze it using Google Gemini to identify technical terms and abbreviations with their definitions/explanations, create a corresponding Anki deck, and add these terms as flashcards.

**Why this priority**: This is the core functionality. Without it, the extension only creates a single card containing the first 300 characters of the webpage.

**Independent Test**: Send a mock article content to the backend API endpoint, verify that the backend returns success, and check that a deck is created with multiple term cards.

**Acceptance Scenarios**:

1. **Given** a webpage with technical terms (e.g. "API", "JSON", "Fastify"), **When** the user triggers the extension, **Then** Gemini extracts these terms and their explanations, creates a deck named after the article title, adds the terms as individual cards, and syncs them to AnkiWeb.
2. **Given** a page with no technical terms, **When** the extension is clicked, **Then** the backend gracefully handles the empty list of terms and creates no cards or logs an appropriate warning without crashing.

---

### User Story 2 - Hierarchical Deck Structure (Priority: P2)

As a user, I want the article decks to be organized under a parent deck (e.g., `Articles::[Article Name]`), so that my Anki deck list remains tidy and organized.

**Why this priority**: Helpful for user organization, especially when analyzing many articles, to avoid cluttering the top-level deck list.

**Independent Test**: Verify that the created decks in Anki follow the `Parent::Child` namespace convention if a parent deck name is configured in the environment.

**Acceptance Scenarios**:

1. **Given** a parent deck name configuration (e.g., `ANKI_PARENT_DECK=Articles`), **When** a new deck is created for article "Introduction to Fastify", **Then** the deck created in Anki is named `Articles::Introduction to Fastify`.
2. **Given** no parent deck name configuration, **When** a new deck is created for article "Introduction to Fastify", **Then** the deck created in Anki is named `Introduction to Fastify` (defaulting to the article title directly, or a fallback default).

---

### Edge Cases

- **Firecrawl Scraping Failure**: If Firecrawl fails to scrape the page or returns empty/null content, the system must abort processing and log an error.
- **Gemini API Error or Timeout**: If the Gemini API is unreachable, times out, or returns an error, the backend must catch the error and log it, ensuring the background process terminates gracefully.
- **Incorrect/Invalid Gemini Response**: If Gemini returns JSON that does not match the requested schema, the backend must handle the parsing error and avoid adding malformed notes.
- **Duplicate Deck Check**: If the target deck (with the parent prefix included) already exists in Anki, the request is rejected synchronously with "Колода уже есть" to prevent re-processing.
- **Special Characters in Titles**: Anki deck names cannot contain certain characters (like `*`, `?`, `"`, `:`, etc.). The backend must sanitize the article title before using it as a deck name, especially since `:` is used as a nested deck separator (`::`).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST retrieve the page content via Firecrawl.
- **FR-002**: System MUST send the scraped markdown/text content to Google Gemini API using a configurable model (e.g. `gemini-3.5-flash`).
- **FR-003**: System MUST prompt Gemini to extract technical terms and abbreviations with concise explanations/definitions.
- **FR-004**: System MUST specify `responseMimeType: "application/json"` and a `responseSchema` for Gemini API calls to enforce a structured JSON output of terms.
- **FR-005**: System MUST configure the Anki deck name using a parent deck prefix if `ANKI_PARENT_DECK` is configured, resulting in `ParentDeck::ArticleTitle`.
- **FR-006**: System MUST sanitize the article title to remove illegal Anki deck name characters (except `::` for hierarchy).
- **FR-007**: System MUST create the target deck and add all extracted terms as "Basic" notes to Anki in a single batch.
- **FR-008**: System MUST synchronize the changes with AnkiWeb asynchronously.

### Key Entities

- **Term Card**: An Anki note of type "Basic", where "Front" is the technical term/abbreviation and "Back" is its definition/explanation.
- **Deck Hierarchy**: The nested deck structure in Anki represented as `Parent::Child`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Pushing an article URL creates a nested deck `Articles2Anki::[Article Title]` in Anki containing the terms extracted by Gemini.
- **SC-002**: Standard technical terms in the article are extracted with accurate, concise definitions.
- **SC-003**: Cards are synchronized to AnkiWeb.

## Assumptions

- The user will provide a `GEMINI_API_KEY` in the backend `.env` file.
- The Gemini API is accessible from the backend environment.
- The article title is suitable to be sanitized and used as part of the deck name.
