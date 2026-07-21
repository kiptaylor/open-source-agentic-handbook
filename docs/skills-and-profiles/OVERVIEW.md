# Skills and Agent Profiles

A **skill** is a versioned capability contract. An **agent profile** selects a
bounded set of skills, tools, data, budgets, and authority for a role. Keeping
these concepts separate makes capabilities reusable without creating one
all-powerful agent.

## Skill buckets

### Core skills

Every acting agent receives the applicable core skills:

- Scope and instruction handling
- Public-source and privacy boundaries
- Planning and termination
- Safe tool and permission use
- Evidence and validation
- Failure recovery
- Human escalation
- State and memory hygiene

### Role packs

Role packs specialize an agent without changing the task's authority:

- **Researcher:** finds and records public evidence.
- **Writer:** creates first-principles guidance.
- **Reviewer:** checks provenance, privacy, licensing, and quality.
- **Builder:** implements and tests an approved design.
- **Maintainer:** reviews compatibility and time-sensitive claims.

### Workflow skills

Workflow skills combine core behavior and role capabilities for one outcome,
such as public knowledge transfer, synthetic-example creation, or chapter
review.

### Tool adapters

Adapters contain provider- or tool-specific instructions. They do not grant
permission by themselves. The task envelope and enforcement layer determine
whether an adapter may be used.

### Policy overlays

Policy overlays apply rules across profiles and workflows. Examples include
public-source publishing, sensitive-data handling, and mandatory human review.

## Composition order

Apply capability layers in this order:

1. Core skills
2. Policy overlays
3. Role pack
4. Workflow skill
5. Authorized tool adapters

Later layers may specialize behavior but cannot weaken an earlier safety or
permission boundary. When instructions conflict, the task pauses and
escalates rather than guessing.

## Skill contract

Each skill should define:

- Purpose and expected output
- Allowed inputs and prohibited inputs
- Required permissions and tools
- Data classification and retention rules
- Procedure and termination conditions
- Failure behavior and safe fallback
- Validation requirements
- Human-escalation conditions
- Public sources, compatibility, owner, and version

Use [the skill specification template](../../templates/skill-spec.md) for new
skills.

## Agent profile contract

Each profile should declare:

- Role and responsibilities
- Included skills and policy overlays
- Allowed tools, sources, and side effects
- Context and memory policy
- Time, cost, retry, and concurrency budgets
- Observable events
- Pause, stop, and escalation behavior

Profiles do not inherit the orchestrator's permissions. Delegated work receives
an explicit, narrower task envelope. Use
[the agent profile template](../../templates/agent-profile.yaml) to define a
profile.

## First profiles

The initial profile catalog should contain:

- Orchestrator
- Watchdog
- Context steward
- Security governor
- Verifier
- Researcher
- Writer
- Builder

The first five are control-plane profiles. They should remain independent from
the worker whose output or behavior they assess.
