# State and Memory Hygiene

## Purpose

Keep temporary state, durable memory, and context provenance explicit and
appropriately bounded.

## Procedure

1. Classify state by owner, purpose, lifetime, and sensitivity.
2. Store only what the task and retention policy authorize.
3. Preserve provenance and revision information.
4. Record compaction, omission, and deletion.
5. Prevent one task's state from becoming another task's context implicitly.

## Boundaries

No persistent memory write is allowed without explicit authority, retention,
deletion, and review behavior.

## Failure and escalation

Invalidate dependent work when state provenance or integrity is uncertain.

## Validation

Test isolation, compaction integrity, expiry, and deletion with synthetic data.
