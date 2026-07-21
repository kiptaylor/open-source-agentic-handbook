# Agent and Project Companion Sites

Every agent or agentic project should have a small companion site that gives
people a consistent way to understand, inspect, extend, and govern it. The site
is a human control surface, not the agent runtime and not an unrestricted data
intake channel.

## Minimum contract

A companion site should expose:

1. **Identity:** the capability's purpose, owner, intended users, version, and
   explicit non-goals.
2. **Skills:** installed skills and profiles, their versions, dependencies,
   inputs, outputs, and validation status.
3. **Boundaries:** allowed data, tools, permissions, budgets, side effects,
   failure behavior, and human-escalation paths.
4. **Status:** current health, recent evaluation evidence, known limitations,
   and release state.
5. **Requests:** a structured way to propose a skill, feature, integration, or
   guide by describing the desired outcome and maximum authority.
6. **Evidence:** public provenance, synthetic examples, checks, and decisions
   that support the current release.

The explanation and request shape should remain recognizable across projects,
even when the underlying runtime or provider changes.

## Capability request lifecycle

A request should move through explicit states:

1. A person drafts the desired outcome, data boundary, and maximum authority.
2. The project checks for duplicates, public provenance, and scope fit.
3. Security and context reviews identify new data, tool, and retention risks.
4. A maintainer accepts, narrows, defers, or rejects the request with a reason.
5. Accepted work receives validation criteria before implementation begins.
6. Release evidence is linked back to the request.

A request is a proposal. It never grants a new permission, installs a skill, or
changes an agent profile by itself.

## Data and permission boundaries

- Request forms should collect the minimum concept-level metadata required for
  triage.
- Public sites must reject private notes, real identities, recordings,
  credentials, customer data, internal links, and unpublished examples.
- Raw source material requires a separate, access-controlled intake system with
  consent, isolation, redaction, provenance, approval, retention, and deletion
  controls.
- Local drafts may remain in the browser. Shared submission requires an
  authenticated adapter to an approved issue tracker or roadmap.
- The site may explain or request a skill, but installation and permission
  changes must pass the repository's normal review and enforcement controls.

## Validation baseline

An implementation should demonstrate that:

1. The current skills, versions, permissions, and evaluation state can be
   inspected without access to the runtime's private context.
2. A request cannot silently install a skill or expand agent authority.
3. Private source material is neither required nor accepted by the public
   request path.
4. Accepted requests retain the original outcome, boundary, reviewer decision,
   and release evidence.
5. A human can remove, reject, or escalate a request before any consequential
   action occurs.
