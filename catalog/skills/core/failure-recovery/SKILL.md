# Failure Recovery

## Purpose

Return work to a known safe state after errors, interruptions, or invalid
assumptions.

## Procedure

1. Classify the failure and affected artifacts.
2. Stop dependent work when integrity is uncertain.
3. Prefer a bounded retry only when the cause has changed or new evidence exists.
4. Restore from a known version or use the declared safe fallback.
5. Record the failure, recovery, and resume condition.

## Boundaries

Recovery does not authorize destructive cleanup, hidden retries, or scope
expansion.

## Failure and escalation

Escalate repeated failures, uncertain state, unavailable rollback, and policy
or context-integrity problems.

## Validation

Exercise retry exhaustion and rollback with synthetic artifacts.
