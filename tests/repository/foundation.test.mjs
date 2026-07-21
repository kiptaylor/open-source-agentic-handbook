import assert from "node:assert/strict";
import test from "node:test";
import {
  findDenylistMatches,
  scanPublicSafety,
  validateCatalog,
  validateMarkdownLinks,
  validateScenarios,
  validateSchemas,
  validateStructure,
} from "../../tools/validate-repository.mjs";

test("required project structure exists", async () => {
  assert.ok((await validateStructure()) >= 10);
});

test("contract schemas are structurally valid", async () => {
  assert.ok((await validateSchemas()) >= 7);
});

test("catalog packages and profiles are indexed", async () => {
  const result = await validateCatalog();
  assert.ok(result.skills >= 10);
  assert.equal(result.profiles, 8);
  assert.equal(result.patterns, 4);
});

test("examples are public and synthetic", async () => {
  assert.equal(await validateScenarios(), 7);
});

test("local documentation links resolve", async () => {
  assert.ok((await validateMarkdownLinks()) > 20);
});

test("local denylist matching is case-insensitive without exposing terms", () => {
  assert.deepEqual(findDenylistMatches("A Sensitive Placeholder", ["sensitive placeholder"]), [1]);
});

test("repository passes public-safety scanning", async () => {
  const result = await scanPublicSafety();
  assert.ok(result.files > 0);
  assert.equal(result.reviewedAssets, 1);
});
