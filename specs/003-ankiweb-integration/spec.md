# Feature Specification: AnkiWeb Integration

**Feature Branch**: `feature/ankiweb-integration`

**Created**: 2026-06-23

**Status**: Draft

**Input**: User description: "Необходимо подключить проект к AnkiWeb, чтобы имелась возможность с бэкенда добавлять новые карты в колоду моего аккаунта в Anki."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Backend pushes new cards to AnkiWeb (Priority: P1)

As a user, when the backend generates new Anki cards from a web page, these cards should be automatically pushed to my AnkiWeb account, so that I can immediately start reviewing them on any of my devices.

**Why this priority**: This is the core requirement of the task. Without this, the backend is disconnected from the user's actual Anki learning workflow.

**Independent Test**: The backend can be tested independently by manually triggering a mock card generation and verifying that the card appears in the AnkiWeb deck.

**Acceptance Scenarios**:

1. **Given** a generated flashcard for a specific term, **When** the backend initiates the save operation, **Then** the card is successfully created in the configured Anki deck and synced to AnkiWeb.
2. **Given** AnkiWeb is temporarily unreachable or the headless instance is down, **When** the backend tries to push a card, **Then** it gracefully handles the error and allows for a retry.

---

### Edge Cases

- **Anki Sync Error / Profile Auth Failure**: If syncing to AnkiWeb fails due to authentication or other errors, the backend must catch the error and return an error response to the user. No automatic retry on fatal auth errors; the user is notified.
- **Duplicate Page Handling**: A specific web page (article) can only be processed and added once. When a page is being processed, the backend checks if a deck with the corresponding name already exists in Anki. If it does, the system returns an error: "Колода уже есть" without making further changes. Note: If a user deletes the deck in Anki, the system relies strictly on the deck's existence. It will treat the page as new, recreate the deck, and add the cards.
- **Deck Creation**: For each new page, the system will programmatically create a new Anki deck specifically for that page. This relies on AnkiConnect's `createDeck` functionality. A fallback default deck name can be configured via an environment variable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST programmatically create new Anki decks for each processed page, and add new notes/cards to those decks. It MUST also be able to check existing decks.
- **FR-002**: System MUST synchronize the created cards and decks to the user's AnkiWeb account.
- **FR-003**: System MUST provide a backend service (via `headless-anki` Docker container and AnkiConnect) that exposes an API for adding cards and decks.
- **FR-004**: System MUST securely use the user's Anki profile to perform the sync.
- **FR-005**: System MUST prevent duplicate processing of the same page by checking for the existence of the corresponding deck before adding cards.
- **FR-006**: System MUST perform card addition and AnkiWeb synchronization asynchronously in the background. The backend MUST immediately return a response to the user indicating that processing has started, without blocking.

### Key Entities

- **Anki Card**: Represents the flashcard to be added. It MUST use the standard "Basic" note type in Anki, populating the "Front" and "Back" fields.
- **Deck**: The target collection in Anki where cards will be placed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new card pushed from the backend appears in the user's AnkiWeb account.
- **SC-002**: The backend successfully communicates with the `headless-anki` instance without manual intervention.

## Assumptions

- The user has an existing AnkiWeb account.
- The user is willing to provide their Anki profile data (to be mounted into the `headless-anki` container) so that the container can sync with AnkiWeb.
- The `headless-anki` container will run as a supporting service alongside the main backend.

## Clarifications

- **Q:** Какой тип карточки (Note Type/Model) в Anki должен использоваться для создаваемых карточек?
  **A:** (Recommended) Использовать стандартный тип "Basic" (поля "Front" и "Back").
- **Q:** Синхронизация с AnkiWeb может занимать несколько секунд. Как бэкенд должен обрабатывать процесс сохранения?
  **A:** (Recommended) Выполнять добавление и синхронизацию асинхронно в фоне. Бэкенд сразу отвечает, что карточка обрабатывается, не блокируя пользователя.
- **Q:** Если пользователь удалил ранее созданную колоду в Anki, а затем снова пытается добавить карточки с той же страницы, что должно произойти?
  **A:** (Recommended) Система опирается только на наличие колоды в Anki. Так как колода удалена, она создается заново и карточки добавляются (как новая страница).
