# Open Source Agentic Handbook

A ground-up, open-source handbook for designing, building, evaluating, and
operating agentic systems.

## Status

Version 1 is operational. The hub contains canonical registries, bounded agent
and skill definitions, machine-readable contracts, a lightweight downstream
generator, local request exports, approval-gated drift updates, synthetic
scenarios, and repository-wide validation.

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

## Handbook areas

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

## Start here

The initial architecture separates bounded worker agents from an independent
control plane and deterministic enforcement. Start with:

- [Agentic System Foundation](docs/foundations/FOUNDATION.md)
- [Skills and Agent Profiles](docs/skills-and-profiles/OVERVIEW.md)
- [Orchestration and Control](docs/orchestration/OVERVIEW.md)
- [First Pass](docs/foundations/FIRST_PASS.md)
- [Agent and Project Companion Sites](docs/foundations/COMPANION_SITES.md)
- [Lightweight Distribution](docs/distribution/README.md)
- [Lifecycle and Updates](docs/distribution/LIFECYCLE.md)
- [Reusable Templates](templates/README.md)

## Add it to a repository

Copy [`starter/handbook.project.json`](starter/handbook.project.json), select
only the agents, optional skills, project skills, and guides the project needs,
then generate a prompt or portable bundle from this hub checkout:

```sh
npm run handbook -- generate \
  --manifest /path/to/project/handbook.project.json \
  --format bundle
```

The generated bundle contains an integration prompt, selected catalog snapshot,
and content-digest lock. The same dependency-free command exports capability
requests and runs the check, plan, approve, apply, validate, and record update
workflow:

```sh
npm run handbook -- help
```

The backend-free child-to-hub request and response flow is documented in
[Lightweight Distribution](docs/distribution/README.md#local-round-trip).

## Project structure

- [`docs/`](docs/README.md) is the human-readable handbook.
- [`catalog/`](catalog/README.md) contains versioned skills, profiles, and
  orchestration patterns.
- [`schemas/`](schemas/README.md) defines machine-readable contracts.
- [`templates/`](templates/README.md) contains synthetic starting points.
- [`examples/`](examples/README.md) contains validated synthetic scenarios.
- [`starter/`](starter/README.md) is the minimal downstream adoption kit.
- [`tests/`](tests/repository/foundation.test.mjs) and [`tools/`](tools/README.md)
  enforce structure and public-safety checks.
- [`site/`](site/README.md) contains the public project explainer.

Validate the complete repository with Node.js 22 or later:

```sh
npm test
npm run validate
npm run validate:examples
```

Sensitive terms can be placed in a local `.public-safety-denylist`. That file
is ignored by Git and its values are never printed by the validator.

The working sequence is maintained in [Roadmap](docs/ROADMAP.md).

## Project explainer

The [project site](site/README.md) explains the hub, orchestration roles, skill
buckets, downstream setup, request and approval path, upgrade workflow, and
the intentionally deferred transport adapters. Its capability request composer
keeps drafts in the browser and exports the same local-first request shape.

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before
opening a change.

## License

Licensed under the [Apache License 2.0](LICENSE).
