# Canonical Registries

These JSON registries are the hub's released inventory. The local generator
reads them directly, so a selected item has one version, path, description, and
compatibility record.

- `agents.json` describes responsibilities, dependencies, permissions, context,
  security constraints, and available additions.
- `skills.json` separates hub core and optional skills; downstream
  project-owned skills are declared in the project manifest.
- `policies.json` lists the rules automatically applied to generated
  integrations.
- `guides.json` exposes concise handbook modules that a project can select.
- `releases.json` names the stable hub release and contract versions.
- `compatibility.json` records supported contract combinations and version
  rules.
- `requests.json` records reviewed hub requests and the transport contract.

Registry changes require repository validation and the release process in
[Lifecycle and updates](../../docs/distribution/LIFECYCLE.md).
