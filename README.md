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
[Public Source Policy](docs/PUBLIC_SOURCE_POLICY.md) for the contribution rules.

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

- [Agentic System Foundation](docs/FOUNDATION.md)
- [Skills and Agent Profiles](docs/SKILLS_AND_PROFILES.md)
- [Orchestration and Control](docs/ORCHESTRATION_AND_CONTROL.md)
- [First Pass](docs/FIRST_PASS.md)
- [Reusable Templates](templates/README.md)

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
