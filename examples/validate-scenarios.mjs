import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const entries = await readdir(root, { withFileTypes: true });
const scenarioDirectories = entries
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

if (scenarioDirectories.length === 0) {
  throw new Error("No synthetic scenarios were found.");
}

for (const directory of scenarioDirectories) {
  const scenarioPath = join(root, directory, "scenario.json");
  const scenario = JSON.parse(await readFile(scenarioPath, "utf8"));
  const required = [
    "id",
    "pattern",
    "objective",
    "expectedControls",
    "expectedOutcome",
    "publicSynthetic",
  ];

  for (const key of required) {
    if (!(key in scenario)) {
      throw new Error(`${directory} is missing ${key}.`);
    }
  }

  if (scenario.publicSynthetic !== true) {
    throw new Error(`${directory} must declare publicSynthetic: true.`);
  }

  if (!Array.isArray(scenario.expectedControls) || scenario.expectedControls.length === 0) {
    throw new Error(`${directory} needs at least one expected control.`);
  }
}

console.log(`Validated ${scenarioDirectories.length} synthetic scenarios.`);
