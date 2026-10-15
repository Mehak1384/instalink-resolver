import React, { useState } from 'react';
import {
  Shield,
  Layers,
  Server,
  Cpu,
  Lock,
  ArrowRight,
  Database,
  Network,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import heroAsset from '../assets/images/security_grid_hero_1792051279711.jpg';

export const ArchitectureView: React.FC = () => {
  // Capacity Simulator (PRD Section 14)
  const [dailyUsers, setDailyUsers] = useState<number>(1000000); // 1M DAU
  const [lookupsPerUser, setLookupsPerUser] = useState<number>(10);
  const [peakMultiplier, setPeakMultiplier] = useState<number>(10);

  const totalDailyRequests = dailyUsers * lookupsPerUser;
  const avgRequestsPerSec = Math.round(totalDailyRequests / 86400);
  const peakRequestsPerSec = Math.round(avgRequestsPerSec * peakMultiplier);
  const estimatedReplicas = Math.max(2, Math.ceil(peakRequestsPerSec / 500)); // Assuming 500 req/s per single container core
  const estimatedBandwidthMbps = Number(((peakRequestsPerSec * 1.5 * 8) / 1024).toFixed(1)); // ~1.5KB per transaction

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10">
      {/* Hero Visual & Executive Summary */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          <img
            src={heroAsset}
            alt="Security Grid Infrastructure Visualization"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center brightness-75 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400">
              <Shield className="w-4 h-4" />
              <span>PRD Section 8 & 10 · System Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Stateless Defense-in-Depth Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Designed for high availability, abuse resistance, zero user tracking, and horizontal auto-scaling without database bottlenecks on the critical resolution path.
            </p>
          </div>
        </div>
      </div>

      {/* 6 Core Architectural Principles (PRD Section 8.2) */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-rose-400" />
          <span>Architectural Invariants & Safeguards</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <div className="text-xs font-mono font-bold text-amber-400">INVARIANT 01</div>
            <h4 className="text-sm font-bold text-white">Stateless Resolution</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              The resolver performs algorithmic syntax normalization and canonical URL construction in-memory. No database calls occur on the critical lookup path.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <div className="text-xs font-mono font-bold text-emerald-400">INVARIANT 02</div>
            <h4 className="text-sm font-bold text-white">Strict Origin Lock</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Arbitrary redirect parameters are eliminated. The destination origin is hard-coded to <code className="text-slate-200">https://www.instagram.com/</code>, preventing phishing and SSRF.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <div className="text-xs font-mono font-bold text-rose-400">INVARIANT 03</div>
            <h4 className="text-sm font-bold text-white">Privacy by Default</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Zero search history is recorded. Lookups are processed transiently and discarded immediately after response transmission.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <div className="text-xs font-mono font-bold text-purple-400">INVARIANT 04</div>
            <h4 className="text-sm font-bold text-white">Explicit User Navigation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              No automated or automatic redirects. Users review the constructed canonical URL and explicitly trigger navigation with <code className="text-slate-200">rel="noopener noreferrer"</code>.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <div className="text-xs font-mono font-bold text-sky-400">INVARIANT 05</div>
            <h4 className="text-sm font-bold text-white">Sliding-Window Rate Limiting</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Layered abuse controls enforce token quotas per client IP, mitigating bot crawling and automated brute-force scraping attempts.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <div className="text-xs font-mono font-bold text-teal-400">INVARIANT 06</div>
            <h4 className="text-sm font-bold text-white">Truthful Verification</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Constructed links are explicitly labeled as unverified. The platform never hallucinates profile existence or pretends to bypass private account barriers.
            </p>
          </div>
        </div>
      </div>

      {/* End-to-End Request Sequence Pipeline (PRD Section 8.3) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Network className="w-5 h-5 text-rose-400" />
            <span>Request Sequence & Defense Pipeline (PRD Section 8.3)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            How incoming input is processed through each isolated security layer:
          </p>
        </div>

        <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6 text-xs">
          <div className="relative">
            <div className="absolute -left-[31px] top-0 w-3 h-3 rounded-full bg-rose-500 ring-4 ring-slate-950" />
            <h4 className="font-bold text-slate-200 text-sm">Step 1: Edge Ingress & WAF Filtering</h4>
            <p className="text-slate-400 mt-1">
              Managed CDN / WAF terminates TLS, enforces strict 64KB request body limit, and validates HTTP POST with Content-Type application/json.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -left-[31px] top-0 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-slate-950" />
            <h4 className="font-bold text-slate-200 text-sm">Step 2: Distributed Rate Quota Inspection</h4>
            <p className="text-slate-400 mt-1">
              Checks client quota in sliding-window bucket (60 req/min). If limit exceeded, returns HTTP 429 with Retry-After header.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -left-[31px] top-0 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-slate-950" />
            <h4 className="font-bold text-slate-200 text-sm">Step 3: Syntax Normalization & Anti-Injection</h4>
            <p className="text-slate-400 mt-1">
              Validates username syntax (1-30 chars, alphanumeric + dots/underscores, no consecutive dots, no boundary dots). Strips query params and verifies hostname against Instagram whitelist.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -left-[31px] top-0 w-3 h-3 rounded-full bg-sky-500 ring-4 ring-slate-950" />
            <h4 className="font-bold text-slate-200 text-sm">Step 4: Canonical Link Construction</h4>
            <p className="text-slate-400 mt-1">
              Generates deterministic URL <code className="text-slate-200">https://www.instagram.com/[username]/</code> with status <code className="text-slate-200">link_constructed</code> and <code className="text-slate-200">verified: false</code>.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -left-[31px] top-0 w-3 h-3 rounded-full bg-purple-500 ring-4 ring-slate-950" />
            <h4 className="font-bold text-slate-200 text-sm">Step 5: Client Presentation & User-Initiated Redirect</h4>
            <p className="text-slate-400 mt-1">
              Client displays canonical URL, copy action, and QR code. Redirection occurs ONLY when user explicitly clicks "Open Profile on Instagram".
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Capacity & Traffic Planning Calculator (PRD Section 14) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Sliders className="w-5 h-5 text-rose-400" />
              <span>Traffic & Capacity Simulator (PRD Section 14)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Based on the PRD baseline illustrative workload: 1,000,000 DAU × 10 lookups/day.
            </p>
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Daily Active Users (DAU)</span>
              <span className="font-mono text-white font-bold tabular-nums">
                {dailyUsers.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="100000"
              max="5000000"
              step="100000"
              value={dailyUsers}
              onChange={(e) => setDailyUsers(parseInt(e.target.value, 10))}
              className="w-full accent-rose-500 bg-slate-950 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Lookups Per User / Day</span>
              <span className="font-mono text-white font-bold tabular-nums">{lookupsPerUser}</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={lookupsPerUser}
              onChange={(e) => setLookupsPerUser(parseInt(e.target.value, 10))}
              className="w-full accent-rose-500 bg-slate-950 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Peak Hour Multiplier</span>
              <span className="font-mono text-white font-bold tabular-nums">{peakMultiplier}×</span>
            </div>
            <input
              type="range"
              min="2"
              max="20"
              step="1"
              value={peakMultiplier}
              onChange={(e) => setPeakMultiplier(parseInt(e.target.value, 10))}
              className="w-full accent-rose-500 bg-slate-950 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Dynamic Capacity Outputs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-4">
            <span className="text-[11px] text-slate-500 block">Daily Transactions</span>
            <span className="text-lg font-bold text-white font-mono tabular-nums">
              {(totalDailyRequests / 1000000).toFixed(1)}M reqs
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-850 rounded-xl p-4">
            <span className="text-[11px] text-slate-500 block">Average Throughput</span>
            <span className="text-lg font-bold text-slate-200 font-mono tabular-nums">
              {avgRequestsPerSec.toLocaleString()} req/s
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-850 rounded-xl p-4">
            <span className="text-[11px] text-slate-500 block">Peak Demand (Est.)</span>
            <span className="text-lg font-bold text-rose-400 font-mono tabular-nums">
              {peakRequestsPerSec.toLocaleString()} req/s
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-850 rounded-xl p-4">
            <span className="text-[11px] text-slate-500 block">Autoscaled Replicas</span>
            <span className="text-lg font-bold text-emerald-400 font-mono tabular-nums">
              {estimatedReplicas} nodes ({estimatedBandwidthMbps} Mbps)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
