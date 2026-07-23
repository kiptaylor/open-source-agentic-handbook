import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import {
  applyUpdate,
  checkDrift,
  createApproval,
  digestValue,
  exportCapabilityRequest,
  generateIntegration,
  validateBundle,
} from "../../tools/handbook.mjs";

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

test("downstream generation, request export, and approval-gated update work end to end", async () => {
  const directory = await mkdtemp(join(tmpdir(), "agentic-handbook-v1-"));
  try {
    const starter = JSON.parse(
      await readFile(
        new URL("../../starter/handbook.project.json", import.meta.url),
        "utf8",
      ),
    );
    starter.project.id = "synthetic-lifecycle";
    starter.project.description = "A synthetic project exercising the local v1 lifecycle.";
    const manifestPath = join(directory, "handbook.project.json");
    await writeJson(manifestPath, starter);

    const generated = await generateIntegration(manifestPath, {
      now: new Date("2030-01-01T00:00:00.000Z"),
    });
    assert.equal(generated.format, "bundle");
    assert.equal(generated.lock.release, "1.0.0");
    assert.match(
      await readFile(join(generated.path, "INTEGRATION.md"), "utf8"),
      /context-steward 0\.1\.0/,
    );
    assert.equal((await validateBundle(generated.path, starter.project.id)).files, 4);

    const current = await checkDrift(manifestPath, {
      now: new Date("2030-01-01T00:01:00.000Z"),
    });
    assert.equal(current.status, "current");
    assert.equal(current.approval_required, false);

    starter.selection.skills.optional.push("maintainer");
    await writeJson(manifestPath, starter);
    const planPath = join(directory, "update-plan.json");
    const plan = await checkDrift(manifestPath, {
      planPath,
      now: new Date("2030-01-01T00:02:00.000Z"),
    });
    assert.equal(plan.status, "changes-required");
    assert.equal(plan.approval_required, true);
    assert.ok(plan.changes.some((change) => change.id === "maintainer"));

    const approval = createApproval(plan, {
      reviewer: "designated-maintainer",
      decision: "approved",
      conditions: ["Run the generated validation steps."],
      now: new Date("2030-01-01T00:03:00.000Z"),
    });
    const approvalPath = join(directory, "update-approval.json");
    await writeJson(approvalPath, approval);
    const applied = await applyUpdate(manifestPath, planPath, approvalPath, {
      now: new Date("2030-01-01T00:04:00.000Z"),
    });
    assert.equal(applied.lock.selection_digest, plan.target.selection_digest);
    assert.match(await readFile(applied.historyPath, "utf8"), /designated-maintainer/);

    const afterApply = await checkDrift(manifestPath, {
      now: new Date("2030-01-01T00:05:00.000Z"),
    });
    assert.equal(afterApply.status, "current");

    const requestPath = join(directory, "capability-request.json");
    await writeJson(requestPath, {
      format: "open-agentic-handbook/capability-request@1",
      request: {
        id: "synthetic-review-guide",
        project_id: "synthetic-lifecycle",
        kind: "guide",
        title: "Synthetic review guide",
        outcome: "Explain how to review a neutral generated artifact.",
        scope: {
          included: ["generated artifacts"],
          excluded: ["automatic publication"],
        },
        data_boundary: "Synthetic artifacts only.",
        maximum_authority: ["read generated artifacts", "write a local review"],
        validation: ["A synthetic invalid artifact is rejected."],
        transport: {
          kind: "local-file",
          destination: "hub-review-queue",
        },
        status: "proposed",
      },
    });
    const exported = await exportCapabilityRequest(manifestPath, requestPath, {
      now: new Date("2030-01-01T00:06:00.000Z"),
    });
    const requestExport = JSON.parse(await readFile(exported.path, "utf8"));
    const { digest, ...unsigned } = requestExport;
    assert.equal(digest, digestValue(unsigned));
    assert.equal(requestExport.routing.transport.kind, "local-file");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
