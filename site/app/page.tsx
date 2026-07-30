"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type Horizon = "Now" | "Next" | "Later";
type RequestKind = "Agent" | "Skill" | "Guide" | "Feature" | "Integration" | "Policy";

type CapabilityRequest = {
  id: string;
  kind: RequestKind;
  title: string;
  outcome: string;
  dataBoundary: string;
  authority: string;
};

const requestStorageKey = "open-agentic-handbook-capability-requests-v1";

const metrics = [
  { value: "15", label: "bounded skills" },
  { value: "8", label: "agent profiles" },
  { value: "7", label: "canonical registries" },
  { value: "14", label: "tested contracts" },
];

const repoLayers = [
  {
    index: "01",
    title: "Handbook",
    path: "docs/",
    body: "Durable principles, policies, architecture guidance, and the roadmap—written for people first.",
    tone: "navy",
  },
  {
    index: "02",
    title: "Catalog",
    path: "catalog/",
    body: "Canonical agent, skill, policy, guide, release, compatibility, and request registries.",
    tone: "green",
  },
  {
    index: "03",
    title: "Contracts",
    path: "schemas/ + templates/",
    body: "Machine-readable envelopes and neutral starting points for permissions, context, handoffs, evidence, and outcomes.",
    tone: "amber",
  },
  {
    index: "04",
    title: "Evidence",
    path: "examples/ + tests/",
    body: "Synthetic scenarios and automated checks that show how the contracts behave and catch structural drift.",
    tone: "blue",
  },
  {
    index: "05",
    title: "Distribution",
    path: "starter/ + tools/",
    body: "One small project manifest produces an integration prompt or portable, digest-pinned bundle.",
    tone: "red",
  },
];

const controlRoles = [
  {
    code: "ORC",
    name: "Orchestrator",
    purpose: "Routes bounded work and owns termination.",
    boundary: "Coordinates authority; it does not invent more of it.",
  },
  {
    code: "CTX",
    name: "Context steward",
    purpose: "Builds the smallest useful context for each step.",
    boundary: "Tracks provenance, freshness, retention, and compaction.",
  },
  {
    code: "SEC",
    name: "Security governor",
    purpose: "Evaluates requested actions against policy.",
    boundary: "Can deny or escalate; deterministic controls still enforce.",
  },
  {
    code: "WDG",
    name: "Watchdog",
    purpose: "Observes progress, loops, budgets, and anomalies.",
    boundary: "Reports and interrupts; it cannot silently rewrite the goal.",
  },
  {
    code: "VER",
    name: "Verifier",
    purpose: "Tests outcomes against explicit acceptance criteria.",
    boundary: "Produces evidence independently from the worker.",
  },
];

const companionPillars = [
  {
    number: "01",
    title: "Explain",
    body: "State the project or agent mission, owner, boundaries, inputs, outputs, and explicit non-goals.",
  },
  {
    number: "02",
    title: "Inspect",
    body: "Show installed skills, versions, permissions, dependencies, evaluations, and current operating status.",
  },
  {
    number: "03",
    title: "Request",
    body: "Let people propose a skill, feature, integration, or guide through one consistent capability contract.",
  },
  {
    number: "04",
    title: "Govern",
    body: "Make review state, public provenance, data boundaries, human approval, and release evidence visible.",
  },
];

const wants: Record<Horizon, Array<{ title: string; body: string; status: string }>> = {
  Now: [
    {
      title: "Manifest to bundle",
      body: "Select agents, optional skills, project-owned skills, and guides; generate a prompt, catalog snapshot, and exact lock.",
      status: "Operational",
    },
    {
      title: "Requests and approvals",
      body: "Export a local capability proposal and bind a reviewer decision to the exact artifact digest.",
      status: "Operational",
    },
    {
      title: "Drift and upgrades",
      body: "Check, plan, approve, apply, validate, and record updates without an always-on service.",
      status: "Operational",
    },
  ],
  Next: [
    {
      title: "Release package",
      body: "Make the zero-dependency generator easier to install without changing downstream contracts.",
      status: "Planned",
    },
    {
      title: "GitHub transport adapters",
      body: "Route the unchanged request and approval envelopes through issues or pull requests.",
      status: "Planned",
    },
    {
      title: "Generated companion view",
      body: "Render an agent or project surface directly from its manifest, lock, and evaluation evidence.",
      status: "Planned",
    },
  ],
  Later: [
    {
      title: "Runtime and provider adapters",
      body: "Thin mappings that preserve hub contracts without making the durable core provider-dependent.",
      status: "Exploration",
    },
    {
      title: "Operational evaluation",
      body: "Richer traces, scenario suites, release gates, and interoperability tests across agent runtimes.",
      status: "Exploration",
    },
    {
      title: "Reference enforcement gateway",
      body: "A deterministic example for permission, data-boundary, and external-action decisions.",
      status: "Exploration",
    },
  ],
};

export default function Home() {
  const [horizon, setHorizon] = useState<Horizon>("Now");
  const [requests, setRequests] = useState<CapabilityRequest[]>([]);
  const [requestsHydrated, setRequestsHydrated] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = window.localStorage.getItem(requestStorageKey);
        if (stored) {
          const parsed = JSON.parse(stored) as CapabilityRequest[];
          if (Array.isArray(parsed)) setRequests(parsed);
        }
      } catch {
        window.localStorage.removeItem(requestStorageKey);
      }
      setRequestsHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (requestsHydrated) {
      window.localStorage.setItem(requestStorageKey, JSON.stringify(requests));
    }
  }, [requests, requestsHydrated]);

  function addRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const title = String(fields.get("title") ?? "").trim();
    const outcome = String(fields.get("outcome") ?? "").trim();
    if (!title || !outcome) return;

    setRequests((current) => [
      ...current,
      {
        id: `request-${Date.now()}`,
        kind: String(fields.get("kind")) as RequestKind,
        title,
        outcome,
        dataBoundary: String(fields.get("dataBoundary")),
        authority: String(fields.get("authority")),
      },
    ]);
    form.reset();
  }

  async function copyRequest(request: CapabilityRequest) {
    await navigator.clipboard.writeText(
      JSON.stringify(
        {
          format: "open-agentic-handbook/capability-request@1",
          request: {
            id: request.id,
            project_id: "replace-with-project-id",
            kind: request.kind.toLowerCase(),
            title: request.title,
            outcome: request.outcome,
            scope: {
              included: ["Describe the smallest useful scope."],
              excluded: ["Automatic installation or permission expansion."],
            },
            data_boundary: request.dataBoundary,
            maximum_authority: [request.authority],
            validation: ["Define at least one checkable acceptance criterion."],
            transport: {
              kind: "local-file",
              destination: "hub-review-queue",
            },
            status: "proposed",
          },
        },
        null,
        2,
      ),
    );
    setCopiedId(request.id);
    window.setTimeout(() => setCopiedId(null), 1600);
  }

  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Open Agentic Handbook home">
          <span className="mark" aria-hidden="true">OA</span>
          <span>
            <strong>Open Agentic Handbook</strong>
            <small>Lightweight agent distribution</small>
          </span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#architecture">Architecture</a>
          <a href="#distribution">Add to a repo</a>
          <a href="#companion">Agents + skills</a>
          <a href="#wants">Upgrades</a>
          <a href="#requests">Requests</a>
        </nav>
        <a className="header-cta" href="#requests">Add an idea <span aria-hidden="true">↘</span></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> One canonical hub · tiny downstream footprint</p>
          <h1>A clear hub.<br /><em>Light downstream.</em></h1>
          <p className="hero-deck">
            A spec-driven handbook and distribution system for selecting only the agents, skills, and guides a project needs—then keeping them explainable, bounded, and up to date.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#distribution">Add it to a repo <span>↓</span></a>
            <a className="text-link" href="#architecture">See the control model <span>↗</span></a>
          </div>
          <div className="metric-row" aria-label="Repository inventory">
            {metrics.map((metric) => (
              <div key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="system-map" aria-label="Layered agentic system architecture">
          <div className="map-kicker"><span>Reference architecture</span><strong>v1.0</strong></div>
          <div className="authority-node">
            <span className="node-index">00</span>
            <div><small>Ultimate authority</small><strong>Human owner</strong></div>
            <b>APPROVE</b>
          </div>
          <div className="map-connector"><i /><span>scope · budget · escalation</span><i /></div>
          <div className="map-layer control-layer">
            <p>CONTROL PLANE</p>
            <div className="map-nodes three">
              <span><small>ORC</small>Orchestrate</span>
              <span><small>CTX</small>Steward context</span>
              <span><small>SEC</small>Govern actions</span>
            </div>
          </div>
          <div className="map-rail"><span>task envelope</span><b>↓</b><span>evidence</span></div>
          <div className="map-layer work-layer">
            <p>WORK PLANE</p>
            <div className="map-nodes two">
              <span><small>WRK</small>Bounded worker</span>
              <span><small>VER</small>Independent verifier</span>
            </div>
          </div>
          <div className="map-rail enforcement"><span>policy decision</span><b>↓</b><span>tool result</span></div>
          <div className="enforcement-node">
            <span>DETERMINISTIC ENFORCEMENT</span>
            <div><b>ALLOW</b><b>DENY</b><b>ESCALATE</b></div>
          </div>
          <p className="map-note">Agents propose. Controls enforce. People remain accountable.</p>
        </div>
      </section>

      <section className="section distribution" id="distribution">
        <div className="section-heading split">
          <div><p className="eyebrow"><span /> Minimal adoption path</p><h2>Add only what the repo needs.</h2></div>
          <p>The hub stays canonical. A downstream project keeps one small manifest and a generated prompt or portable bundle—no background service required.</p>
        </div>
        <div className="distribution-grid">
          <div className="manifest-card">
            <div><span>handbook.project.json</span><b>v1</b></div>
            <pre><code>{`{
  "project": { "id": "your-project" },
  "release": "1.0.0",
  "selection": {
    "agents": ["builder", "security-governor", "verifier"],
    "skills": {
      "core": "agent-required",
      "optional": [],
      "project": []
    },
    "guides": ["orchestration", "updates"]
  }
}`}</code></pre>
          </div>
          <div className="adoption-steps">
            <article><span>01</span><div><h3>Select</h3><p>Choose agents, optional hub skills, project skills, and concise guides.</p></div></article>
            <article><span>02</span><div><h3>Bound</h3><p>Declare data, permissions, context behavior, and external side effects.</p></div></article>
            <article><span>03</span><div><h3>Generate</h3><p>Produce <code>INTEGRATION.md</code>, a selected catalog, and a digest-pinned lock.</p></div></article>
            <article><span>04</span><div><h3>Use</h3><p>Commit the small bundle or print only the integration prompt.</p></div></article>
          </div>
        </div>
        <div className="command-card">
          <span>ONE LOCAL COMMAND</span>
          <code>npm run handbook -- generate --manifest /path/to/project/handbook.project.json --format bundle</code>
        </div>
        <div className="upgrade-track" aria-label="Approval-gated update workflow">
          {["Check", "Plan", "Approve", "Apply", "Validate", "Record"].map((step, index) => (
            <div key={step}><span>0{index + 1}</span><strong>{step}</strong>{index < 5 && <i aria-hidden="true">→</i>}</div>
          ))}
        </div>
        <p className="upgrade-note">A changed permission, data boundary, selected item, or content digest becomes a reviewable plan. Apply requires a human approval bound to that exact plan.</p>
      </section>

      <section className="section architecture" id="architecture">
        <div className="section-heading split">
          <div><p className="eyebrow"><span /> One system, separated concerns</p><h2>The orchestration model</h2></div>
          <p>Capability belongs in bounded workers. Oversight belongs in an independent control plane. Authority stays with deterministic enforcement and human owners.</p>
        </div>

        <div className="flow" aria-label="Orchestration sequence">
          <div className="flow-step emphasis"><small>01 · INTENT</small><strong>Task envelope</strong><span>goal · scope · permissions · stop conditions</span></div>
          <i aria-hidden="true">→</i>
          <div className="flow-step"><small>02 · CONTROL</small><strong>Route + guard</strong><span>orchestrator · context · security</span></div>
          <i aria-hidden="true">→</i>
          <div className="flow-step"><small>03 · WORK</small><strong>Act + observe</strong><span>worker · watchdog · evidence</span></div>
          <i aria-hidden="true">→</i>
          <div className="flow-step success"><small>04 · PROOF</small><strong>Verify + decide</strong><span>accept · retry · escalate · terminate</span></div>
        </div>

        <div className="role-grid">
          {controlRoles.map((role, index) => (
            <article className="role-card" key={role.code}>
              <div><span>{role.code}</span><small>0{index + 1}</small></div>
              <h3>{role.name}</h3>
              <p>{role.purpose}</p>
              <small>{role.boundary}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="section repository" id="repository">
        <div className="section-heading">
          <p className="eyebrow"><span /> From principle to proof</p>
          <h2>The hub owns the source of truth.</h2>
          <p>Each layer has one job. Together they prevent registry drift, keep the contracts inspectable, and make downstream output reproducible.</p>
        </div>
        <div className="repo-grid">
          {repoLayers.map((layer) => (
            <article className={`repo-card ${layer.tone}`} key={layer.title}>
              <div><span>{layer.index}</span><code>{layer.path}</code></div>
              <h3>{layer.title}</h3>
              <p>{layer.body}</p>
              <a href="#distribution" aria-label={`See distribution flow for ${layer.title}`}>See the flow <span>↗</span></a>
            </article>
          ))}
        </div>
      </section>

      <section className="section companion" id="companion">
        <div className="companion-heading">
          <div>
            <p className="eyebrow"><span /> A reusable front door</p>
            <h2>Every agent and project should explain itself.</h2>
          </div>
          <div>
            <p>Every surface follows the same contract: identity, responsibilities, skills, dependencies, permissions, context, security, additions, requests, and evidence.</p>
            <a className="text-link" href="#requests">Draft a capability request <span>↓</span></a>
          </div>
        </div>
        <div className="companion-grid">
          {companionPillars.map((pillar) => (
            <article key={pillar.title}>
              <span>{pillar.number}</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.body}</p>
            </article>
          ))}
        </div>
        <div className="companion-contract">
          <span>COMPANION SITE CONTRACT</span>
          <p>Identity + skills + boundaries + status + requests + evidence</p>
          <small>One recognizable pattern across every project and agent.</small>
        </div>
      </section>

      <section className="section wants" id="wants">
        <div className="wants-intro">
          <p className="eyebrow"><span /> Honest release boundary</p>
          <h2>Operational now.<br /><em>Adapters next.</em></h2>
          <p>V1 is local-first and on demand. Future transports, signed approvals, runtime gateways, and generated project sites extend the contracts; they are not required to use them today.</p>
          <div className="horizon-tabs" role="tablist" aria-label="Roadmap horizon">
            {(Object.keys(wants) as Horizon[]).map((item) => (
              <button
                className={horizon === item ? "active" : ""}
                key={item}
                onClick={() => setHorizon(item)}
                role="tab"
                aria-selected={horizon === item}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="want-list" role="tabpanel" aria-live="polite">
          <div className="want-list-head"><span>{horizon} horizon</span><small>0{wants[horizon].length} priorities</small></div>
          {wants[horizon].map((item, index) => (
            <article key={item.title}>
              <span className="want-number">0{index + 1}</span>
              <div><h3>{item.title}</h3><p>{item.body}</p></div>
              <b>{item.status}</b>
            </article>
          ))}
        </div>
      </section>

      <section className="section requests" id="requests">
        <div className="request-heading">
          <p className="eyebrow"><span /> Extend the system deliberately</p>
          <h2>Request a capability.</h2>
          <p>Describe the intended outcome and maximum authority. The composer creates the same portable v1 request shape used by the local command and keeps it in this browser.</p>
          <div className="request-safety">
            <strong>STRUCTURED REQUEST</strong>
            <span>Capture the capability, outcome, data boundary, maximum authority, and review criteria.</span>
          </div>
        </div>

        <div className="request-workspace">
          <form className="request-form" onSubmit={addRequest}>
            <div className="form-topline"><span>New proposal</span><small>All fields required</small></div>
            <label>
              What kind of addition is this?
              <select name="kind" defaultValue="Skill">
                <option>Agent</option>
                <option>Skill</option>
                <option>Guide</option>
                <option>Feature</option>
                <option>Integration</option>
                <option>Policy</option>
              </select>
            </label>
            <label>
              Capability name
              <input name="title" maxLength={80} required placeholder="Example: dependency review skill" />
            </label>
            <label>
              Desired outcome
              <textarea name="outcome" maxLength={420} required placeholder="Explain what someone should be able to accomplish and how success could be checked." />
            </label>
            <div className="form-pair">
              <label>
                Data boundary
                <select name="dataBoundary" defaultValue="No data required">
                  <option>No data required</option>
                  <option>Public information only</option>
                  <option>Synthetic data only</option>
                </select>
              </label>
              <label>
                Maximum authority
                <select name="authority" defaultValue="Advisory only">
                  <option>Advisory only</option>
                  <option>Read-only tools</option>
                  <option>May propose actions</option>
                </select>
              </label>
            </div>
            <button className="submit-request" type="submit">Add local draft <span>＋</span></button>
            <small className="local-note">This draft remains in your browser. Copy the JSON into the local request workflow; a future authenticated adapter can route the unchanged envelope.</small>
          </form>

          <div className="request-drafts">
            <div className="drafts-head"><span>Local drafts</span><small>{requests.length.toString().padStart(2, "0")}</small></div>
            {requests.length === 0 ? (
              <div className="empty-drafts">
                <span aria-hidden="true">＋</span>
                <h3>No requests drafted yet.</h3>
                <p>Add a bounded capability idea. It will appear here as a portable review contract.</p>
              </div>
            ) : (
              <div className="draft-list">
                {requests.map((request, index) => (
                  <article key={request.id}>
                    <div className="draft-title">
                      <span>{(index + 1).toString().padStart(2, "0")} · {request.kind}</span>
                      <button type="button" onClick={() => setRequests((current) => current.filter((item) => item.id !== request.id))}>Remove</button>
                    </div>
                    <h3>{request.title}</h3>
                    <p>{request.outcome}</p>
                    <div className="draft-meta"><span>{request.dataBoundary}</span><span>{request.authority}</span></div>
                    <button className="copy-request" type="button" onClick={() => copyRequest(request)}>
                      {copiedId === request.id ? "Copied" : "Copy proposal JSON"} <span>{copiedId === request.id ? "✓" : "↗"}</span>
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="contribute" id="contribute">
        <div>
          <p className="eyebrow">A clean contribution contract</p>
          <h2>Bring a bounded request, a public source, a synthetic example, or a failing test.</h2>
        </div>
        <div>
          <p>A useful contribution includes public provenance and explains its permissions, data boundaries, failure behavior, human escalation, and validation.</p>
          <a className="button light" href="#repository">Start with the repository map <span>↗</span></a>
        </div>
      </section>

      <footer>
        <a className="wordmark footer-mark" href="#top">
          <span className="mark">OA</span>
          <span><strong>Open Agentic Handbook</strong><small>Spec-driven · framework-neutral · Apache-2.0</small></span>
        </a>
        <p>Agents propose. Controls enforce. People remain accountable.</p>
        <a href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}
