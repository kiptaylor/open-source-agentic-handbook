# Capability Catalog

The catalog is the versioned, machine-readable layer of the handbook. It
defines skills, agent profiles, orchestration patterns, and reviewed public
assets without granting runtime authority by itself.

## Structure

- [`skills/`](skills/README.md) contains reusable capability packages.
- [`profiles/`](profiles/README.md) assembles bounded agent roles.
- [`orchestration-patterns/`](orchestration-patterns/README.md) defines supported
  coordination shapes.
- [`registry.yaml`](registry.yaml) is the concise top-level index.
- [`registries/`](registries/README.md) contains the canonical agent, skill,
  policy, guide, release, compatibility, and request registries used by the
  downstream generator.
- [`public-assets.json`](public-assets.json) records reviewed binary assets.

Every catalog item is public-safe, versioned, independently reviewable, and
validated against the repository's schemas or structural checks.
