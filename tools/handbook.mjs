#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  access,
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile,
} from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const toolDirectory = dirname(fileURLToPath(import.meta.url));
export const repositoryRoot = resolve(toolDirectory, "..");

const registryNames = [
  "agents",
  "skills",
  "policies",
  "guides",
  "releases",
  "compatibility",
  "requests",
];

function fail(message) {
  throw new Error(message);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function requireObject(value, label) {
  if (!isObject(value)) fail(`${label} must be an object.`);
}

function requireString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${label} must be a non-empty string.`);
  }
}

function requireStringArray(value, label, { nonEmpty = false } = {}) {
  if (
    !Array.isArray(value) ||
    value.some((item) => typeof item !== "string" || item.trim() === "") ||
    (nonEmpty && value.length === 0)
  ) {
    fail(`${label} must be ${nonEmpty ? "a non-empty " : "an "}array of strings.`);
  }
  if (new Set(value).size !== value.length) fail(`${label} must not contain duplicates.`);
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isObject(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])]),
  );
}

export function digestValue(value) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    fail(`Cannot read JSON at ${path}: ${detail}`);
  }
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(path) {
  const info = await stat(path);
  if (info.isFile()) return [path];
  if (!info.isDirectory()) fail(`Selected path is not a file or directory: ${path}`);

  const results = [];
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const child = join(path, entry.name);
    if (entry.isDirectory()) results.push(...(await listFiles(child)));
    if (entry.isFile()) results.push(child);
  }
  return results.sort();
}

async function digestPath(path) {
  const files = await listFiles(path);
  const hash = createHash("sha256");
  for (const file of files) {
    hash.update(file.slice(path.length));
    hash.update("\0");
    hash.update(await readFile(file));
    hash.update("\0");
  }
  return hash.digest("hex");
}

export async function loadRegistries(root = repositoryRoot) {
  const entries = await Promise.all(
    registryNames.map(async (name) => {
      const path = join(root, "catalog", "registries", `${name}.json`);
      const registry = await readJson(path);
      if (registry.registry !== name || registry.schema_version !== 1) {
        fail(`${path} is not a ${name} registry at schema version 1.`);
      }
      return [name, registry];
    }),
  );
  return Object.fromEntries(entries);
}

function byId(registry, id, label) {
  const item = registry.items.find((candidate) => candidate.id === id);
  if (!item) fail(`Unknown ${label} "${id}".`);
  return item;
}

function releaseByVersion(registries, version) {
  const release = registries.releases.items.find((item) => item.version === version);
  if (!release) fail(`Unsupported hub release "${version}".`);
  const compatible = registries.compatibility.matrix.some(
    (entry) =>
      entry.hub_release === version &&
      entry.manifest_schema === 1 &&
      entry.lock_schema === 1 &&
      entry.status === "supported",
  );
  if (!compatible) fail(`Hub release "${version}" is not compatible with manifest schema 1.`);
  return release;
}

export async function validateManifest(
  manifest,
  manifestPath,
  registries,
) {
  registries ??= await loadRegistries();
  requireObject(manifest, "Manifest");
  if (manifest.format !== "open-agentic-handbook/project-manifest@1") {
    fail("Manifest format must be open-agentic-handbook/project-manifest@1.");
  }

  requireObject(manifest.project, "project");
  requireString(manifest.project.id, "project.id");
  if (!/^[a-z][a-z0-9-]+$/.test(manifest.project.id)) {
    fail("project.id must use lower-case letters, numbers, and hyphens.");
  }
  requireString(manifest.project.description, "project.description");
  requireString(manifest.release, "release");
  releaseByVersion(registries, manifest.release);

  requireObject(manifest.selection, "selection");
  requireStringArray(manifest.selection.agents, "selection.agents", { nonEmpty: true });
  const selectedAgentIds = new Set(manifest.selection.agents);
  for (const id of manifest.selection.agents) {
    const agent = byId(registries.agents, id, "agent");
    for (const dependency of agent.dependencies?.agents ?? []) {
      if (!selectedAgentIds.has(dependency)) {
        fail(`Agent "${id}" requires selected agent "${dependency}".`);
      }
    }
  }

  requireObject(manifest.selection.skills, "selection.skills");
  if (manifest.selection.skills.core !== "agent-required") {
    fail("selection.skills.core must be agent-required.");
  }
  requireStringArray(manifest.selection.skills.optional, "selection.skills.optional");
  for (const id of manifest.selection.skills.optional) byId(registries.skills, id, "skill");

  if (!Array.isArray(manifest.selection.skills.project)) {
    fail("selection.skills.project must be an array.");
  }
  const hubSkillIds = new Set(registries.skills.items.map((item) => item.id));
  const projectIds = new Set();
  for (const [index, skill] of manifest.selection.skills.project.entries()) {
    requireObject(skill, `selection.skills.project[${index}]`);
    for (const key of ["id", "version", "path", "summary"]) {
      requireString(skill[key], `selection.skills.project[${index}].${key}`);
    }
    if (!/^[a-z][a-z0-9-]+$/.test(skill.id)) {
      fail(`Project skill "${skill.id}" has an invalid identifier.`);
    }
    if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(skill.version)) {
      fail(`Project skill "${skill.id}" must use a semantic version.`);
    }
    if (hubSkillIds.has(skill.id)) {
      fail(`Project skill "${skill.id}" conflicts with a hub skill.`);
    }
    if (projectIds.has(skill.id)) fail(`Duplicate project skill "${skill.id}".`);
    projectIds.add(skill.id);
    const projectPath = resolve(dirname(manifestPath), skill.path);
    if (!(await pathExists(projectPath))) {
      fail(`Project skill "${skill.id}" does not exist at ${skill.path}.`);
    }
  }

  requireStringArray(manifest.selection.guides, "selection.guides");
  for (const id of manifest.selection.guides) byId(registries.guides, id, "guide");

  requireObject(manifest.boundaries, "boundaries");
  requireStringArray(manifest.boundaries.data, "boundaries.data", { nonEmpty: true });
  requireStringArray(manifest.boundaries.permissions, "boundaries.permissions", {
    nonEmpty: true,
  });
  requireString(manifest.boundaries.external_side_effects, "boundaries.external_side_effects");
  requireString(manifest.boundaries.context, "boundaries.context");

  requireObject(manifest.output, "output");
  requireString(manifest.output.directory, "output.directory");
  if (!["prompt", "bundle"].includes(manifest.output.mode)) {
    fail("output.mode must be prompt or bundle.");
  }

  return {
    project: manifest.project.id,
    release: manifest.release,
    agents: manifest.selection.agents.length,
    optionalSkills: manifest.selection.skills.optional.length,
    projectSkills: manifest.selection.skills.project.length,
    guides: manifest.selection.guides.length,
  };
}

function resolveSelection(manifest, registries) {
  const agents = manifest.selection.agents.map((id) => byId(registries.agents, id, "agent"));
  const dependencySkillIds = new Set(
    agents.flatMap((agent) => agent.dependencies?.skills ?? []),
  );
  const explicitSkillIds = new Set(manifest.selection.skills.optional);
  const allHubSkillIds = [...new Set([...dependencySkillIds, ...explicitSkillIds])];
  const allHubSkills = allHubSkillIds.map((id) => byId(registries.skills, id, "skill"));
  const coreSkills = allHubSkills.filter((skill) => skill.bucket === "core");
  const optionalSkills = allHubSkills.filter((skill) => skill.bucket !== "core");
  const release = releaseByVersion(registries, manifest.release);
  const policies = release.required_policies.map((id) =>
    byId(registries.policies, id, "policy"),
  );
  const guides = manifest.selection.guides.map((id) =>
    byId(registries.guides, id, "guide"),
  );

  return {
    agents,
    coreSkills,
    optionalSkills,
    projectSkills: manifest.selection.skills.project,
    policies,
    guides,
    release,
  };
}

async function snapshotHubItem(item, kind) {
  const contentPath = resolve(repositoryRoot, item.path);
  if (!(await pathExists(contentPath))) fail(`${kind} "${item.id}" has a missing path.`);
  return {
    id: item.id,
    version: item.version,
    kind,
    path: item.path,
    digest: await digestPath(contentPath),
  };
}

async function snapshotProjectSkill(item, manifestPath) {
  return {
    id: item.id,
    version: item.version,
    kind: "project-skill",
    path: item.path,
    digest: await digestPath(resolve(dirname(manifestPath), item.path)),
  };
}

async function buildSelectionSnapshot(selection, manifestPath) {
  return {
    agents: await Promise.all(
      selection.agents.map((item) => snapshotHubItem(item, "agent")),
    ),
    skills: await Promise.all([
      ...selection.coreSkills.map((item) => snapshotHubItem(item, "core-skill")),
      ...selection.optionalSkills.map((item) => snapshotHubItem(item, "optional-skill")),
      ...selection.projectSkills.map((item) => snapshotProjectSkill(item, manifestPath)),
    ]),
    policies: await Promise.all(
      selection.policies.map((item) => snapshotHubItem(item, "policy")),
    ),
    guides: await Promise.all(
      selection.guides.map((item) => snapshotHubItem(item, "guide")),
    ),
  };
}

function selectedCatalog(manifest, selection) {
  return {
    format: "open-agentic-handbook/selected-catalog@1",
    release: manifest.release,
    project_id: manifest.project.id,
    agents: selection.agents,
    skills: {
      core: selection.coreSkills,
      optional: selection.optionalSkills,
      project: selection.projectSkills,
    },
    policies: selection.policies,
    guides: selection.guides,
  };
}

function bullets(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function renderAgent(agent) {
  return [
    `### ${agent.id} ${agent.version}`,
    "",
    agent.summary,
    "",
    "Responsibilities:",
    bullets(agent.responsibilities),
    "",
    "Allowed:",
    bullets(agent.permissions.may),
    "",
    "Prohibited:",
    bullets(agent.permissions.must_not),
    "",
    `Context: ${agent.context}`,
    "",
    `Security: ${agent.security}`,
  ].join("\n");
}

function renderSkillList(title, items) {
  if (items.length === 0) return [`### ${title}`, "", "- None selected."].join("\n");
  return [
    `### ${title}`,
    "",
    ...items.map((item) => `- **${item.id} ${item.version}:** ${item.summary}`),
  ].join("\n");
}

export function renderIntegrationPrompt(manifest, selection) {
  return [
    `# Agent integration: ${manifest.project.id}`,
    "",
    `Hub release: ${manifest.release}`,
    "",
    manifest.project.description,
    "",
    "## Operating contract",
    "",
    "- Work only inside an explicit task envelope with objective, scope, authority, budgets, validation, and stop conditions.",
    "- Delegate narrower authority only. A prompt, skill, or tool adapter cannot expand the active envelope.",
    "- Use deterministic permission and data controls for consequential actions.",
    "- Route work through artifacts and handoffs that preserve facts, inferences, decisions, evidence, open risks, remaining budget, and the next allowed action.",
    "- Pause for human review before a material scope, permission, data-boundary, recipient, or external-side-effect change.",
    "- Finish only after the selected verifier or required validation accepts the result.",
    "",
    "## Project boundaries",
    "",
    "Approved data:",
    bullets(manifest.boundaries.data),
    "",
    "Approved permissions:",
    bullets(manifest.boundaries.permissions),
    "",
    `External side effects: ${manifest.boundaries.external_side_effects}`,
    "",
    `Context behavior: ${manifest.boundaries.context}`,
    "",
    "## Selected agents",
    "",
    selection.agents.map(renderAgent).join("\n\n"),
    "",
    "## Selected skills",
    "",
    renderSkillList("Agent-required core", selection.coreSkills),
    "",
    renderSkillList("Hub optional", selection.optionalSkills),
    "",
    renderSkillList("Project-owned", selection.projectSkills),
    "",
    "## Applied policies",
    "",
    ...selection.policies.map(
      (policy) => `- **${policy.id} ${policy.version}:** ${policy.summary}`,
    ),
    "",
    "## Selected guides",
    "",
    ...selection.guides.map(
      (guide) => `- **${guide.id} ${guide.version}:** ${guide.summary}`,
    ),
    "",
    "## Requests and updates",
    "",
    "- A capability request is a proposal. It does not install a skill, change a profile, or grant permission.",
    "- Export requests through the local request artifact; a transport adapter may route the unchanged envelope later.",
    "- Update through check, plan, human approval, apply, validate, and record.",
    "- Treat the generated lock as the selected-version and content-digest record.",
    "",
    "This file is generated from the project manifest and hub registries. Change the manifest or submit a bounded request instead of editing this file.",
    "",
  ].join("\n");
}

function registryFingerprint(registries, selection) {
  return digestValue({
    release: selection.release,
    compatibility: registries.compatibility.matrix.find(
      (entry) => entry.hub_release === selection.release.version,
    ),
    policies: selection.policies.map(({ id, version }) => ({ id, version })),
  });
}

async function buildLock(manifest, manifestPath, registries, selection, now) {
  const snapshot = await buildSelectionSnapshot(selection, manifestPath);
  return {
    format: "open-agentic-handbook/lock@1",
    release: manifest.release,
    project_id: manifest.project.id,
    manifest_digest: digestValue(manifest),
    registry_digest: registryFingerprint(registries, selection),
    selection_digest: digestValue(snapshot),
    selection: snapshot,
    generated_at: now.toISOString(),
  };
}

function generatedReadme(manifest) {
  return [
    "# Generated Agent Integration",
    "",
    `This bundle pins Open Agentic Handbook ${manifest.release} for \`${manifest.project.id}\`.`,
    "",
    "- `INTEGRATION.md` is the generated operating prompt.",
    "- `catalog.json` explains the selected agents, skills, policies, and guides.",
    "- `handbook.lock.json` pins versions and content digests.",
    "- `requests/` receives local capability-request exports.",
    "- `history/` receives approval-gated update records.",
    "",
    "Do not hand-edit generated files. Change the project manifest, check drift,",
    "review the plan, and apply an approved update.",
    "",
  ].join("\n");
}

function resolveBundleDirectory(manifest, manifestPath, override) {
  return override
    ? resolve(override)
    : resolve(dirname(manifestPath), manifest.output.directory);
}

export async function validateBundle(bundleDirectory, expectedProject) {
  const required = ["INTEGRATION.md", "README.md", "catalog.json", "handbook.lock.json"];
  for (const name of required) {
    if (!(await pathExists(join(bundleDirectory, name)))) {
      fail(`Generated bundle is missing ${name}.`);
    }
  }
  const prompt = await readFile(join(bundleDirectory, "INTEGRATION.md"), "utf8");
  if (!prompt.includes("## Operating contract") || !prompt.includes("## Requests and updates")) {
    fail("Generated integration prompt is incomplete.");
  }
  const catalog = await readJson(join(bundleDirectory, "catalog.json"));
  const lock = await readJson(join(bundleDirectory, "handbook.lock.json"));
  if (catalog.project_id !== expectedProject || lock.project_id !== expectedProject) {
    fail("Generated bundle project identity does not match the manifest.");
  }
  if (lock.selection_digest !== digestValue(lock.selection)) {
    fail("Generated lock selection digest is invalid.");
  }
  return {
    project: expectedProject,
    release: lock.release,
    files: required.length,
    selectionDigest: lock.selection_digest,
  };
}

export async function generateIntegration(
  manifestPath,
  {
    format,
    output,
    now = new Date(),
    registries,
  } = {},
) {
  registries ??= await loadRegistries();
  const resolvedManifestPath = resolve(manifestPath);
  const manifest = await readJson(resolvedManifestPath);
  await validateManifest(manifest, resolvedManifestPath, registries);
  const selection = resolveSelection(manifest, registries);
  const prompt = renderIntegrationPrompt(manifest, selection);
  const selectedFormat = format ?? manifest.output.mode;

  if (selectedFormat === "prompt") {
    if (output) {
      const promptPath = resolve(output);
      await mkdir(dirname(promptPath), { recursive: true });
      await writeFile(promptPath, prompt, "utf8");
      return { format: "prompt", path: promptPath, prompt };
    }
    return { format: "prompt", prompt };
  }

  if (selectedFormat !== "bundle") fail("Generation format must be prompt or bundle.");
  const bundleDirectory = resolveBundleDirectory(manifest, resolvedManifestPath, output);
  const lock = await buildLock(
    manifest,
    resolvedManifestPath,
    registries,
    selection,
    now,
  );
  await mkdir(bundleDirectory, { recursive: true });
  await writeFile(join(bundleDirectory, "INTEGRATION.md"), prompt, "utf8");
  await writeFile(join(bundleDirectory, "README.md"), generatedReadme(manifest), "utf8");
  await writeJson(join(bundleDirectory, "catalog.json"), selectedCatalog(manifest, selection));
  await writeJson(join(bundleDirectory, "handbook.lock.json"), lock);
  const validation = await validateBundle(bundleDirectory, manifest.project.id);
  return { format: "bundle", path: bundleDirectory, manifest, lock, validation };
}

function compareSelections(source, target) {
  const changes = [];
  for (const collection of ["agents", "skills", "policies", "guides"]) {
    const sourceItems = new Map((source[collection] ?? []).map((item) => [item.id, item]));
    const targetItems = new Map((target[collection] ?? []).map((item) => [item.id, item]));
    const ids = [...new Set([...sourceItems.keys(), ...targetItems.keys()])].sort();
    for (const id of ids) {
      const from = sourceItems.get(id) ?? null;
      const to = targetItems.get(id) ?? null;
      if (from && to && digestValue(from) === digestValue(to)) continue;
      changes.push({
        kind: collection.slice(0, -1),
        id,
        action: !from ? "add" : !to ? "remove" : "update",
        from,
        to,
      });
    }
  }
  return changes;
}

function verifyPlanDigest(plan) {
  const { digest, ...unsigned } = plan;
  if (digest !== digestValue(unsigned)) fail("Update plan digest does not match its content.");
}

export async function checkDrift(
  manifestPath,
  {
    lockPath,
    planPath,
    now = new Date(),
    registries,
  } = {},
) {
  registries ??= await loadRegistries();
  const resolvedManifestPath = resolve(manifestPath);
  const manifest = await readJson(resolvedManifestPath);
  await validateManifest(manifest, resolvedManifestPath, registries);
  const bundleDirectory = resolveBundleDirectory(manifest, resolvedManifestPath);
  const resolvedLockPath = lockPath
    ? resolve(lockPath)
    : join(bundleDirectory, "handbook.lock.json");
  if (!(await pathExists(resolvedLockPath))) {
    fail("No generated lock exists. Generate the integration before checking drift.");
  }
  const sourceLock = await readJson(resolvedLockPath);
  if (sourceLock.project_id !== manifest.project.id) {
    fail("The generated lock belongs to a different project.");
  }

  const targetManifest = {
    ...manifest,
    release: registries.releases.current,
  };
  await validateManifest(targetManifest, resolvedManifestPath, registries);
  const targetSelection = resolveSelection(targetManifest, registries);
  const targetLock = await buildLock(
    targetManifest,
    resolvedManifestPath,
    registries,
    targetSelection,
    now,
  );
  const changes = compareSelections(sourceLock.selection, targetLock.selection);
  if (sourceLock.release !== targetLock.release) {
    changes.unshift({
      kind: "release",
      id: "hub",
      action: "update",
      from: sourceLock.release,
      to: targetLock.release,
    });
  }
  if (sourceLock.registry_digest !== targetLock.registry_digest) {
    changes.unshift({
      kind: "registry",
      id: "selected-control-records",
      action: "update",
      from: sourceLock.registry_digest,
      to: targetLock.registry_digest,
    });
  }
  const observedManifestDigest = digestValue(manifest);
  if (sourceLock.manifest_digest !== targetLock.manifest_digest) {
    changes.unshift({
      kind: "manifest",
      id: manifest.project.id,
      action: "update",
      from: sourceLock.manifest_digest,
      to: targetLock.manifest_digest,
    });
  }

  const planBase = {
    format: "open-agentic-handbook/update-plan@1",
    id: `update-${manifest.project.id}-${digestValue({
      created_at: now.toISOString(),
      target: targetLock.selection_digest,
    }).slice(0, 12)}`,
    project_id: manifest.project.id,
    status: changes.length === 0 ? "current" : "changes-required",
    created_at: now.toISOString(),
    source: {
      release: sourceLock.release,
      manifest_digest: observedManifestDigest,
      locked_manifest_digest: sourceLock.manifest_digest,
      selection_digest: sourceLock.selection_digest,
    },
    target: {
      release: targetLock.release,
      manifest_digest: targetLock.manifest_digest,
      selection_digest: targetLock.selection_digest,
    },
    changes,
    validation: [
      "Validate the project manifest and selected item paths.",
      "Regenerate the prompt, catalog snapshot, and content-digest lock.",
      "Confirm the generated bundle and update history are internally consistent."
    ],
    approval_required: changes.length > 0,
  };
  const plan = { ...planBase, digest: digestValue(planBase) };
  if (planPath) await writeJson(resolve(planPath), plan);
  return plan;
}

export function createApproval(
  plan,
  {
    reviewer,
    decision,
    conditions = [],
    now = new Date(),
  },
) {
  verifyPlanDigest(plan);
  requireString(reviewer, "reviewer");
  if (!["approved", "rejected"].includes(decision)) {
    fail("decision must be approved or rejected.");
  }
  if (plan.status !== "changes-required") {
    fail("A current plan does not require an approval record.");
  }
  requireStringArray(conditions, "conditions");
  return {
    format: "open-agentic-handbook/approval@1",
    approval: {
      id: `approval-${digestValue({
        plan: plan.digest,
        reviewer,
        decision,
        decided_at: now.toISOString(),
      }).slice(0, 16)}`,
      subject_type: "update-plan",
      subject_id: plan.id,
      subject_digest: plan.digest,
      decision,
      reviewer,
      decided_at: now.toISOString(),
      conditions,
    },
  };
}

export async function applyUpdate(
  manifestPath,
  planPath,
  approvalPath,
  {
    output,
    now = new Date(),
    registries,
  } = {},
) {
  registries ??= await loadRegistries();
  const resolvedManifestPath = resolve(manifestPath);
  const plan = await readJson(resolve(planPath));
  const approvalRecord = await readJson(resolve(approvalPath));
  verifyPlanDigest(plan);
  if (plan.status !== "changes-required") fail("The update plan has no changes to apply.");

  const approval = approvalRecord.approval;
  if (
    approvalRecord.format !== "open-agentic-handbook/approval@1" ||
    approval?.subject_type !== "update-plan" ||
    approval?.subject_id !== plan.id ||
    approval?.subject_digest !== plan.digest
  ) {
    fail("Approval does not match the exact update plan.");
  }
  if (approval.decision !== "approved") fail("The update plan was not approved.");

  const manifest = await readJson(resolvedManifestPath);
  if (digestValue(manifest) !== plan.source.manifest_digest) {
    fail("The project manifest changed after the update plan was created.");
  }
  if (plan.target.release !== registries.releases.current) {
    fail("The update plan target is no longer the current hub release.");
  }

  const targetManifest = { ...manifest, release: plan.target.release };
  await validateManifest(targetManifest, resolvedManifestPath, registries);
  const targetSelection = resolveSelection(targetManifest, registries);
  const targetLock = await buildLock(
    targetManifest,
    resolvedManifestPath,
    registries,
    targetSelection,
    now,
  );
  if (
    digestValue(targetManifest) !== plan.target.manifest_digest ||
    targetLock.selection_digest !== plan.target.selection_digest
  ) {
    fail("The hub or selected project skills changed after approval. Create a new plan.");
  }

  await writeJson(resolvedManifestPath, targetManifest);
  const generated = await generateIntegration(resolvedManifestPath, {
    format: "bundle",
    output,
    now,
    registries,
  });
  const historyDirectory = join(generated.path, "history");
  const historyPath = join(historyDirectory, `${plan.id}.json`);
  await writeJson(historyPath, {
    format: "open-agentic-handbook/update-record@1",
    project_id: plan.project_id,
    applied_at: now.toISOString(),
    plan: {
      id: plan.id,
      digest: plan.digest,
      changes: plan.changes,
    },
    approval: {
      id: approval.id,
      reviewer: approval.reviewer,
      decided_at: approval.decided_at,
      conditions: approval.conditions,
    },
    result: {
      release: generated.lock.release,
      selection_digest: generated.lock.selection_digest,
      validation: generated.validation,
    },
  });
  await validateBundle(generated.path, plan.project_id);
  return { ...generated, historyPath };
}

export function validateCapabilityRequest(record, expectedProject) {
  if (record.format !== "open-agentic-handbook/capability-request@1") {
    fail("Request format must be open-agentic-handbook/capability-request@1.");
  }
  requireObject(record.request, "request");
  const request = record.request;
  for (const key of ["id", "project_id", "kind", "title", "outcome", "data_boundary"]) {
    requireString(request[key], `request.${key}`);
  }
  if (
    !/^[a-z][a-z0-9-]+$/.test(request.id) ||
    !/^[a-z][a-z0-9-]+$/.test(request.project_id)
  ) {
    fail("Request id and project_id must use lower-case letters, numbers, and hyphens.");
  }
  if (request.project_id !== expectedProject) {
    fail("Capability request project_id does not match the manifest.");
  }
  if (!["agent", "skill", "guide", "feature", "integration", "policy"].includes(request.kind)) {
    fail(`Unsupported capability request kind "${request.kind}".`);
  }
  requireObject(request.scope, "request.scope");
  requireStringArray(request.scope.included, "request.scope.included", { nonEmpty: true });
  requireStringArray(request.scope.excluded, "request.scope.excluded");
  requireStringArray(request.maximum_authority, "request.maximum_authority", {
    nonEmpty: true,
  });
  requireStringArray(request.validation, "request.validation", { nonEmpty: true });
  requireObject(request.transport, "request.transport");
  requireString(request.transport.kind, "request.transport.kind");
  requireString(request.transport.destination, "request.transport.destination");
  if (request.status !== "proposed") fail("A new capability request must be proposed.");
  return request;
}

export async function exportCapabilityRequest(
  manifestPath,
  requestPath,
  {
    output,
    now = new Date(),
    registries,
  } = {},
) {
  registries ??= await loadRegistries();
  const resolvedManifestPath = resolve(manifestPath);
  const manifest = await readJson(resolvedManifestPath);
  await validateManifest(manifest, resolvedManifestPath, registries);
  const record = await readJson(resolve(requestPath));
  const request = validateCapabilityRequest(record, manifest.project.id);
  const base = {
    format: "open-agentic-handbook/request-export@1",
    hub_release: manifest.release,
    exported_at: now.toISOString(),
    source: {
      project_id: manifest.project.id,
      manifest_digest: digestValue(manifest),
    },
    routing: {
      contract_version: 1,
      transport: request.transport,
    },
    request,
  };
  const exported = { ...base, digest: digestValue(base) };
  const bundleDirectory = resolveBundleDirectory(manifest, resolvedManifestPath);
  const outputPath = output
    ? resolve(output)
    : join(bundleDirectory, "requests", `${request.id}.request.json`);
  await writeJson(outputPath, exported);
  return { path: outputPath, request: exported };
}

function parseArguments(argv) {
  const [command, ...tokens] = argv;
  const options = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token.startsWith("--")) fail(`Unexpected argument "${token}".`);
    const key = token.slice(2);
    const value = tokens[index + 1];
    if (!value || value.startsWith("--")) fail(`Option --${key} needs a value.`);
    options[key] = value;
    index += 1;
  }
  return { command, options };
}

function need(options, key) {
  if (!options[key]) fail(`Missing required option --${key}.`);
  return options[key];
}

function help() {
  return [
    "Open Agentic Handbook v1",
    "",
    "Commands:",
    "  generate --manifest PATH [--format prompt|bundle] [--output PATH]",
    "  request  --manifest PATH --request PATH [--output PATH]",
    "  check    --manifest PATH [--lock PATH] [--plan PATH]",
    "  approve  --plan PATH --reviewer NAME --decision approved|rejected [--output PATH]",
    "  apply    --manifest PATH --plan PATH --approval PATH [--output PATH]",
    "  validate --manifest PATH [--bundle PATH]",
    "",
  ].join("\n");
}

export async function runCli(argv = process.argv.slice(2)) {
  const { command, options } = parseArguments(argv);
  if (!command || command === "help") return help();

  if (command === "generate") {
    const result = await generateIntegration(need(options, "manifest"), {
      format: options.format,
      output: options.output,
    });
    return result.format === "prompt"
      ? result.prompt
      : `Generated and validated ${result.path}`;
  }

  if (command === "request") {
    const result = await exportCapabilityRequest(
      need(options, "manifest"),
      need(options, "request"),
      { output: options.output },
    );
    return `Exported request to ${result.path}`;
  }

  if (command === "check") {
    const plan = await checkDrift(need(options, "manifest"), {
      lockPath: options.lock,
      planPath: options.plan,
    });
    return options.plan
      ? `Drift status: ${plan.status}. Plan written to ${resolve(options.plan)}`
      : `${JSON.stringify(plan, null, 2)}\n`;
  }

  if (command === "approve") {
    const planPath = need(options, "plan");
    const plan = await readJson(resolve(planPath));
    const approval = createApproval(plan, {
      reviewer: need(options, "reviewer"),
      decision: need(options, "decision"),
    });
    const outputPath = resolve(
      options.output ?? join(dirname(resolve(planPath)), "update-approval.json"),
    );
    await writeJson(outputPath, approval);
    return `Recorded ${approval.approval.decision} decision at ${outputPath}`;
  }

  if (command === "apply") {
    const result = await applyUpdate(
      need(options, "manifest"),
      need(options, "plan"),
      need(options, "approval"),
      { output: options.output },
    );
    return `Applied, validated, and recorded update in ${result.path}`;
  }

  if (command === "validate") {
    const manifestPath = resolve(need(options, "manifest"));
    const manifest = await readJson(manifestPath);
    const registries = await loadRegistries();
    const summary = await validateManifest(manifest, manifestPath, registries);
    let bundle = null;
    let drift = null;
    if (options.bundle) {
      const bundlePath = resolve(options.bundle);
      bundle = await validateBundle(bundlePath, manifest.project.id);
      const plan = await checkDrift(manifestPath, {
        lockPath: join(bundlePath, "handbook.lock.json"),
        registries,
      });
      if (plan.status !== "current") {
        fail("Generated bundle is structurally valid but has unreviewed drift.");
      }
      drift = plan.status;
    }
    return `${JSON.stringify({ manifest: summary, bundle, drift }, null, 2)}\n`;
  }

  fail(`Unknown command "${command}".\n\n${help()}`);
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  runCli()
    .then((output) => process.stdout.write(output.endsWith("\n") ? output : `${output}\n`))
    .catch((error) => {
      process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
      process.exitCode = 1;
    });
}
