# Downstream Starter

Copy `handbook.project.json` into a project and select only the agents, optional
skills, project-owned skills, and guides it needs. Keep the boundary fields
specific to that project.

From this hub repository:

```sh
npm run handbook -- generate \
  --manifest /path/to/project/handbook.project.json \
  --format bundle
```

The command writes a small `.agentic/` bundle beside the manifest. The hub
remains canonical; the downstream lock records exactly what was selected.

Use `generate --format prompt` when only a prompt is wanted. Use `request`,
`check`, `approve`, `apply`, and `validate` for the local request and update
workflow described in [Lightweight distribution](../docs/distribution/README.md).
