# Contributing

Thank you for helping build the Open Source Agentic Handbook.

## Before contributing

Only submit material that you have the right to publish. Contributions must be
original to this project or based on public material whose license permits the
use. Cite public sources when a factual or technical claim depends on them.

Do not submit private notes, internal documentation, transcripts, messages,
session logs, credentials, customer information, or examples derived from
confidential work.

## Contribution checklist

- The change has a clear audience and purpose.
- Examples are neutral, synthetic, and reproducible.
- Provider-specific behavior is clearly labeled.
- Security, permission, and data-boundary implications are addressed.
- Validation steps are included when the change contains executable material.
- New dependencies and adapted material include appropriate attribution.
- The diff contains no secrets, private URLs, private names, or internal IDs.
- Catalog entries are versioned and referenced by `catalog/registry.yaml`.
- New binary assets appear in `catalog/public-assets.json` with a completed
  public-source review.
- Synthetic scenarios include their own README and validation instructions.

## Validation

Before committing, run:

```sh
npm test
npm run validate
npm run validate:examples
```

Reviewers may create an ignored `.public-safety-denylist` containing sensitive
names or hosts that must not appear. Never commit the populated denylist.

## Style

- Prefer plain language and short, focused documents.
- Define specialized terms before using them heavily.
- Distinguish requirements from recommendations and examples.
- Avoid presenting a single framework's conventions as universal rules.
