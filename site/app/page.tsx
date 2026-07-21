"use client";

import { useState } from "react";

type Horizon = "Now" | "Next" | "Later";

const metrics = [
  { value: "15", label: "bounded skills" },
  { value: "8", label: "agent profiles" },
  { value: "4", label: "orchestration patterns" },
  { value: "7", label: "tested contracts" },
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
    body: "Versioned skills, agent profiles, and orchestration patterns that turn guidance into composable building blocks.",
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
    title: "Explorer",
    path: "site/",
    body: "This public-facing map: a concise explanation of the project, its boundaries, and where it is going.",
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

const wants: Record<Horizon, Array<{ title: string; body: string; status: string }>> = {
  Now: [
    {
      title: "Foundation contracts",
      body: "Keep skills, profiles, task envelopes, evidence records, and orchestration patterns coherent and versioned.",
      status: "Foundation shipped",
    },
    {
      title: "Repository validation",
      body: "Expand structural checks, link validation, public-safety scanning, and synthetic scenario coverage.",
      status: "Active",
    },
    {
      title: "Core handbook chapters",
      body: "Turn the architecture into concise guidance on context, permissions, evaluation, security, and escalation.",
      status: "Writing next",
    },
  ],
  Next: [
    {
      title: "Reference orchestrator",
      body: "A small framework-neutral runner that demonstrates task envelopes, handoffs, bounded retries, and termination.",
      status: "Planned",
    },
    {
      title: "Policy gateway demo",
      body: "A deterministic enforcement example with allow, deny, and human-escalation paths around agent actions.",
      status: "Planned",
    },
    {
      title: "Context stress fixtures",
      body: "Synthetic tests for compaction, provenance loss, conflicting instructions, stale knowledge, and recovery.",
      status: "Planned",
    },
  ],
  Later: [
    {
      title: "Runtime adapters",
      body: "Thin provider-specific mappings that preserve the handbook contracts without making the core provider-dependent.",
      status: "Exploration",
    },
    {
      title: "Operational evaluation",
      body: "Richer traces, scenario suites, release gates, and interoperability tests across agent runtimes.",
      status: "Exploration",
    },
    {
      title: "Optional media intake",
      body: "A separate, gated system for consent, isolation, redaction, provenance, human approval, and deletion—never raw media in this public repository.",
      status: "Separate system",
    },
  ],
};

export default function Home() {
  const [horizon, setHorizon] = useState<Horizon>("Now");

  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Open Agentic Handbook home">
          <span className="mark" aria-hidden="true">OA</span>
          <span>
            <strong>Open Agentic Handbook</strong>
            <small>Architecture atlas</small>
          </span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#foundation">Foundation</a>
          <a href="#architecture">Architecture</a>
          <a href="#repository">Repository</a>
          <a href="#wants">Wants</a>
        </nav>
        <a className="header-cta" href="#contribute">Contribute <span aria-hidden="true">↗</span></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Open-source · framework-neutral · public-safe</p>
          <h1>Systems that scale<br />with <em>boundaries.</em></h1>
          <p className="hero-deck">
            A ground-up field guide for designing, coordinating, and evaluating agentic systems—paired with versioned building blocks that make the guidance testable.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#architecture">Explore the architecture <span>↓</span></a>
            <a className="text-link" href="#wants">See what we want next <span>↗</span></a>
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
          <div className="map-kicker"><span>Reference architecture</span><strong>v0.1</strong></div>
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

      <section className="boundary-band" id="foundation">
        <div className="boundary-lead">
          <span className="seal" aria-hidden="true">✓</span>
          <div><p className="eyebrow">The public boundary</p><h2>Built in public,<br /><em>from first principles.</em></h2></div>
        </div>
        <div className="boundary-copy">
          <p>This repository is a new public work—not a mirror, exporter, or cleaned copy of another knowledge base.</p>
          <div className="not-list">
            <span>NO PRIVATE NOTES</span>
            <span>NO RAW RECORDINGS</span>
            <span>NO REAL IDENTITIES</span>
            <span>NO PROPRIETARY EXAMPLES</span>
          </div>
          <small>External technical claims use public, preferably primary, sources. Examples are synthetic and created for this project.</small>
        </div>
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
          <h2>A repository with five connected layers.</h2>
          <p>Each layer has one job. Together they make the project readable by people, composable by agents, and testable in automation.</p>
        </div>
        <div className="repo-grid">
          {repoLayers.map((layer) => (
            <article className={`repo-card ${layer.tone}`} key={layer.title}>
              <div><span>{layer.index}</span><code>{layer.path}</code></div>
              <h3>{layer.title}</h3>
              <p>{layer.body}</p>
              <a href="#wants" aria-label={`See roadmap for ${layer.title}`}>See roadmap <span>↗</span></a>
            </article>
          ))}
        </div>
      </section>

      <section className="section wants" id="wants">
        <div className="wants-intro">
          <p className="eyebrow"><span /> Direction, not a backlog dump</p>
          <h2>What we want<br /><em>to become.</em></h2>
          <p>The first pass establishes the language, contracts, and safety rails. Expansion earns its way in through public provenance, synthetic evidence, and bounded authority.</p>
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

      <section className="contribute" id="contribute">
        <div>
          <p className="eyebrow">A clean contribution contract</p>
          <h2>Bring a concept, a public source, a synthetic example, or a failing test.</h2>
        </div>
        <div>
          <p>Do not bring private material. A useful contribution explains its permissions, data boundaries, failure behavior, human escalation, and how to validate it.</p>
          <a className="button light" href="#repository">Start with the repository map <span>↗</span></a>
        </div>
      </section>

      <footer>
        <a className="wordmark footer-mark" href="#top">
          <span className="mark">OA</span>
          <span><strong>Open Agentic Handbook</strong><small>Ground-up · public-safe · Apache-2.0</small></span>
        </a>
        <p>Agents propose. Controls enforce. People remain accountable.</p>
        <a href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}
