import React, { useState, useEffect } from 'react';
import { Activity, Terminal, CheckCircle2, AlertCircle, Copy, Check, Play, RefreshCw, X } from 'lucide-react';

interface HealthMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'api' | 'health';
}

export const HealthMetricsModal: React.FC<HealthMetricsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'api',
}) => {
  const [tab, setTab] = useState<'api' | 'health'>(initialTab);
  const [copiedSample, setCopiedSample] = useState<string | null>(null);

  // Health data state
  const [liveData, setLiveData] = useState<any>(null);
  const [readyData, setReadyData] = useState<any>(null);
  const [metricsData, setMetricsData] = useState<any>(null);
  const [probing, setProbing] = useState(false);

  // Interactive API tester state
  const [testQuery, setTestQuery] = useState('@example_user');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiStatus, setApiStatus] = useState<number | null>(null);
  const [apiLatency, setApiLatency] = useState<number | null>(null);
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (isOpen) {
      probeHealth();
    }
  }, [isOpen]);

  const probeHealth = async () => {
    setProbing(true);
    try {
      const [liveRes, readyRes, metricsRes] = await Promise.allSettled([
        fetch('/health/live').then((r) => r.json()),
        fetch('/health/ready').then((r) => r.json()),
        fetch('/api/v1/metrics').then((r) => r.json()),
      ]);

      if (liveRes.status === 'fulfilled') setLiveData(liveRes.value);
      if (readyRes.status === 'fulfilled') setReadyData(readyRes.value);
      if (metricsRes.status === 'fulfilled') setMetricsData(metricsRes.value);
    } catch (err) {
      console.error('Failed to probe health', err);
    } finally {
      setProbing(false);
    }
  };

  const handleExecuteApiTest = async () => {
    setApiLoading(true);
    setApiResponse(null);
    setApiStatus(null);
    const start = performance.now();

    try {
      const res = await fetch('/api/v1/resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: testQuery }),
      });

      const elapsed = Number((performance.now() - start).toFixed(1));
      setApiLatency(elapsed);
      setApiStatus(res.status);
      const json = await res.json();
      setApiResponse(json);
    } catch (err: any) {
      setApiStatus(500);
      setApiResponse({ error: err.message || 'Network request failed' });
    } finally {
      setApiLoading(false);
    }
  };

  const handleCopyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSample(id);
      setTimeout(() => setCopiedSample(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  if (!isOpen) return null;

  const curlExample = `curl -X POST https://your-domain.com/api/v1/resolve \\
  -H "Content-Type: application/json" \\
  -d '{"query": "@natgeo"}'`;

  const fetchExample = `const response = await fetch('/api/v1/resolve', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: '@natgeo' })
});
const data = await response.json();
console.log(data.profile_url);`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('api')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                tab === 'api' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>API Reference</span>
            </button>
            <button
              onClick={() => setTab('health')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                tab === 'health' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Health & Live Telemetry</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {tab === 'api' ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Endpoint: POST /api/v1/resolve</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Validates an input username or Instagram URL and produces a canonical HTTPS profile link.
                </p>
              </div>

              {/* Interactive Endpoint Explorer */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-rose-400">TRY IT LIVE</span>
                  <button
                    onClick={handleExecuteApiTest}
                    disabled={apiLoading}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>{apiLoading ? 'Executing...' : 'Send Request'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">query:</span>
                  <input
                    type="text"
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>

                {apiStatus !== null && (
                  <div className="pt-2 border-t border-slate-900 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">
                        Status: <strong className={apiStatus === 200 ? 'text-emerald-400' : 'text-rose-400'}>{apiStatus}</strong>
                      </span>
                      {apiLatency !== null && <span className="text-slate-500">{apiLatency} ms</span>}
                    </div>

                    <pre className="bg-slate-900/90 p-3 rounded-lg text-xs font-mono text-slate-200 overflow-x-auto border border-slate-800">
                      {JSON.stringify(apiResponse, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Code Snippets */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-semibold text-slate-300">cURL Example</span>
                    <button
                      onClick={() => handleCopyText(curlExample, 'curl')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedSample === 'curl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSample === 'curl' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 overflow-x-auto">
                    {curlExample}
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-semibold text-slate-300">JavaScript / TypeScript Fetch</span>
                    <button
                      onClick={() => handleCopyText(fetchExample, 'fetch')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedSample === 'fetch' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSample === 'fetch' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 overflow-x-auto">
                    {fetchExample}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">System Health & Live Metrics</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Real-time diagnostics from <code className="text-slate-300">/health/live</code>,{' '}
                    <code className="text-slate-300">/health/ready</code>, and <code className="text-slate-300">/api/v1/metrics</code>.
                  </p>
                </div>

                <button
                  onClick={probeHealth}
                  disabled={probing}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${probing ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-500 block">Liveness Status</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-bold text-white">{liveData?.status || 'Active'}</span>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-500 block">Readiness Check</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-bold text-white">{readyData?.status || 'Ready'}</span>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-500 block">Process Uptime</span>
                  <span className="text-sm font-bold text-slate-200 block mt-1">
                    {readyData?.uptime_seconds ? `${readyData.uptime_seconds}s` : 'Continuous'}
                  </span>
                </div>
              </div>

              {/* Operational Counters */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Aggregated Operational Counters (Zero User PII)
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block">Total Resolutions</span>
                    <span className="text-base font-bold text-white tabular-nums">
                      {metricsData?.totalResolutions ?? 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Successful Lookups</span>
                    <span className="text-base font-bold text-emerald-400 tabular-nums">
                      {metricsData?.successfulLookups ?? 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Validation Failures</span>
                    <span className="text-base font-bold text-amber-400 tabular-nums">
                      {metricsData?.validationErrors ?? 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Rate Limit Blocks</span>
                    <span className="text-base font-bold text-rose-400 tabular-nums">
                      {metricsData?.rateLimitHits ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
