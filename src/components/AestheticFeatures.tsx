import React from 'react';
import { Shield, Sparkles, Check, Lock, Zap, QrCode } from 'lucide-react';

export const AestheticFeatures: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-16 pt-8 pb-12">
      {/* 3 Steps: How It Works */}
      <section id="how-it-works" className="space-y-6 scroll-mt-24">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-rose-400">
            Simple Workflow
          </h2>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            How InstaLink Works
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-900/60 border border-white/[0.06] rounded-2xl p-6 space-y-3 relative overflow-hidden group hover:border-white/[0.12] transition-colors">
            <span className="font-mono text-xs font-bold text-slate-500">01</span>
            <h4 className="text-base font-bold text-white">Enter Handle or Link</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Input standard usernames like <code className="text-slate-300">@natgeo</code> or full URLs copied from the mobile app with messy query parameters.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-white/[0.06] rounded-2xl p-6 space-y-3 relative overflow-hidden group hover:border-white/[0.12] transition-colors">
            <span className="font-mono text-xs font-bold text-slate-500">02</span>
            <h4 className="text-base font-bold text-white">Automatic Sanitization</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tracking tags (<code className="text-slate-300">?igsh=</code>, UTM params) are stripped. The username is validated against Instagram's official grammar rules.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-white/[0.06] rounded-2xl p-6 space-y-3 relative overflow-hidden group hover:border-white/[0.12] transition-colors">
            <span className="font-mono text-xs font-bold text-slate-500">03</span>
            <h4 className="text-base font-bold text-white">Canonical Link & QR</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instantly receive the clean HTTPS profile link, open it with safe navigation, copy with one click, or scan the generated QR code on mobile.
            </p>
          </div>
        </div>
      </section>

      {/* Supported Formats Grid */}
      <section id="formats" className="space-y-6 scroll-mt-24">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-purple-400">
            Input Flexibility
          </h2>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Supported Formats
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900/40 border border-white/[0.06] rounded-xl p-4 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-1 min-w-0">
              <h4 className="text-xs font-semibold text-white">Standard Handles</h4>
              <p className="text-xs text-slate-400 font-mono">@example_user · example_user</p>
              <p className="text-[11px] text-slate-500">Normalized to lowercase handle.</p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-white/[0.06] rounded-xl p-4 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-1 min-w-0">
              <h4 className="text-xs font-semibold text-white">Share Links with Tracking</h4>
              <p className="text-xs text-slate-400 font-mono truncate">instagram.com/user?igsh=share_xyz</p>
              <p className="text-[11px] text-slate-500">Tracking queries automatically stripped.</p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-white/[0.06] rounded-xl p-4 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-1 min-w-0">
              <h4 className="text-xs font-semibold text-white">Full HTTPS URLs</h4>
              <p className="text-xs text-slate-400 font-mono">https://www.instagram.com/user/</p>
              <p className="text-[11px] text-slate-500">Trailing slashes and schemes handled cleanly.</p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-white/[0.06] rounded-xl p-4 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-1 min-w-0">
              <h4 className="text-xs font-semibold text-white">Mobile Web Domains</h4>
              <p className="text-xs text-slate-400 font-mono">m.instagram.com/user</p>
              <p className="text-[11px] text-slate-500">Canonicalized to desktop & app compatible origin.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Privacy Assurances */}
      <section id="safety" className="space-y-6 scroll-mt-24">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Privacy First
          </h2>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Safety & Privacy Guarantees
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-900/60 border border-white/[0.06] rounded-2xl p-6 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
              <Shield className="w-4 h-4 text-rose-400" />
            </div>
            <h4 className="text-sm font-bold text-white">Zero Tracking Logs</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              We never log or save your searches. Queries are parsed transiently in-memory and discarded upon response.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-white/[0.06] rounded-2xl p-6 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
              <Lock className="w-4 h-4 text-purple-400" />
            </div>
            <h4 className="text-sm font-bold text-white">Strict Origin Lock</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every link is locked to <code className="text-slate-300">https://www.instagram.com/</code>, preventing phishing links and open redirect attacks.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-white/[0.06] rounded-2xl p-6 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <h4 className="text-sm font-bold text-white">Safe Navigation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Redirection never happens automatically. You review the verified link and choose when to open Instagram.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
