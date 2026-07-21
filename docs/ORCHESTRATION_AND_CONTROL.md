# Orchestration and Control

Orchestration coordinates bounded work. It must not silently expand an agent's
goal, inputs, permissions, or side effects.

## Task envelope

Every task begins with a task envelope that records:

- Objective and completion criteria
- Allowed inputs and data classification
- Explicitly excluded material
- Permitted tools and actions
- Time, cost, retry, and concurrency budgets
- Required validation and evidence
- Human-approval and escalation conditions

The task envelope is the authority boundary for the work. A prompt or tool
adapter cannot broaden it. See
[the task envelope template](../templates/task-envelope.yaml).

## Orchestration patterns

Start with the smallest pattern that can complete the task:

1. **Direct:** one agent performs a bounded task.
2. **Delegated:** an orchestrator assigns a narrower subtask to a specialist.
3. **Parallel:** independent agents perform separable work with explicit merge
   ownership.
4. **Maker-checker:** one agent creates an artifact and an independent agent
   validates it.

Parallel work should be used only when subtasks are independent or multiple
perspectives materially improve verification. Shared state should move through
versioned artifacts and handoffs, not invisible shared context.

## Control-plane roles

### Orchestrator

The orchestrator selects a pattern, creates task envelopes, assigns ownership,
tracks dependencies and budgets, and collects results. It may propose scope
expansion but cannot bypass security or human approval.

### Watchdog

The watchdog observes execution events for loops, stalls, repeated failures,
budget exhaustion, conflicting work, and goal drift. It can pause, stop, and
escalate work. It cannot silently change the objective or edit a worker's
result.

The watchdog should receive the minimum telemetry needed for monitoring rather
than every task's complete data.

### Context steward

The context steward builds an approved context package for each agent. It
tracks source provenance, freshness, data classification, summaries, omitted
material, and the context budget.

It may compact or reorganize approved material, but it cannot introduce an
unapproved source. A compaction records what was retained, summarized, and
omitted. See
[the context manifest template](../templates/context-manifest.yaml).

### Security governor

The security governor evaluates policy, permissions, data boundaries, and
planned side effects before consequential actions. It can allow, deny, or
escalate a request.

The governor is an interpretation and review role, not the sole security
control. Deterministic enforcement at tool and data gateways must still deny
unauthorized actions. See
[the policy decision template](../templates/policy-decision.yaml).

### Verifier

The verifier checks an artifact against completion criteria, required evidence,
tests, and policy decisions. It can accept, reject, or return the result for
revision. It should not be the same profile that produced the artifact.

## Scope expansion

A scope-expansion request is required when work needs any of the following:

- A new or changed objective
- A source not listed in the task envelope
- A higher data classification
- A new tool, permission, or external side effect
- A larger budget or retry limit
- A changed completion criterion
- A new recipient or publication destination

The requesting agent pauses the affected work and records the reason, expected
benefit, new risk, requested authority, alternatives, and rollback plan.
Approval creates a new task-envelope revision; it does not edit history. Use
[the scope expansion template](../templates/scope-expansion-request.yaml).

Security-sensitive, externally visible, destructive, or higher-classification
expansions require human approval. Rejected requests return the task to its
last approved scope or end it safely.

## Handoffs and context limits

Each handoff records the completed work, evidence, artifacts, unresolved risks,
remaining budget, context manifest, and next allowed action. It must distinguish
facts, inferences, and proposals. See
[the handoff template](../templates/handoff.yaml).

When context cannot fit:

1. Preserve the objective, authority boundaries, decisions, evidence, and open
   risks.
2. Summarize approved supporting material with provenance.
3. Record omissions explicitly.
4. Ask for scope reduction or a new task when safe compaction is not possible.

## Failure and escalation

- A worker stops after its retry budget or when progress cannot be verified.
- A watchdog pause is recorded with evidence and a resume condition.
- A context integrity problem invalidates dependent work until reviewed.
- A security denial prevents the action and records the applicable rule.
- A verifier rejection returns actionable findings without expanding scope.
- Humans resolve policy exceptions, material ambiguity, and consequential
  changes in authority.

## Validation scenarios

Implementations should test at least these synthetic scenarios:

1. A worker requests an unapproved source.
2. An agent repeats a failing action until the watchdog pauses it.
3. A context summary drops a required decision and fails integrity review.
4. The security governor denies an action and the tool gateway also blocks it.
5. The verifier rejects an output with missing evidence.
6. A human approves a scope expansion and a new task-envelope revision is
   issued.
