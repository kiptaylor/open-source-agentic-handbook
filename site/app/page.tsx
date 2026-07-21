"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";

type Decision = "Candidate" | "Rewrite" | "Ready" | "Hold" | "Exclude";

type GateKey =
  | "firstPrinciples"
  | "publicSources"
  | "syntheticExamples"
  | "permissionReview"
  | "validationPlan";

type Candidate = {
  id: string;
  title: string;
  description: string;
  phase: string;
  priority: "Core" | "Next" | "Later";
  risk: "Low" | "Medium" | "High";
  decision: Decision;
  publicEvidence: string;
  publicSourceCount: number;
  notes: string;
  deliverables: string[];
  tags: string[];
  checks: Record<GateKey, boolean>;
};

const emptyChecks: Record<GateKey, boolean> = {
  firstPrinciples: false,
  publicSources: false,
  syntheticExamples: false,
  permissionReview: false,
  validationPlan: false,
};

const seedCandidates: Candidate[] = [
  {
    id: "foundations",
    title: "Foundations & terminology",
    description:
      "Define agents, workflows, autonomy, and the observe–decide–act–evaluate loop in provider-neutral language.",
    phase: "Phase 1",
    priority: "Core",
    risk: "Low",
    decision: "Rewrite",
    publicEvidence: "",
    publicSourceCount: 0,
    notes: "Start with a shared vocabulary and explicit scope boundaries.",
    deliverables: ["Concept chapter", "Glossary", "Loop illustration brief"],
    tags: ["Durable principle", "Provider-neutral"],
    checks: { ...emptyChecks, firstPrinciples: true },
  },
  {
    id: "instructions-context",
    title: "Instructions & context",
    description:
      "Explain instruction hierarchy, context selection, provenance, and what should never enter a model context.",
    phase: "Phase 1",
    priority: "Core",
    risk: "Medium",
    decision: "Candidate",
    publicEvidence: "",
    publicSourceCount: 0,
    notes: "",
    deliverables: ["Pattern chapter", "Context checklist"],
    tags: ["Data boundary", "Design pattern"],
    checks: { ...emptyChecks },
  },
  {
    id: "tools-permissions",
    title: "Tools & permissions",
    description:
      "Describe least privilege, scoped authorization, reversible actions, failure behavior, and escalation paths.",
    phase: "Phase 1",
    priority: "Core",
    risk: "High",
    decision: "Rewrite",
    publicEvidence: "",
    publicSourceCount: 0,
    notes: "Separate durable permission principles from provider-specific notes.",
    deliverables: ["Core chapter", "Permission matrix template"],
    tags: ["Safety", "Human oversight"],
    checks: { ...emptyChecks, firstPrinciples: true },
  },
  {
    id: "state-memory",
    title: "State, memory & knowledge",
    description:
      "Clarify temporary state, durable memory, retrieval, retention, and knowledge-source boundaries.",
    phase: "Phase 2",
    priority: "Next",
    risk: "High",
    decision: "Hold",
    publicEvidence: "",
    publicSourceCount: 0,
    notes: "Hold until retention and deletion guidance has a complete validation plan.",
    deliverables: ["Boundary model", "Retention checklist"],
    tags: ["Privacy", "Architecture"],
    checks: { ...emptyChecks },
  },
  {
    id: "planning-orchestration",
    title: "Planning & orchestration",
    description:
      "Compare single-agent loops, delegated work, checkpoints, bounded retries, and termination conditions.",
    phase: "Phase 2",
    priority: "Next",
    risk: "Medium",
    decision: "Candidate",
    publicEvidence: "",
    publicSourceCount: 0,
    notes: "",
    deliverables: ["Pattern catalog", "Decision guide"],
    tags: ["Architecture", "Failure handling"],
    checks: { ...emptyChecks },
  },
  {
    id: "human-review",
    title: "Human review & escalation",
    description:
      "Show where people approve, interrupt, recover, and accept responsibility for consequential actions.",
    phase: "Phase 1",
    priority: "Core",
    risk: "Medium",
    decision: "Rewrite",
    publicEvidence: "",
    publicSourceCount: 0,
    notes: "Use new, neutral scenarios written specifically for the handbook.",
    deliverables: ["Oversight chapter", "Escalation template"],
    tags: ["Human oversight", "Operations"],
    checks: {
      ...emptyChecks,
      firstPrinciples: true,
      syntheticExamples: true,
    },
  },
  {
    id: "evaluation",
    title: "Evaluation & testing",
    description:
      "Cover task suites, risk-based tests, regression fixtures, graders, and release criteria.",
    phase: "Phase 2",
    priority: "Next",
    risk: "Low",
    decision: "Candidate",
    publicEvidence: "",
    publicSourceCount: 0,
    notes: "",
    deliverables: ["Evaluation chapter", "Synthetic test fixture"],
    tags: ["Validation", "Quality"],
    checks: { ...emptyChecks },
  },
  {
    id: "observability",
    title: "Observability & operations",
    description:
      "Define useful events, traces, audit records, recovery signals, and operational ownership.",
    phase: "Phase 2",
    priority: "Next",
    risk: "Medium",
    decision: "Candidate",
    publicEvidence: "",
    publicSourceCount: 0,
    notes: "",
    deliverables: ["Operations chapter", "Event taxonomy"],
    tags: ["Operations", "Reliability"],
    checks: { ...emptyChecks },
  },
  {
    id: "security",
    title: "Security & data boundaries",
    description:
      "Explain threat modeling, untrusted inputs, secret handling, isolation, and safe tool execution.",
    phase: "Phase 2",
    priority: "Core",
    risk: "High",
    decision: "Hold",
    publicEvidence: "",
    publicSourceCount: 0,
    notes: "Requires public primary sources and independent security review.",
    deliverables: ["Security chapter", "Threat-model worksheet"],
    tags: ["Security", "Data boundary"],
    checks: { ...emptyChecks },
  },
  {
    id: "examples-templates",
    title: "Examples & templates",
    description:
      "Create small framework-neutral examples and reusable templates using only synthetic placeholder data.",
    phase: "Phase 3",
    priority: "Later",
    risk: "Medium",
    decision: "Candidate",
    publicEvidence: "",
    publicSourceCount: 0,
    notes: "",
    deliverables: ["Runnable example", "Review checklist", "Template pack"],
    tags: ["Synthetic data", "Reusable asset"],
    checks: { ...emptyChecks, syntheticExamples: true },
  },
];

const gateLabels: Array<{
  key: GateKey;
  title: string;
  detail: string;
}> = [
  {
    key: "firstPrinciples",
    title: "First-principles rewrite",
    detail: "The public draft is newly written, not copied or lightly paraphrased.",
  },
  {
    key: "publicSources",
    title: "Public provenance",
    detail: "External claims use public, preferably primary, sources with compatible licenses.",
  },
  {
    key: "syntheticExamples",
    title: "Synthetic examples",
    detail: "Names, data, workflows, URLs, and identifiers are newly invented for teaching.",
  },
  {
    key: "permissionReview",
    title: "Action boundaries",
    detail: "Permissions, failure behavior, and human escalation are explicit.",
  },
  {
    key: "validationPlan",
    title: "Validation included",
    detail: "The implementation guidance includes a way to test or review it.",
  },
];

const decisions: Decision[] = [
  "Candidate",
  "Rewrite",
  "Ready",
  "Hold",
  "Exclude",
];

const decisionHelp: Record<Decision, string> = {
  Candidate: "Not reviewed yet",
  Rewrite: "Recreate from public sources",
  Ready: "Passed every public gate",
  Hold: "Needs more evidence or review",
  Exclude: "Does not belong in public scope",
};

function decisionClass(value: Decision) {
  return `decision-${value.toLowerCase()}`;
}

export default function Home() {
  const [candidates, setCandidates] = useState(seedCandidates);
  const [selectedId, setSelectedId] = useState(seedCandidates[0].id);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Decision | "All">("All");
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("handbook-transfer-candidates-v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Candidate[];
        if (Array.isArray(parsed) && parsed.length > 0) setCandidates(parsed);
      } catch {
        window.localStorage.removeItem("handbook-transfer-candidates-v1");
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      "handbook-transfer-candidates-v1",
      JSON.stringify(candidates),
    );
  }, [candidates, hydrated]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const selected =
    candidates.find((candidate) => candidate.id === selectedId) ?? candidates[0];

  const counts = useMemo(
    () =>
      decisions.reduce(
        (result, decision) => ({
          ...result,
          [decision]: candidates.filter((item) => item.decision === decision)
            .length,
        }),
        {} as Record<Decision, number>,
      ),
    [candidates],
  );

  const filteredCandidates = useMemo(() => {
    const search = query.trim().toLowerCase();
    return candidates.filter((candidate) => {
      const matchesFilter = filter === "All" || candidate.decision === filter;
      const matchesSearch =
        !search ||
        [
          candidate.title,
          candidate.description,
          candidate.phase,
          candidate.tags.join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(search);
      return matchesFilter && matchesSearch;
    });
  }, [candidates, filter, query]);

  const reviewedCount = candidates.filter(
    (candidate) => candidate.decision !== "Candidate",
  ).length;
  const includedCount = counts.Rewrite + counts.Ready;
  const progress = Math.round((reviewedCount / candidates.length) * 100);
  const passedGates = Object.values(selected.checks).filter(Boolean).length;
  const allGatesPassed = passedGates === gateLabels.length;

  function updateSelected(patch: Partial<Candidate>) {
    setCandidates((items) =>
      items.map((item) =>
        item.id === selected.id ? { ...item, ...patch } : item,
      ),
    );
  }

  function chooseDecision(decision: Decision) {
    if (decision === "Ready" && !allGatesPassed) {
      setToast("Complete all five gates before marking this ready.");
      return;
    }
    updateSelected({ decision });
    setToast(`Decision saved: ${decision}.`);
  }

  function toggleGate(key: GateKey) {
    updateSelected({
      checks: { ...selected.checks, [key]: !selected.checks[key] },
    });
  }

  function buildManifest() {
    return {
      generatedAt: new Date().toISOString(),
      policy:
        "Concept-level inventory only. Public drafts must be written from first principles and public sources.",
      summary: {
        total: candidates.length,
        included: includedCount,
        hold: counts.Hold,
        excluded: counts.Exclude,
      },
      chapters: candidates.map((candidate) => ({
        title: candidate.title,
        phase: candidate.phase,
        priority: candidate.priority,
        risk: candidate.risk,
        decision: candidate.decision,
        outcome: candidate.description,
        plannedDeliverables: candidate.deliverables,
        publicEvidence: candidate.publicEvidence || "Not recorded",
        publicSourceCount: candidate.publicSourceCount,
        gatesPassed: gateLabels
          .filter(({ key }) => candidate.checks[key])
          .map(({ title }) => title),
      })),
    };
  }

  function downloadManifest() {
    const blob = new Blob([JSON.stringify(buildManifest(), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "public-handbook-transfer-manifest.json";
    link.click();
    URL.revokeObjectURL(url);
    setToast("Manifest downloaded.");
  }

  async function copySummary() {
    const manifest = buildManifest();
    const lines = [
      "# Public handbook transfer manifest",
      "",
      `- ${manifest.summary.included} sections selected for public rewrite or publication`,
      `- ${manifest.summary.hold} sections on hold`,
      `- ${manifest.summary.excluded} sections excluded`,
      "",
      ...manifest.chapters.map(
        (chapter) => `- **${chapter.title}** — ${chapter.decision}`,
      ),
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    setToast("Markdown summary copied.");
  }

  function addCandidate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const phase = String(form.get("phase") ?? "Phase 1");
    if (!title || !description) return;

    const id = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    const candidate: Candidate = {
      id,
      title,
      description,
      phase,
      priority: "Next",
      risk: "Medium",
      decision: "Candidate",
      publicEvidence: "",
      publicSourceCount: 0,
      notes: "",
      deliverables: ["Public chapter"],
      tags: ["New candidate"],
      checks: { ...emptyChecks },
    };
    setCandidates((items) => [...items, candidate]);
    setSelectedId(id);
    setShowAdd(false);
    setFilter("All");
    setToast("Candidate added to the local review queue.");
  }

  function resetWorkspace() {
    if (!window.confirm("Reset every local review decision to the starter map?")) {
      return;
    }
    setCandidates(seedCandidates);
    setSelectedId(seedCandidates[0].id);
    setFilter("All");
    setToast("Local workspace reset.");
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Workspace navigation">
        <a className="brand" href="#overview" aria-label="Transfer Desk home">
          <span className="brand-mark" aria-hidden="true">
            TD
          </span>
          <span>
            <strong>Transfer Desk</strong>
            <small>Agentic Handbook</small>
          </span>
        </a>

        <nav className="side-nav">
          <a className="active" href="#overview">
            <span aria-hidden="true">01</span> Portfolio
          </a>
          <a href="#review-queue">
            <span aria-hidden="true">02</span> Review queue
          </a>
          <a href="#review-desk">
            <span aria-hidden="true">03</span> Public gates
          </a>
          <a href="#manifest">
            <span aria-hidden="true">04</span> Manifest
          </a>
        </nav>

        <section className="policy-card">
          <span className="policy-icon" aria-hidden="true">
            ✓
          </span>
          <p className="eyebrow">Public-source rule</p>
          <h2>Transfer the idea, never the private artifact.</h2>
          <p>
            Capture only a concept and intended public outcome here. Draft from
            first principles with public evidence.
          </p>
          <a href="#review-desk">See the five public gates</a>
        </section>

        <div className="local-note">
          <span className="status-dot" aria-hidden="true" />
          <span>
            <strong>Local workspace</strong>
            <small>Decisions stay in this browser</small>
          </span>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="search-wrap">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Search handbook candidates"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search topics, risks, or phases"
              type="search"
              value={query}
            />
            <kbd>⌘ K</kbd>
          </div>
          <div className="top-actions">
            <span className="saved-state">
              <span className="status-dot" aria-hidden="true" /> Auto-saved locally
            </span>
            <button className="secondary-button" onClick={() => setShowAdd(true)}>
              <span aria-hidden="true">＋</span> Add candidate
            </button>
            <button className="primary-button" onClick={downloadManifest}>
              Export manifest
            </button>
          </div>
        </header>

        <div className="content">
          <section className="hero" id="overview">
            <div>
              <p className="eyebrow">Public knowledge transfer · Review workspace</p>
              <h1>Decide what earns a place in the public handbook.</h1>
              <p className="hero-copy">
                Turn concept-level candidates into clean, attributable guidance.
                Every selected section must cross the same public-safety gates.
              </p>
            </div>
            <div className="progress-card" aria-label={`${progress}% reviewed`}>
              <div className="progress-ring" style={{ "--progress": progress } as CSSProperties}>
                <strong>{progress}%</strong>
                <span>reviewed</span>
              </div>
              <div>
                <strong>{reviewedCount} of {candidates.length}</strong>
                <span>sections have a decision</span>
              </div>
            </div>
          </section>

          <section className="metrics" aria-label="Review summary">
            <article>
              <span className="metric-icon navy" aria-hidden="true">▦</span>
              <div><strong>{candidates.length}</strong><span>Total candidates</span></div>
              <small>Across {new Set(candidates.map((item) => item.phase)).size} roadmap phases</small>
            </article>
            <article>
              <span className="metric-icon blue" aria-hidden="true">↻</span>
              <div><strong>{counts.Rewrite}</strong><span>Rewrite cleanly</span></div>
              <small>Selected for first-principles drafting</small>
            </article>
            <article>
              <span className="metric-icon green" aria-hidden="true">✓</span>
              <div><strong>{counts.Ready}</strong><span>Public-ready</span></div>
              <small>All five gates must be complete</small>
            </article>
            <article>
              <span className="metric-icon amber" aria-hidden="true">!</span>
              <div><strong>{counts.Hold + counts.Exclude}</strong><span>Held or excluded</span></div>
              <small>Kept out of public drafting</small>
            </article>
          </section>

          <section className="desk-grid">
            <div className="queue-panel" id="review-queue">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Portfolio</p>
                  <h2>Handbook review queue</h2>
                </div>
                <span>{filteredCandidates.length} shown</span>
              </div>

              <div className="filter-row" aria-label="Filter candidates">
                {(["All", ...decisions] as const).map((item) => (
                  <button
                    className={filter === item ? "active" : ""}
                    key={item}
                    onClick={() => setFilter(item)}
                  >
                    {item}
                    {item !== "All" && <span>{counts[item]}</span>}
                  </button>
                ))}
              </div>

              <div className="candidate-list">
                {filteredCandidates.map((candidate) => {
                  const gateCount = Object.values(candidate.checks).filter(Boolean).length;
                  return (
                    <button
                      className={`candidate-card ${selected.id === candidate.id ? "selected" : ""}`}
                      key={candidate.id}
                      onClick={() => setSelectedId(candidate.id)}
                    >
                      <span className={`risk-bar risk-${candidate.risk.toLowerCase()}`} aria-hidden="true" />
                      <span className="candidate-main">
                        <span className="candidate-meta">
                          <span>{candidate.phase}</span>
                          <span>{candidate.priority} priority</span>
                          <span>{candidate.risk} risk</span>
                        </span>
                        <strong>{candidate.title}</strong>
                        <small>{candidate.description}</small>
                        <span className="tag-row">
                          {candidate.tags.map((tag) => <span key={tag}>{tag}</span>)}
                        </span>
                      </span>
                      <span className="candidate-status">
                        <span className={`decision-pill ${decisionClass(candidate.decision)}`}>
                          {candidate.decision}
                        </span>
                        <span className="gate-count">{gateCount}/5 gates</span>
                        <span className="arrow" aria-hidden="true">›</span>
                      </span>
                    </button>
                  );
                })}
                {filteredCandidates.length === 0 && (
                  <div className="empty-state">
                    <strong>No candidates match this view.</strong>
                    <span>Try another status or search phrase.</span>
                  </div>
                )}
              </div>
            </div>

            <aside className="review-panel" id="review-desk">
              <div className="review-header">
                <div>
                  <p className="eyebrow">Active review</p>
                  <h2>{selected.title}</h2>
                </div>
                <span className={`decision-pill ${decisionClass(selected.decision)}`}>
                  {selected.decision}
                </span>
              </div>

              <p className="review-description">{selected.description}</p>

              <div className="decision-grid" aria-label="Choose a transfer decision">
                {decisions.map((decision) => (
                  <button
                    className={selected.decision === decision ? "active" : ""}
                    key={decision}
                    onClick={() => chooseDecision(decision)}
                    title={decisionHelp[decision]}
                  >
                    <span className={`decision-dot ${decisionClass(decision)}`} aria-hidden="true" />
                    <strong>{decision}</strong>
                    <small>{decisionHelp[decision]}</small>
                  </button>
                ))}
              </div>

              <div className="review-block">
                <div className="block-heading">
                  <div>
                    <p className="eyebrow">Release gate</p>
                    <h3>Public-readiness checks</h3>
                  </div>
                  <strong>{passedGates}/5</strong>
                </div>
                <div className="gate-progress"><span style={{ width: `${passedGates * 20}%` }} /></div>
                <div className="gate-list">
                  {gateLabels.map((gate) => (
                    <label key={gate.key}>
                      <input
                        checked={selected.checks[gate.key]}
                        onChange={() => toggleGate(gate.key)}
                        type="checkbox"
                      />
                      <span className="custom-check" aria-hidden="true">✓</span>
                      <span>
                        <strong>{gate.title}</strong>
                        <small>{gate.detail}</small>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="review-block compact">
                <div className="block-heading">
                  <div>
                    <p className="eyebrow">Evidence</p>
                    <h3>Public source plan</h3>
                  </div>
                </div>
                <label className="field-label" htmlFor="source-plan">
                  Public URL, standard, or paper
                </label>
                <input
                  className="text-input"
                  id="source-plan"
                  onChange={(event) => updateSelected({ publicEvidence: event.target.value })}
                  placeholder="Record a public citation — never a private link"
                  type="text"
                  value={selected.publicEvidence}
                />
                <div className="two-fields">
                  <label>
                    <span>Public sources</span>
                    <input
                      min="0"
                      onChange={(event) => updateSelected({ publicSourceCount: Number(event.target.value) })}
                      type="number"
                      value={selected.publicSourceCount}
                    />
                  </label>
                  <label>
                    <span>Risk level</span>
                    <select
                      onChange={(event) => updateSelected({ risk: event.target.value as Candidate["risk"] })}
                      value={selected.risk}
                    >
                      <option>Low</option><option>Medium</option><option>High</option>
                    </select>
                  </label>
                </div>
                <label className="field-label" htmlFor="review-notes">
                  Public drafting note
                </label>
                <textarea
                  id="review-notes"
                  onChange={(event) => updateSelected({ notes: event.target.value })}
                  placeholder="Describe the public outcome. Do not paste source material."
                  rows={3}
                  value={selected.notes}
                />
                <div className="warning-note">
                  <span aria-hidden="true">!</span>
                  <p><strong>No private content.</strong> This desk stores decisions and concept-level notes only.</p>
                </div>
              </div>

              <div className="review-footer">
                <span>{allGatesPassed ? "Ready can now be selected" : `${5 - passedGates} gates remain`}</span>
                <button onClick={() => setToast("Review saved in this browser.")}>Save review</button>
              </div>
            </aside>
          </section>

          <section className="manifest-panel" id="manifest">
            <div>
              <p className="eyebrow">Handoff</p>
              <h2>Turn decisions into a clean drafting plan.</h2>
              <p>
                The manifest exports titles, outcomes, decisions, risks, public
                evidence, and completed gates. It never exports private source text.
              </p>
            </div>
            <div className="manifest-stats">
              <span><strong>{includedCount}</strong> include</span>
              <span><strong>{counts.Hold}</strong> hold</span>
              <span><strong>{counts.Exclude}</strong> exclude</span>
            </div>
            <div className="manifest-actions">
              <button className="secondary-button" onClick={copySummary}>Copy Markdown</button>
              <button className="primary-button" onClick={downloadManifest}>Download JSON</button>
            </div>
          </section>

          <footer>
            <span>Open Source Agentic Handbook · Public-safe review workspace</span>
            <button onClick={resetWorkspace}>Reset local workspace</button>
          </footer>
        </div>
      </section>

      {showAdd && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowAdd(false)}>
          <section
            aria-labelledby="add-title"
            aria-modal="true"
            className="modal"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button className="modal-close" onClick={() => setShowAdd(false)} aria-label="Close">×</button>
            <p className="eyebrow">Concept-level intake</p>
            <h2 id="add-title">Add a public handbook candidate</h2>
            <p>Describe the reusable idea and intended public outcome. Do not paste private text, filenames, links, or examples.</p>
            <form onSubmit={addCandidate}>
              <label>
                <span>Public-safe title</span>
                <input name="title" placeholder="e.g. Bounded retry patterns" required />
              </label>
              <label>
                <span>Intended public outcome</span>
                <textarea name="description" placeholder="What should a public reader learn or be able to do?" required rows={4} />
              </label>
              <label>
                <span>Roadmap phase</span>
                <select defaultValue="Phase 2" name="phase">
                  <option>Phase 1</option><option>Phase 2</option><option>Phase 3</option><option>Phase 4</option>
                </select>
              </label>
              <div className="modal-warning"><span aria-hidden="true">!</span> Private source content belongs outside this public repository.</div>
              <div className="modal-actions">
                <button className="secondary-button" onClick={() => setShowAdd(false)} type="button">Cancel</button>
                <button className="primary-button" type="submit">Add to queue</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
