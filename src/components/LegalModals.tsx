import React from 'react';
import { X, Shield, FileText, AlertOctagon } from 'lucide-react';

export type LegalModalType = 'privacy' | 'terms' | 'abuse' | null;

interface LegalModalsProps {
  activeModal: LegalModalType;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalsProps> = ({ activeModal, onClose }) => {
  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeModal === 'privacy' && <Shield className="w-5 h-5 text-emerald-400" />}
            {activeModal === 'terms' && <FileText className="w-5 h-5 text-sky-400" />}
            {activeModal === 'abuse' && <AlertOctagon className="w-5 h-5 text-rose-400" />}
            <h3 className="text-lg font-bold text-white">
              {activeModal === 'privacy' && 'Privacy Policy & Data Governance'}
              {activeModal === 'terms' && 'Terms of Use & Acceptable Usage'}
              {activeModal === 'abuse' && 'Report Abuse & Security Vulnerability'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-300 space-y-4 leading-relaxed">
          {activeModal === 'privacy' && (
            <>
              <p>
                <strong>1. Data Minimization by Default:</strong> This application adheres to strict data minimization principles. We do not require accounts, logins, or cookies to normalize Instagram handles or profile links.
              </p>
              <p>
                <strong>2. Zero Search History:</strong> All search queries, usernames, and URLs submitted to the resolver are processed ephemerally in-memory. They are never written to any database, persistent logs, or third-party analytical pipelines.
              </p>
              <p>
                <strong>3. Client IP Protection:</strong> IP addresses are inspected transiently within an in-memory sliding window purely for the technical purpose of defending against volumetric DDoS and automated abuse. They are never retained in persistent storage.
              </p>
              <p>
                <strong>4. No Profiling or Scraping:</strong> We do not scrape, index, or harvest user profiles, follower counts, biographies, or private account data.
              </p>
            </>
          )}

          {activeModal === 'terms' && (
            <>
              <p>
                <strong>1. Permitted Purpose:</strong> This platform is designed solely as a syntactic utility to normalize Instagram handles and profile URLs into canonical HTTPS links.
              </p>
              <p>
                <strong>2. Independent Utility Notice:</strong> This service is an independent developer utility and is not affiliated with, sponsored by, or endorsed by Instagram, Meta Platforms, Inc., or any of their affiliates. Instagram and related marks are trademarks of Meta Platforms, Inc.
              </p>
              <p>
                <strong>3. Prohibited Usage:</strong> Users may not use this service to conduct credential harvesting, automated scraping sweeps, harassment, evasion of access controls, or arbitrary open redirection.
              </p>
              <p>
                <strong>4. Absence of Verification Guarantee:</strong> A constructed profile URL confirms syntactic normalization only and does not warrant that an Instagram account exists or is currently active.
              </p>
            </>
          )}

          {activeModal === 'abuse' && (
            <>
              <p>
                <strong>Security Incident & Abuse Reporting (RFC 9116 / security.txt):</strong>
              </p>
              <p>
                We welcome responsible security disclosures and abuse reports. If you discover a vulnerability, potential open redirect vector, or abuse pattern:
              </p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500">Security Contact:</span>{' '}
                  <span className="text-rose-400">security@instalink.local</span>
                </div>
                <div>
                  <span className="text-slate-500">Abuse Inquiries:</span>{' '}
                  <span className="text-slate-200">abuse-response@instalink.local</span>
                </div>
                <div>
                  <span className="text-slate-500">Encryption:</span>{' '}
                  <span className="text-slate-400">OpenPGP Key Available upon request</span>
                </div>
                <div>
                  <span className="text-slate-500">SLA:</span>{' '}
                  <span className="text-emerald-400">Response within 24 business hours</span>
                </div>
              </div>
              <p>
                Please include reproducible reproduction steps, curl payloads, and threat analysis. We strictly investigate all reported security concerns under our defense-in-depth framework.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
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
