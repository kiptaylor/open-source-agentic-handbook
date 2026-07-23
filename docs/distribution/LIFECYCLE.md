# Lifecycle and Updates

The hub and every catalog item use semantic versions. A generated lock pins
versions and content digests so a downstream repository can distinguish a
declared upgrade from unexpected drift.

## Version rules

- **Major:** a manifest, lock, request, approval, or adapter contract may
  require migration.
- **Minor:** compatible agents, skills, guides, or optional fields may be
  added.
- **Patch:** compatible fixes and clarifications may be released without
  expanding authority.

Changing permissions, data boundaries, external recipients, or side effects is
always material even when a content version would otherwise be compatible.

Catalog items move through `draft`, `foundation` or `reviewed`, `deprecated`,
and `removed`. Removal requires a major release unless the item was never in a
stable release.

## Downstream update workflow

1. **Check:** compare the manifest and generated lock with the current hub.
2. **Plan:** write the exact additions, removals, version changes, and digest
   changes without altering the bundle.
3. **Approve:** a person accepts or rejects the plan digest.
4. **Apply:** verify the manifest and approval are unchanged, then regenerate.
5. **Validate:** check the manifest, selected paths, lock, generated prompt,
   catalog snapshot, and history record.
6. **Record:** keep the plan, approval reference, result, and validation summary
   in the generated history directory.

```sh
npm run handbook -- check \
  --manifest /path/to/project/handbook.project.json \
  --plan /path/to/project/update-plan.json

npm run handbook -- approve \
  --plan /path/to/project/update-plan.json \
  --reviewer designated-maintainer \
  --decision approved \
  --output /path/to/project/update-approval.json

npm run handbook -- apply \
  --manifest /path/to/project/handbook.project.json \
  --plan /path/to/project/update-plan.json \
  --approval /path/to/project/update-approval.json
```

`apply` rejects a changed plan, changed manifest, mismatched digest, rejected
decision, or incompatible release. It updates the pinned release when required,
regenerates the bundle, validates it, and records the result.

## Failure behavior

- No approval means no apply.
- A rejected plan leaves the existing bundle untouched.
- An invalid or missing selected item blocks generation.
- A project-skill digest change appears as drift.
- A major release requires a compatible manifest schema before apply.
- A failed apply leaves the prior committed bundle recoverable through source
  control; do not treat the history record as a backup.
