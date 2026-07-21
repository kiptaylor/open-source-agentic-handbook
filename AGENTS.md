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

- `docs/` contains the human-readable handbook, policy, and roadmap.
- `catalog/` contains versioned skills, profiles, orchestration patterns, and
  reviewed public-asset records.
- `schemas/` contains machine-readable contract schemas.
- `templates/` contains reusable contracts with synthetic placeholder data.
- `examples/` contains synthetic scenarios with their own README, dependencies,
  and validation instructions.
- `tests/` and `tools/` enforce repository structure and public-safety checks.
- `site/` contains the public project explainer.

Do not create directories for private imports, raw data, recordings,
transcripts, or private notes. Sensitive local scan terms belong only in the
ignored `.public-safety-denylist`.
