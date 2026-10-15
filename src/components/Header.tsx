import React from 'react';
import { ShieldCheck, Terminal, Activity } from 'lucide-react';

interface HeaderProps {
  onOpenApiDocs: () => void;
  onOpenHealth: () => void;
  onScrollToSection: (sectionId: string) => void;
  serverHealth: 'checking' | 'healthy' | 'degraded';
}

export const Header: React.FC<HeaderProps> = ({
  onOpenApiDocs,
  onOpenHealth,
  onScrollToSection,
  serverHealth,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-slate-950/70 backdrop-blur-xl transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single element, clean display) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-lg"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-md shadow-rose-500/20 group-hover:scale-105 transition-all duration-200">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
              InstaLink
            </span>
          </a>
        </div>

        {/* Zone 2: Navigation links (clean single-line text with subtle hover) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
          <button
            onClick={() => onScrollToSection('resolver')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Resolver
          </button>
          <button
            onClick={() => onScrollToSection('how-it-works')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            How it Works
          </button>
          <button
            onClick={() => onScrollToSection('formats')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Supported Formats
          </button>
          <button
            onClick={() => onScrollToSection('safety')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Safety & Privacy
          </button>
        </nav>

        {/* Zone 3: Primary action & live probe */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenHealth}
            title="Inspect Live System Health & Telemetry"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-lg transition-colors whitespace-nowrap"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                serverHealth === 'healthy'
                  ? 'bg-emerald-400'
                  : serverHealth === 'checking'
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`}
            />
            <span className="font-mono text-[11px] tabular-nums">Status</span>
          </button>

          <button
            onClick={onOpenApiDocs}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-all whitespace-nowrap shadow-xs"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>API</span>
          </button>
        </div>
      </div>
    </header>
  );
};
