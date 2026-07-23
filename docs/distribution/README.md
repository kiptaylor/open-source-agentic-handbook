# Lightweight Distribution

The hub owns the canonical agent, skill, policy, guide, release, compatibility,
and request registries. A downstream repository owns one small selection
manifest and the generated artifacts it chooses to commit.

## Downstream footprint

Copy [`starter/handbook.project.json`](../../starter/handbook.project.json) to
the downstream repository, then edit:

- the project identifier and description;
- selected agents, optional hub skills, project-owned skills, and guides;
- allowed data, permissions, side effects, and context;
- the output directory.

Core skills are derived from the selected agents. Policies required by the hub
release are automatic. A downstream project cannot omit those controls through
its manifest.

From a checkout of this hub, create a portable bundle:

```sh
npm run handbook -- generate \
  --manifest /path/to/project/handbook.project.json \
  --format bundle
```

The generated directory contains:

- `INTEGRATION.md`: the prompt and operating contract;
- `catalog.json`: the selected agent, skill, policy, and guide summaries;
- `handbook.lock.json`: exact versions and content digests;
- `README.md`: local use and update instructions.

Use `--format prompt` to print only the integration prompt. The generator has no
runtime dependency beyond Node.js 22.

## Project-owned skills

A project skill is declared with an identifier, semantic version, relative
path, and summary. The generator verifies that the referenced file exists and
pins its digest. Project skills do not become hub catalog items and cannot
weaken generated hub policies.

## Requests and transport

Copy the capability request template, describe the desired outcome and maximum
authority, then export it:

```sh
npm run handbook -- request \
  --manifest /path/to/project/handbook.project.json \
  --request /path/to/project/capability-request.json
```

The default transport is a local JSON file in `.agentic/requests/`. It is a
proposal, not an installation or permission grant. The envelope includes a
stable transport contract so a GitHub issue, pull request, or authenticated
service adapter can route the same record later.

## Approval boundary

Requests and update plans bind review to a SHA-256 digest. The local `approve`
command records a deliberate reviewer decision but does not authenticate the
reviewer. Teams that need identity assurance should add a signed pull request
or authenticated adapter without changing the underlying artifact.

See [Lifecycle and updates](LIFECYCLE.md) for drift handling.
