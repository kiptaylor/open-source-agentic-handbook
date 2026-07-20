# Repository Guidance

This is a public, ground-up handbook for agentic systems.

## Source boundaries

- Write new material for this repository from first principles.
- Use public, preferably primary, sources for external technical claims.
- Do not copy from private repositories, private notes, internal documents,
  transcripts, messages, session logs, or unpublished examples.
- Do not include proprietary names, private URLs, ticket identifiers, customer
  data, credentials, organization details, or internal process descriptions.
- Use neutral synthetic examples created specifically for this project.
- Record attribution and license compatibility when adapting public material.

## Change discipline

- Keep guidance concise, composable, and framework-neutral where practical.
- Separate durable principles from provider-specific implementation notes.
- Explain permissions, data boundaries, failure behavior, and human escalation
  for workflows that can take actions.
- Add validation guidance with implementation guidance.
- Review every changed file for confidential information before committing.
- Do not add raw exports, generated archives, or binary bundles without an
  explicit public-source review.

## Repository structure

- `docs/` contains project policy, roadmap, and handbook chapters.
- Future runnable examples should live under `examples/` with their own README,
  dependencies, and validation instructions.
- Future reusable templates should live under `templates/` and use only
  synthetic placeholder data.
