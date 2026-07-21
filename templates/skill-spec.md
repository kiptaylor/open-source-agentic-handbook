# Skill: `<public-safe-name>`

## Metadata

- Version: `<semantic-version>`
- Owner: `<public-maintainer-role>`
- Status: `<draft|reviewed|deprecated>`
- Compatibility: `<framework-neutral assumptions>`

## Purpose

Describe one bounded capability and its expected output.

## Inputs

- Allowed: `<approved input classes>`
- Prohibited: `<private or unsafe input classes>`
- Preconditions: `<required state or evidence>`

## Outputs

- Artifact: `<output type>`
- Completion criteria: `<observable conditions>`
- Provenance: `<required source record>`

## Permissions and data boundaries

- Tools: `<explicit allowlist>`
- Actions: `<read, propose, write, or external side effect>`
- Data classification: `<public|restricted synthetic label>`
- Retention: `<none|task lifetime|approved duration>`

## Procedure

1. Validate the task envelope and inputs.
2. Perform the bounded capability.
3. Validate the output and record evidence.
4. Stop or hand off when completion criteria are met.

## Failure behavior

- Retry limit: `<count>`
- Safe fallback: `<bounded fallback>`
- Stop conditions: `<conditions>`

## Validation

- Automated checks: `<checks>`
- Human review: `<required review>`
- Synthetic test cases: `<fixtures>`

## Escalation

List conditions that require a scope-expansion request, security review, or
human decision.

## Public sources

Record public sources, attribution, and license compatibility. Leave this
section empty when the skill is entirely original and makes no external claim.
