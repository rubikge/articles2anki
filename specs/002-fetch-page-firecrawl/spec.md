# Feature Specification: Fetch Page Content via Firecrawl

**Feature Branch**: `feature/002-fetch-page-firecrawl`

**Created**: 2026-06-23

**Status**: Draft

**Input**: User description: "Pass a link to the backend and receive the page content the exact same way it is done in idealista-agent via a third-party server, using an API token. Output the result structure and the start of the body to logs."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fetch and Log Page Content (Priority: P1)

As a system process receiving an article URL, I want the backend to fetch the page content using the third-party API (Firecrawl) so that it can bypass blocking and retrieve clean markdown, which is then logged for verification.

**Why this priority**: Fetching the content reliably is the core requirement to eventually process the text into Anki cards.

**Independent Test**: Provide a URL to the backend, trigger the fetch process, and check the backend logs to see the API response structure and a snippet of the fetched content.

**Acceptance Scenarios**:

1. **Given** a valid article URL, **When** the backend processes the request, **Then** it makes a successful call to the scraping API using the configured token, and the logs display the resulting structure with the beginning of the markdown content.
2. **Given** an invalid URL or an error from the scraping API, **When** the backend attempts to fetch it, **Then** the failure is handled gracefully and the error is logged.

---

### Edge Cases

- What happens when the scraping API is down or times out?
- What happens when the page contains no extractable text?
- How does the system handle missing or invalid API tokens?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST make a request to the third-party scraping API to fetch page content, mirroring the `idealista-agent` implementation.
- **FR-002**: System MUST authenticate with the API using a token stored in configuration/environment variables.
- **FR-003**: System MUST extract the resulting markdown or HTML from the response.
- **FR-004**: System MUST log the API response structure and the first portion (e.g., 500 characters) of the retrieved content.

### Key Entities

- **Page Content Response**: The structured response from the third-party service containing the URL's extracted markdown/text.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Backend successfully fetches content from URLs that normally block automated requests (by delegating to the third-party API).
- **SC-002**: The logs output correctly shows the expected data structure and text snippet for debugging purposes.

## Assumptions

- The specific service to use is Firecrawl, identical to the `idealista-agent` project.
- The API Key will be securely provided to the backend environment.
- For now, the fetched content is only required to be logged, without database persistence or further processing into cards.
