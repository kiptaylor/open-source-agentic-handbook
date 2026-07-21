# Open Source Agentic Handbook

A ground-up, open-source handbook for designing, building, evaluating, and
operating agentic systems.

## Status

This project is at its foundation stage. The initial work is defining a clear,
public-safe structure before adding handbook guidance or examples.

## Goals

- Explain agentic-system concepts in practical language.
- Separate durable principles from model- or framework-specific details.
- Provide small, reproducible examples built specifically for this project.
- Treat safety, evaluation, observability, and human oversight as core design
  concerns.
- Keep the material useful across providers, languages, and runtimes.

## Content boundaries

This repository is built from first principles and public sources. It does not
import private repository history, private notes, transcripts, internal process
documents, proprietary examples, or confidential data. See
[Public Source Policy](docs/policies/PUBLIC_SOURCE_POLICY.md) for the
contribution rules.

## Planned handbook areas

- Foundations and terminology
- Agent instructions and context
- Tools and permissions
- State, memory, and knowledge
- Planning and orchestration
- Human review and escalation
- Evaluation and testing
- Observability and operations
- Security and data boundaries
- Framework-neutral examples

## Foundation

The initial architecture separates bounded worker agents from an independent
control plane and deterministic enforcement. Start with:

- [Agentic System Foundation](docs/foundations/FOUNDATION.md)
- [Skills and Agent Profiles](docs/skills-and-profiles/OVERVIEW.md)
- [Orchestration and Control](docs/orchestration/OVERVIEW.md)
- [First Pass](docs/foundations/FIRST_PASS.md)
- [Reusable Templates](templates/README.md)

## Project structure

- [`docs/`](docs/README.md) is the human-readable handbook.
- [`catalog/`](catalog/README.md) contains versioned skills, profiles, and
  orchestration patterns.
- [`schemas/`](schemas/README.md) defines machine-readable contracts.
- [`templates/`](templates/README.md) contains synthetic starting points.
- [`examples/`](examples/README.md) contains validated synthetic scenarios.
- [`tests/`](tests/repository/foundation.test.mjs) and [`tools/`](tools/README.md)
  enforce structure and public-safety checks.
- [`site/`](site/README.md) contains Transfer Desk.

Validate the complete repository with Node.js 22 or later:

```sh
npm test
npm run validate
npm run validate:examples
```

Sensitive terms can be placed in a local `.public-safety-denylist`. That file
is ignored by Git and its values are never printed by the validator.

The working sequence is maintained in [Roadmap](docs/ROADMAP.md).

## Transfer Desk

The local-first [Transfer Desk](site/README.md) helps reviewers decide which
concept-level handbook topics should be rewritten for this public repository.
It applies the public-source policy as a five-gate review and exports a drafting
manifest without storing private source material.

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before
opening a change.

## License

Licensed under the [Apache License 2.0](LICENSE).
