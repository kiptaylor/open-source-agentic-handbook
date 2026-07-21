# Safe Tool Use

## Purpose

Use only authorized tools and actions with least privilege and predictable
failure behavior.

## Procedure

1. Resolve the exact tool, target, action, and expected side effect.
2. Confirm permission in the current task envelope.
3. Prefer read-only, reversible, and narrowly targeted actions.
4. Validate the result and record consequential side effects.
5. Stop when the tool response is ambiguous or enforcement denies access.

## Boundaries

Tool adapters explain usage but never grant permission. Deterministic gateways
remain authoritative.

## Failure and escalation

Escalate destructive, externally visible, higher-classification, or newly
requested actions.

## Validation

Test both the allowed path and a denied action at the enforcement boundary.
