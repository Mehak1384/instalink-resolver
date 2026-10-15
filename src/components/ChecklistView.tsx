import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Copy, Check, RotateCcw, ShieldCheck } from 'lucide-react';

interface ChecklistItem {
  id: string;
  category: 'Application' | 'Security' | 'Infrastructure' | 'Governance';
  title: string;
  detail: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Application (4)
  {
    id: 'APP-01',
    category: 'Application',
    title: 'Frontend and backend tests pass',
    detail: 'Unit tests covering username normalization, invalid characters, and URL generation execute with zero failures.',
  },
  {
    id: 'APP-02',
    category: 'Application',
    title: 'Input validation and fixed-origin redirect verified',
    detail: 'Destination URL is hardcoded to https://www.instagram.com/ with no arbitrary redirect injection.',
  },
  {
    id: 'APP-03',
    category: 'Application',
    title: 'Production error responses sanitized',
    detail: 'No stack traces, internal paths, secrets, or framework identifiers exposed in HTTP error payloads.',
  },
  {
    id: 'APP-04',
    category: 'Application',
    title: 'Accessibility and browser compatibility checked',
    detail: 'WCAG 2.2 AA keyboard navigation, contrast ratios >= 4.5:1, and screen reader labels verified.',
  },

  // Security (5)
  {
    id: 'SEC-01',
    category: 'Security',
    title: 'TLS, WAF and DDoS controls enabled',
    detail: 'Managed edge protection terminates TLS 1.3, filters malicious payloads, and rate limits high-volume sweeps.',
  },
  {
    id: 'SEC-02',
    category: 'Security',
    title: 'Distributed rate limiting verified',
    detail: 'Sliding-window rate limiter returns 429 Too Many Requests with Retry-After header on quota breach.',
  },
  {
    id: 'SEC-03',
    category: 'Security',
    title: 'Secrets stored outside source code',
    detail: 'No API keys, passwords, or deployment credentials present in Git repository or client bundles.',
  },
  {
    id: 'SEC-04',
    category: 'Security',
    title: 'Dependency, container and secret scans pass',
    detail: 'Automated CI vulnerability scanning reports zero unresolved critical or high-severity vulnerabilities.',
  },
  {
    id: 'SEC-05',
    category: 'Security',
    title: 'Security review and penetration testing completed as required',
    detail: 'Threat modeling conducted against OWASP Top 10, SSRF, XSS, and Open Redirect vectors.',
  },

  // Infrastructure (5)
  {
    id: 'INF-01',
    category: 'Infrastructure',
    title: 'Production network and database access restricted',
    detail: 'Stateless resolver instances isolated; internal ports and management consoles blocked from public internet.',
  },
  {
    id: 'INF-02',
    category: 'Infrastructure',
    title: 'Autoscaling and capacity limits configured',
    detail: 'Autoscaling triggers based on CPU utilization (>70%) and concurrent request volume with replica caps.',
  },
  {
    id: 'INF-03',
    category: 'Infrastructure',
    title: 'Metrics, dashboards and alerts operational',
    detail: 'P95 latency, 4xx/5xx error rates, and instance saturation piped to centralized telemetry.',
  },
  {
    id: 'INF-04',
    category: 'Infrastructure',
    title: 'Deployment rollback tested',
    detail: 'Canary rollout and atomic one-click rollback verified in staging environment.',
  },
  {
    id: 'INF-05',
    category: 'Infrastructure',
    title: 'Backups and restore drills completed where applicable',
    detail: 'Stateless core verified to require no database backup; recovery completed in < 60 seconds.',
  },

  // Governance (4)
  {
    id: 'GOV-01',
    category: 'Governance',
    title: 'Privacy notice and terms published',
    detail: 'Clear disclosures affirming zero search history retention and independent utility status.',
  },
  {
    id: 'GOV-02',
    category: 'Governance',
    title: 'Retention and deletion policies documented',
    detail: 'Operational metrics aggregated; transient request payloads immediately discarded in-memory.',
  },
  {
    id: 'GOV-03',
    category: 'Governance',
    title: 'Incident response contacts assigned',
    detail: 'Security escalation tree, on-call rotation, and contact@ email designated for abuse reporting.',
  },
  {
    id: 'GOV-04',
    category: 'Governance',
    title: 'Release owner signs off on remaining risks',
    detail: 'Formal authorization granted based on Definition of Done criteria (PRD Section 22).',
  },
];

const STORAGE_KEY = 'instalink_release_checklist_v1';

export const ChecklistView: React.FC = () => {
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedIds));
    } catch {
      // Ignore
    }
  }, [checkedIds]);

  const toggleItem = (id: string) => {
    setCheckedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleReset = () => {
    setCheckedIds({});
  };

  const total = CHECKLIST_ITEMS.length;
  const completed = Object.values(checkedIds).filter(Boolean).length;
  const progressPercent = Math.round((completed / total) * 100);

  const categories: ChecklistItem['category'][] = ['Application', 'Security', 'Infrastructure', 'Governance'];

  const handleCopy = async () => {
    const markdown = `## PRD Release Readiness Checklist (Section 21)
Status: ${completed}/${total} Completed (${progressPercent}%)

${CHECKLIST_ITEMS.map(
  (item) => `- [${checkedIds[item.id] ? 'x' : ' '}] **[${item.category}] ${item.title}**\n  ${item.detail}`
).join('\n')}
`;

    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>PRD Section 21 · Production Release Gate</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Release Readiness Checklist ({completed}/{total})
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Audit the 18 mandatory operational, security, infrastructure, and governance criteria required prior to public launch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            title="Copy checklist as markdown"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Checklist'}</span>
          </button>

          <button
            onClick={handleReset}
            className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
            title="Reset all checkboxes"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 font-medium">Production Audit Progress</span>
          <span className="font-mono text-white font-bold tabular-nums">
            {completed} of {total} completed ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-400 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist Sections */}
      <div className="space-y-6">
        {categories.map((category) => {
          const items = CHECKLIST_ITEMS.filter((i) => i.category === category);
          const categoryCompleted = items.filter((i) => checkedIds[i.id]).length;

          return (
            <div key={category} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>{category}</span>
                </h3>
                <span className="text-xs font-mono text-slate-400 tabular-nums">
                  {categoryCompleted}/{items.length} verified
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((item) => {
                  const isChecked = Boolean(checkedIds[item.id]);

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                        isChecked
                          ? 'bg-slate-950/80 border-emerald-500/40 text-slate-200'
                          : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 text-slate-400 hover:text-white shrink-0 focus:outline-none"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-500">{item.id}</span>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <h4
                            className={`text-xs font-semibold ${
                              isChecked ? 'text-white line-through decoration-slate-600' : 'text-slate-200'
                            }`}
                          >
                            {item.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{item.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
