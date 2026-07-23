import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the public handbook explainer", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Open Agentic Handbook \| Systems that scale with boundaries<\/title>/i);
  assert.match(html, /Systems that scale/);
  assert.match(html, /The orchestration model/);
  assert.match(html, /spec-driven/i);
  assert.match(html, /Every agent and project should explain itself/);
  assert.match(html, /What we want/);
  assert.match(html, /Request a capability/);
  assert.match(html, /This draft remains in your browser/);
  assert.doesNotMatch(html, /Add candidate|Export manifest|Transfer Desk/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Starter Project/);
});
