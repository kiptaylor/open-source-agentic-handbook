import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { access, readFile, readdir } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const toolDirectory = dirname(fileURLToPath(import.meta.url));
export const repositoryRoot = resolve(toolDirectory, "..");

const requiredPaths = [
  "catalog/registry.yaml",
  "catalog/skills/core",
  "catalog/profiles/control-plane",
  "catalog/orchestration-patterns",
  "docs/foundations/FOUNDATION.md",
  "docs/policies/PUBLIC_SOURCE_POLICY.md",
  "examples/validate-scenarios.mjs",
  "schemas/task-envelope.schema.json",
  "site/app/page.tsx",
  "templates/task-envelope.yaml",
  "tests/repository",
];

const requiredMetadataKeys = ["id", "version", "bucket", "status", "source"];
const requiredProfileSections = ["profile", "skills", "authority", "context", "budgets", "escalation"];
const requiredPatternSections = ["pattern", "purpose", "authority_flow", "shared_state", "termination", "validation"];
const rawOrArchiveExtensions = new Set([".mp3", ".wav", ".m4a", ".mp4", ".mov", ".zip", ".tar", ".gz"]);
const reviewedBinaryExtensions = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".pdf"]);
const textExtensions = new Set(["", ".css", ".gitignore", ".html", ".js", ".json", ".md", ".mjs", ".ts", ".tsx", ".txt", ".yaml", ".yml"]);
const prohibitedPathSegments = new Set(["private-notes", "raw-data", "recordings", "transcripts"]);

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function listRepositoryFiles() {
  return execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean)
    .filter((path) => existsSync(join(repositoryRoot, path)))
    .sort();
}

async function findFiles(directory, filename) {
  const results = [];
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) results.push(...(await findFiles(path, filename)));
    if (entry.isFile() && entry.name === filename) results.push(path);
  }
  return results;
}

export async function validateStructure() {
  const missing = [];
  for (const path of requiredPaths) {
    if (!(await exists(join(repositoryRoot, path)))) missing.push(path);
  }
  if (missing.length) throw new Error(`Missing required paths: ${missing.join(", ")}`);
  return requiredPaths.length;
}

export async function validateSchemas() {
  const schemaDirectory = join(repositoryRoot, "schemas");
  const names = (await readdir(schemaDirectory)).filter((name) => name.endsWith(".schema.json"));
  if (names.length < 7) throw new Error("Expected at least seven contract schemas.");

  for (const name of names) {
    const schema = JSON.parse(await readFile(join(schemaDirectory, name), "utf8"));
    for (const key of ["$schema", "$id", "title", "type", "properties"]) {
      if (!(key in schema)) throw new Error(`${name} is missing ${key}.`);
    }
    if (schema.type !== "object") throw new Error(`${name} must describe an object.`);
  }
  return names.length;
}

export async function validateCatalog() {
  const registry = await readFile(join(repositoryRoot, "catalog/registry.yaml"), "utf8");
  const skillFiles = await findFiles(join(repositoryRoot, "catalog/skills"), "SKILL.md");
  const profileDirectories = [
    join(repositoryRoot, "catalog/profiles/control-plane"),
    join(repositoryRoot, "catalog/profiles/workers"),
  ];
  let profileCount = 0;

  for (const skillFile of skillFiles) {
    const packageDirectory = dirname(skillFile);
    const metadataPath = join(packageDirectory, "metadata.yaml");
    if (!(await exists(metadataPath))) {
      throw new Error(`${relative(repositoryRoot, packageDirectory)} needs metadata.yaml.`);
    }
    const metadata = await readFile(metadataPath, "utf8");
    for (const key of requiredMetadataKeys) {
      if (!new RegExp(`^\\s*${key}:`, "m").test(metadata)) {
        throw new Error(`${relative(repositoryRoot, metadataPath)} is missing ${key}.`);
      }
    }
    const id = metadata.match(/^\s*id:\s*([^\s]+)\s*$/m)?.[1];
    if (!id || !registry.includes(`- ${id}`)) {
      throw new Error(`${relative(repositoryRoot, metadataPath)} is not indexed in registry.yaml.`);
    }
  }

  for (const directory of profileDirectories) {
    const names = (await readdir(directory)).filter((name) => name.endsWith(".yaml"));
    profileCount += names.length;
    for (const name of names) {
      const content = await readFile(join(directory, name), "utf8");
      for (const section of requiredProfileSections) {
        if (!new RegExp(`^${section}:`, "m").test(content)) {
          throw new Error(`${name} is missing ${section}.`);
        }
      }
      const id = content.match(/^\s*id:\s*([^\s]+)\s*$/m)?.[1];
      if (!id || !registry.includes(`- ${id}`)) throw new Error(`${name} is not indexed.`);
    }
  }

  const patternDirectory = join(repositoryRoot, "catalog/orchestration-patterns");
  const patternNames = (await readdir(patternDirectory)).filter((name) => name.endsWith(".yaml"));
  for (const name of patternNames) {
    const content = await readFile(join(patternDirectory, name), "utf8");
    for (const section of requiredPatternSections) {
      if (!new RegExp(`^\\s*${section}:`, "m").test(content)) {
        throw new Error(`${name} is missing ${section}.`);
      }
    }
  }

  return { skills: skillFiles.length, profiles: profileCount, patterns: patternNames.length };
}

export async function validateScenarios() {
  const examplesDirectory = join(repositoryRoot, "examples");
  const entries = await readdir(examplesDirectory, { withFileTypes: true });
  const directories = entries.filter((entry) => entry.isDirectory());
  for (const entry of directories) {
    const directory = join(examplesDirectory, entry.name);
    if (!(await exists(join(directory, "README.md")))) throw new Error(`${entry.name} needs README.md.`);
    const scenario = JSON.parse(await readFile(join(directory, "scenario.json"), "utf8"));
    if (scenario.publicSynthetic !== true) throw new Error(`${entry.name} is not marked synthetic.`);
  }
  return directories.length;
}

export async function validateMarkdownLinks() {
  const files = listRepositoryFiles().filter((file) => file.endsWith(".md"));
  const broken = [];
  let checked = 0;

  for (const file of files) {
    const content = await readFile(join(repositoryRoot, file), "utf8");
    for (const match of content.matchAll(/\]\(([^)]+)\)/g)) {
      const target = match[1].trim().replace(/^<|>$/g, "").split(/\s+\"/)[0];
      if (!target || target.startsWith("#") || /^(?:https?:|mailto:)/i.test(target)) continue;
      const localTarget = decodeURIComponent(target.split("#")[0]);
      checked += 1;
      if (!existsSync(resolve(repositoryRoot, dirname(file), localTarget))) {
        broken.push(`${file}: ${target}`);
      }
    }
  }

  if (broken.length) throw new Error(`Broken local links:\n${broken.join("\n")}`);
  return checked;
}

export function findDenylistMatches(text, entries) {
  const normalized = text.toLocaleLowerCase();
  return entries
    .map((entry, index) => ({ entry, index: index + 1 }))
    .filter(({ entry }) => normalized.includes(entry.toLocaleLowerCase()))
    .map(({ index }) => index);
}

export async function scanPublicSafety() {
  const files = listRepositoryFiles();
  const assetRegistry = JSON.parse(
    await readFile(join(repositoryRoot, "catalog/public-assets.json"), "utf8"),
  );
  const reviewedAssets = new Set(
    assetRegistry.assets.filter((asset) => asset.reviewed === true).map((asset) => asset.path),
  );
  const denylistPath = join(repositoryRoot, ".public-safety-denylist");
  const denylist = (await exists(denylistPath))
    ? (await readFile(denylistPath, "utf8"))
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
    : [];
  const findings = [];
  const secretPatterns = [
    ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
    ["cloud access key", /AKIA[0-9A-Z]{16}/],
    ["repository token", /gh[pousr]_[A-Za-z0-9]{30,}/],
    ["API token", /\bsk-[A-Za-z0-9_-]{20,}\b/],
    ["bearer token", /Bearer\s+[A-Za-z0-9._-]{20,}/i],
  ];

  for (const file of files) {
    const segments = file.toLocaleLowerCase().split("/");
    const extension = extname(file).toLocaleLowerCase();
    for (const segment of segments) {
      if (prohibitedPathSegments.has(segment)) findings.push(`${file}: prohibited path segment`);
    }
    if (rawOrArchiveExtensions.has(extension)) findings.push(`${file}: raw media or archive is not allowed`);
    if (reviewedBinaryExtensions.has(extension) && !reviewedAssets.has(file)) {
      findings.push(`${file}: binary asset lacks public review registration`);
    }
    if (!textExtensions.has(extension) || file.endsWith("package-lock.json")) continue;

    const text = await readFile(join(repositoryRoot, file), "utf8");
    for (const [label, pattern] of secretPatterns) {
      if (pattern.test(text)) findings.push(`${file}: possible ${label}`);
    }
    for (const index of findDenylistMatches(text, denylist)) {
      findings.push(`${file}: matched local denylist entry ${index}`);
    }
  }

  if (findings.length) throw new Error(`Public-safety validation failed:\n${findings.join("\n")}`);
  return { files: files.length, denylistEntries: denylist.length, reviewedAssets: reviewedAssets.size };
}

export async function validateRepository() {
  const structure = await validateStructure();
  const schemas = await validateSchemas();
  const catalog = await validateCatalog();
  const scenarios = await validateScenarios();
  const links = await validateMarkdownLinks();
  const safety = await scanPublicSafety();
  return { structure, schemas, catalog, scenarios, links, safety };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await validateRepository();
    console.log(
      `Validated ${result.safety.files} files, ${result.catalog.skills} skills, ` +
        `${result.catalog.profiles} profiles, ${result.catalog.patterns} patterns, ` +
        `${result.schemas} schemas, ${result.scenarios} scenarios, and ${result.links} links.`,
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
