# Contract Schemas

These JSON Schemas describe the stable shape of machine-readable contracts.
They intentionally permit documented extensions while requiring the authority,
data, validation, and escalation fields needed by the foundation.

Schema identifiers use the reserved `example.invalid` domain and do not point
to a private service.

## Runtime and distribution contracts

- [`project-manifest.schema.json`](project-manifest.schema.json) keeps a
  downstream selection small and explicit.
- [`handbook-lock.schema.json`](handbook-lock.schema.json) pins the selected
  content by version and digest.
- [`capability-request.schema.json`](capability-request.schema.json) defines a
  locally exportable request that a future transport adapter can route.
- [`request-export.schema.json`](request-export.schema.json) wraps that request
  with source, routing, and digest metadata.
- [`approval.schema.json`](approval.schema.json) binds a human decision to the
  exact digest reviewed.
- [`update-plan.schema.json`](update-plan.schema.json) records drift before any
  generated integration changes.
- [`update-record.schema.json`](update-record.schema.json) records an approved,
  applied, and validated result.
