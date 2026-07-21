# First Pass

The first pass establishes the contracts and review behavior needed before the
handbook adds advanced agents, connectors, or content-ingestion features.

Machine-readable definitions for this work live in [`catalog/`](../../catalog/README.md).

## Default handbook guidance

The initial chapters should cover:

- Foundations and terminology
- Instructions and context boundaries
- Tools, permissions, and least privilege
- Human review, interruption, and escalation
- Evaluation, failure recovery, and release criteria
- Security and data boundaries
- One end-to-end example using only synthetic data

Each chapter should follow the same structure: durable principle, design
pattern, permissions and data boundaries, failure modes, validation checklist,
and synthetic example.

## Default system artifacts

The first implementation layer should provide:

- Core skill specifications
- Control-plane and worker profiles
- Task-envelope and handoff contracts
- Context manifests and scope-expansion requests
- Security-policy decisions paired with deterministic enforcement examples
- Maker-checker validation examples

## Default decisions

- New candidates begin as **Candidate** or **Rewrite**, never **Ready**.
- Public drafting begins only from a concept-level outcome.
- External technical claims require public evidence.
- High-risk security, memory, and external-action guidance remains on hold until
  its validation and human-escalation behavior is complete.

## Intentionally deferred

The first pass does not include:

- Raw note, recording, audio, video, or transcript ingestion
- Connectors to private repositories or personal knowledge systems
- Real names, organizations, incidents, workflows, URLs, identifiers, or data
- Autonomous publication or broad external write permissions
- Long-term memory implementations
- Unbounded multi-agent swarms
- Provider-specific adapters in the durable core

Future media ingestion requires a separately reviewed workflow for consent,
retention, transcription isolation, personal-data detection, redaction,
provenance, human approval, and deletion.

## Acceptance criteria

The first pass is complete when a synthetic task can:

1. Select a profile and approved skills.
2. Run within an explicit task envelope.
3. Request rather than assume scope expansion.
4. Survive a context compaction and handoff with provenance intact.
5. Be paused by a watchdog and blocked by deterministic policy enforcement.
6. Be independently verified and escalated to a human when required.
7. Pass a complete public-source and confidential-information review.
