# Feature Specification: Terms Logger Scaffold

**Feature Branch**: `feature/terms-logger-scaffold`

**Created**: 2026-06-22

**Status**: Draft

**Input**: User description: "Необходимо сделать скаффолд проекта для последующего деплоя в инфраструктуре Google Cloud с помощью GitHub WorkflowДля локальной разработки: расширение для браузера Google Chrome, которое позволяет проанализировать содержимое страницы открытой, найти все технические термины и аббревиатуры и отправить их на бэкенд, запущенный в Google Cloud Run, на котором они в данную секунду просто логируются, выводятся в консоль."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Extract and Send Page Title (Priority: P1)

As a user, when I click the extension icon on a webpage, the Chrome extension should extract the page title and source URL, and send them to the backend, so that they can be logged.

**Why this priority**: This is the core functionality of the minimum viable product. Validates both extension injection/communication and backend connectivity without the complexity of text parsing.

**Independent Test**: Load a test page, verify the extension sends a network request containing the title, and check the backend logs to confirm the title was received.

**Acceptance Scenarios**:

1. **Given** a loaded webpage, **When** the user clicks the extension icon, **Then** it extracts the HTML page title and source URL.
2. **Given** the extracted data, **When** the extension sends it to the backend as a JSON payload, **Then** the backend receives the request and outputs the payload to the console.
3. **Given** code pushed to the repository, **When** the GitHub Workflow is triggered, **Then** it successfully builds and is configured to deploy the backend to Google Cloud Run.

---

### Edge Cases

- How does the system handle extremely long pages? (It doesn't matter, it only extracts the title).
- What happens if the backend is unreachable? (The extension MUST show a toast notification with an error message to the user).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST include a Google Chrome extension capable of reading the DOM of the active tab upon clicking the extension icon.
- **FR-002**: Extension MUST extract the `title` and source URL of the currently opened HTML page.
- **FR-003**: Extension MUST transmit the extracted data as a JSON payload to a remote backend service via HTTP.
- **FR-004**: System MUST include a backend service built with Node.js and Fastify designed to run on Google Cloud Run.
- **FR-005**: Backend MUST log the received payload to standard output (console).
- **FR-006**: System MUST include a GitHub Actions workflow configured for deploying the backend to Google Cloud Run.
- **FR-007**: Extension MUST display a toast notification injected into the webpage's DOM with an error message if the backend is unreachable or returns an error.
- **FR-008**: Backend MUST implement basic CORS configuration to restrict origins to the extension's ID.

### Key Entities *(include if feature involves data)*

- **Payload**: A structured JSON object sent from the extension to the backend, containing the page `title` and the source URL.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Chrome extension successfully installs locally and runs on arbitrary webpages.
- **SC-002**: Extension successfully extracts and sends terms to a locally or cloud-hosted backend.
- **SC-003**: Backend successfully prints received terms to the console.
- **SC-004**: GitHub Actions workflow passes syntactically and is ready for real GCP credentials.

## Assumptions

- Users will install the extension locally via "Load unpacked" during development.
- The backend will expose a simple REST endpoint (e.g., `POST /api/terms`).
- "Scaffold" means the infrastructure and minimal code are present, but the parsing logic might be a simplified placeholder initially.

## Clarifications

- **Q**: How should the term extraction process be triggered in the Chrome extension?
  - **A**: Manually by clicking the extension icon in the browser toolbar.
- **Q**: What should the initial payload sent to the backend contain?
  - **A**: Both the page title and the source URL (as a structured JSON object).
- **Q**: Which technology stack should be used for the backend scaffold targeting Google Cloud Run?
  - **A**: Fastify.
- **Q**: For the scaffold, how should the backend secure the endpoint from arbitrary external requests?
  - **A**: Basic CORS configuration restricting origins to the extension's ID.
- **Q**: Where should this notification be displayed?
  - **A**: Injected directly into the webpage's DOM via the content script.
