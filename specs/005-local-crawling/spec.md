# Feature Specification: Local Only & Local Crawling

**Feature Branch**: `feature/local-crawling`

**Created**: 2026-06-26

**Status**: Draft

**Input**: User description: "Let's change the approach. I'm going to use the service only locally. I don't need to deploy it. So please remove all the sources that it uses and adjust the local run. But there is a problem. When I use local pages, local HTML pages, I can't use scroll. Crawling, so it should crawl locally as well."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Local Extraction from Any Page (Priority: P1)

As a user, when I am viewing any page (including local HTML files via `file://` or `localhost`), I want the extension to trigger a local crawling process that can scroll the page to load all content and extract the text, so that I can generate Anki cards even from my local offline articles.

**Why this priority**: The user has pivoted to a purely local workflow. Without local crawling that supports scrolling, offline pages or pages requiring scroll-to-load won't be fully processed.

**Independent Test**: Save an article locally as an HTML file with some text at the bottom. Open it in the browser, trigger the extension, and verify that the backend successfully extracts the full text (including the text at the bottom).

**Acceptance Scenarios**:

1. **Given** a local HTML page opened in the browser, **When** the user clicks the extension, **Then** the local backend crawls the page, scrolls to ensure lazy-loaded content appears, and extracts the full content for Gemini processing.
2. **Given** a remote page, **When** the user clicks the extension, **Then** the local crawler processes it similarly and extracts the text successfully.

---

### User Story 2 - Simplified Local Run (Priority: P2)

As a developer, I want to run the entire backend and extension locally without relying on remote deployment scripts or third-party APIs (except Gemini), so that the architecture is simpler and completely self-contained.

**Why this priority**: The service will no longer be deployed. All deployment infrastructure (Cloud Run, CI/CD, external scraping APIs) is dead weight and increases complexity.

**Independent Test**: Clone the repository, follow the `README.md` to start the backend with a single command (e.g., `docker-compose up` or `npm run dev`), load the unpacked extension in Chrome, and successfully generate cards.

**Acceptance Scenarios**:

1. **Given** the repository, **When** starting the application locally, **Then** no deployment scripts, Cloud Run configs, or external crawler API keys (like Firecrawl) are required.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST remove all deployment-related files (e.g., `deploy.sh`, GitHub actions for deployment, `policy.yaml`, Cloud Run configs).
- **FR-002**: System MUST replace the remote Firecrawl scraping implementation with a local crawler.
- **FR-003**: The local crawler MUST support scrolling the page to the bottom to trigger lazy-loaded content before extracting the DOM/text.
- **FR-004**: System MUST be able to crawl local `file://` URLs or locally hosted pages if passed from the extension.
- **FR-005**: The extension MUST correctly inject a content script to scroll the page to the bottom, extract the text/HTML directly from the browser, and send the full content to the local backend.

### Key Entities

- **Local Crawler**: A headless browser instance (or the extension's content script) responsible for rendering the page, scrolling, and extracting text.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of deployment infrastructure is removed from the repository.
- **SC-002**: The backend successfully extracts text from a local HTML file that requires scrolling.
- **SC-003**: The `README.md` clearly explains how to run the self-contained local version.

## Assumptions

- The user's machine has the necessary resources to run a headless browser locally (if Puppeteer/Playwright is used on the backend), OR the user is okay with the extension doing the crawling via Content Scripts.
- The Gemini API will still be used for term extraction, so internet access is still required for the AI portion.
