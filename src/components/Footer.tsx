import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { LegalModalType } from './LegalModals';

interface FooterProps {
  onOpenLegal: (type: LegalModalType) => void;
  onOpenApiDocs: () => void;
  onOpenHealth: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal, onOpenApiDocs, onOpenHealth }) => {
  return (
    <footer className="mt-20 border-t border-white/[0.06] bg-slate-950 text-slate-400 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white text-sm">InstaLink</span>
            </div>
            <p className="text-slate-400 max-w-md text-xs leading-relaxed">
              Instagram profile link canonicalizer and safe redirect utility. Strict origin locking and zero persistent tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-slate-400">
            <button
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onOpenLegal('terms')}
              className="hover:text-white transition-colors"
            >
              Terms of Use
            </button>
            <button
              onClick={() => onOpenLegal('abuse')}
              className="hover:text-white transition-colors"
            >
              Report Abuse
            </button>
            <button
              onClick={onOpenApiDocs}
              className="hover:text-white transition-colors"
            >
              API Reference
            </button>
            <button
              onClick={onOpenHealth}
              className="hover:text-white transition-colors"
            >
              System Health
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} InstaLink. All rights reserved.</p>
          <p className="text-center sm:text-right">
            Independent utility. Not affiliated with, endorsed by, or sponsored by Instagram or Meta Platforms, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
};
