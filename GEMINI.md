# Project Constitution

**Project Type:** Greenfield
**Description:** Universal modern solution for creating Anki cards from terms on a Google Chrome page. Chrome extension plus a backend that connects the extension and Anki cards.

## Core Principles

### I. Speed of Iteration

Prioritize shipping and rapid prototyping over perfect architecture. The goal is to validate ideas and have fun building.
- Avoid premature optimization.
- Write code that works first, refactor only when it becomes a blocker.

### II. Monolith First

Keep everything in a single project/repository unless there's an explicit and unavoidable reason to split.
- Microservices or complex multi-package architectures are PROHIBITED unless explicitly required by the domain.

### III. Pragmatic Testing

Write tests for critical paths only.
- Do not chase 100% test coverage.
- Focus on end-to-end functionality or the most complex logic blocks.

### IV. Simple Tooling

Use built-in frameworks and libraries.
- Avoid complex third-party abstractions until proven necessary.
- Trust the framework's default way of doing things.

### V. Documentation as Code

Keep documentation minimal.
- Prefer self-documenting code with clear variable and function names.
- A simple README explaining how to run the project is usually sufficient.

## Development Workflow & Quality Gates

- Work proceeds iteratively. 
- Features can be built directly into the application code without mandatory library abstraction.

## Communication & Language

> Language of communication: Communicate with the user in the language they use to ask the question. However, all documentation, code comments, and technical plans MUST be written in English!

## Governance

This constitution defines the lightweight rules for this pet project.
- **Amendments**: Can be made on the fly as the project evolves.
- **Compliance review**: Keep it fun and productive. If a rule slows down development too much without providing value, drop it.
