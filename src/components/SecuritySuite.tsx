import React, { useState } from 'react';
import {
  MANDATORY_SECURITY_TEST_CASES,
  executeSecurityTest,
  TestExecutionResult,
  SecurityTestCase,
} from '../lib/securityTestCases';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Copy,
  Check,
  Filter,
  ExternalLink,
  Lock,
} from 'lucide-react';

interface SecuritySuiteProps {
  onLoadTestQuery: (query: string) => void;
}

export const SecuritySuite: React.FC<SecuritySuiteProps> = ({ onLoadTestQuery }) => {
  const [results, setResults] = useState<Record<string, TestExecutionResult>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [copiedReport, setCopiedReport] = useState(false);

  const categories = ['All', 'Injection & XSS', 'URL & Redirect Security', 'Grammar & Boundary', 'Reserved Paths', 'Input Bounds'];

  const filteredTests = MANDATORY_SECURITY_TEST_CASES.filter((test) => {
    if (activeCategory === 'All') return true;
    return test.category === activeCategory;
  });

  const handleRunAll = async () => {
    setIsRunning(true);
    const newResults: Record<string, TestExecutionResult> = {};

    for (const test of MANDATORY_SECURITY_TEST_CASES) {
      // Simulate small tick to demonstrate live runner
      await new Promise((resolve) => setTimeout(resolve, 30));
      const res = executeSecurityTest(test);
      newResults[test.id] = res;
      setResults({ ...newResults });
    }

    setIsRunning(false);
  };

  const handleRunSingle = (test: SecurityTestCase) => {
    const res = executeSecurityTest(test);
    setResults((prev) => ({
      ...prev,
      [test.id]: res,
    }));
  };

  const handleReset = () => {
    setResults({});
  };

  const totalRun = Object.keys(results).length;
  const passedCount = Object.values(results).filter((r) => r.status === 'PASSED').length;
  const failedCount = Object.values(results).filter((r) => r.status === 'FAILED').length;

  const handleCopyReport = async () => {
    const reportText = `## Security Verification Report (PRD Section 17)
Timestamp: ${new Date().toISOString()}
Tests Executed: ${totalRun}/${MANDATORY_SECURITY_TEST_CASES.length}
Passed: ${passedCount}
Failed: ${failedCount}

${Object.values(results)
  .map(
    (r) =>
      `- [${r.status}] ${r.testId} - ${r.name} (${r.durationMs}ms)\n  Input: \`${r.input}\`\n  Diagnostic: ${r.diagnostic}`
  )
  .join('\n\n')}
`;

    try {
      await navigator.clipboard.writeText(reportText);
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold uppercase tracking-wider mb-1">
            <Lock className="w-4 h-4" />
            <span>PRD Section 17 · Defense-in-Depth Verification</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Security & Attack Vector Test Harness
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Simulates real-world attack vectors including XSS, open redirects, SSRF host spoofing, credential embedding, and grammar violations against the resolver.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRunAll}
            disabled={isRunning}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isRunning ? 'Running Security Suite...' : 'Run All 15 Security Tests'}</span>
          </button>

          {totalRun > 0 && (
            <>
              <button
                onClick={handleReset}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
                title="Reset results"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                onClick={handleCopyReport}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
                title="Copy markdown report"
              >
                {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReport ? 'Copied' : 'Copy Report'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Telemetry Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-500 block">Total Attack Scenarios</span>
          <span className="text-xl font-bold text-white font-mono tabular-nums">
            {MANDATORY_SECURITY_TEST_CASES.length}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-500 block">Tests Executed</span>
          <span className="text-xl font-bold text-slate-200 font-mono tabular-nums">
            {totalRun} / {MANDATORY_SECURITY_TEST_CASES.length}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-500 block">Passed (Threat Blocked)</span>
          <span className="text-xl font-bold text-emerald-400 font-mono tabular-nums">
            {passedCount}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-500 block">Security Breaches</span>
          <span className={`text-xl font-bold font-mono tabular-nums ${failedCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            {failedCount}
          </span>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Test List Table / Cards */}
      <div className="space-y-3">
        {filteredTests.map((test) => {
          const runRes = results[test.id];

          return (
            <div
              key={test.id}
              className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">{test.id}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-xs font-semibold text-rose-300">{test.category}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-xs text-slate-400">Target: {test.expectedOutcome}</span>
                </div>

                <h4 className="text-sm font-bold text-white tracking-tight">{test.name}</h4>
                <p className="text-xs text-slate-400">{test.description}</p>

                <div className="bg-slate-950 px-3 py-2 rounded-lg font-mono text-xs text-slate-300 break-all select-all border border-slate-900 flex items-center justify-between gap-2">
                  <span>{test.input}</span>
                  <button
                    onClick={() => onLoadTestQuery(test.input)}
                    className="text-slate-400 hover:text-white shrink-0 flex items-center gap-1 text-[11px] underline"
                    title="Load into resolver"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {runRes && (
                  <div className="pt-1 flex items-center gap-2 text-xs">
                    {runRes.status === 'PASSED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <span
                      className={`font-mono ${
                        runRes.status === 'PASSED' ? 'text-emerald-300' : 'text-rose-400 font-bold'
                      }`}
                    >
                      {runRes.diagnostic}
                    </span>
                    <span className="text-slate-500 font-mono tabular-nums">({runRes.durationMs}ms)</span>
                  </div>
                )}
              </div>

              {/* Action Column */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => handleRunSingle(test)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3" />
                  <span>Run</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
