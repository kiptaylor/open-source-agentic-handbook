# Agentic System Foundation

This foundation describes how the handbook will organize agents, reusable
skills, orchestration, and control responsibilities. It is intentionally
framework-neutral and uses no private source material.

## System layers

An agentic system should separate four layers:

1. **Work plane:** bounded agents perform assigned tasks.
2. **Control plane:** independent roles coordinate, observe, prepare context,
   enforce policy decisions, and verify results.
3. **Enforcement plane:** deterministic tool and data gateways apply
   permissions even when an agent makes a mistake.
4. **Human authority:** people approve consequential scope changes, exceptions,
   and publication.

No agent should receive every role or permission. Profiles are assembled from
the smallest set of skills, tools, data, and authority required for a task.

## Foundation components

- [Skills and Profiles](SKILLS_AND_PROFILES.md) defines reusable capability
  contracts and agent profiles.
- [Orchestration and Control](ORCHESTRATION_AND_CONTROL.md) defines task
  envelopes, control-plane roles, scope expansion, and handoffs.
- [First Pass](FIRST_PASS.md) identifies the default material to build before
  adding advanced capabilities.
- [`templates/`](../templates/README.md) contains synthetic, reusable contracts
  for implementation and review.

## Default safety position

- A task starts with explicit scope, permissions, data boundaries, budgets,
  completion criteria, and escalation conditions.
- New objectives, sources, permissions, or side effects require an explicit
  scope-expansion request.
- Context is assembled from approved sources and accompanied by provenance.
- Security policy is enforced at tool and data boundaries, not only through
  model instructions.
- Outputs are independently verified before consequential use.
- Private material is never used as drafting input for this repository.

## Validation baseline

An implementation of this foundation should demonstrate that:

1. A worker cannot silently add a tool, source, or objective.
2. The watchdog can pause looping or drifting work without changing its goal.
3. The context steward can compact and hand off context without losing source
   provenance or hiding omissions.
4. The security governor can block a policy violation, while deterministic
   enforcement prevents the blocked action.
5. The verifier can reject an unsupported result.
6. A human can inspect the task history and approve or reject an escalation.
