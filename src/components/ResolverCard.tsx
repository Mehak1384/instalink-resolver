import React, { useState, useEffect, useId } from 'react';
import QRCode from 'qrcode';
import {
  Search,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  Smartphone,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Link2,
} from 'lucide-react';
import { resolveInstagramInput, ValidationSuccess, ValidationError } from '../lib/instagramValidator';

interface ResolverCardProps {
  initialQuery?: string;
}

const SAMPLE_QUERIES = [
  { label: '@natgeo', query: '@natgeo' },
  { label: 'nasa', query: 'nasa' },
  { label: 'instagram.com/apple', query: 'https://www.instagram.com/apple?igsh=share_test' },
  { label: 'designer.studio_2026', query: 'designer.studio_2026' },
];

export const ResolverCard: React.FC<ResolverCardProps> = ({ initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationSuccess | null>(null);
  const [error, setError] = useState<ValidationError | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const inputId = useId();

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      handleResolve(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (result?.profileUrl) {
      QRCode.toDataURL(result.profileUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#090d16',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate QR:', err));
    } else {
      setQrDataUrl(null);
    }
  }, [result]);

  const handleResolve = async (inputToResolve = query) => {
    const trimmed = inputToResolve.trim();
    if (!trimmed) {
      setError({
        isValid: false,
        error: 'Please enter an Instagram username or profile link.',
        code: 'EMPTY_INPUT',
      });
      setResult(null);
      setLatencyMs(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    const start = performance.now();

    try {
      const response = await fetch('/api/v1/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
      });

      const elapsed = Number((performance.now() - start).toFixed(1));
      setLatencyMs(elapsed);
      const data = await response.json();

      if (!response.ok) {
        setError({
          isValid: false,
          error: data.error || 'Check the username or URL and try again.',
          code: data.code || 'UNSUPPORTED_FORMAT',
        });
      } else {
        setResult({
          isValid: true,
          username: data.username,
          profileUrl: data.profile_url,
          appDeepLink: data.app_deep_link || `instagram://user?username=${data.username}`,
          status: data.status,
          verified: data.verified,
          inputFormat: data.input_format || 'raw_username',
        });
      }
    } catch {
      // Graceful instant fallback to client-side resolver
      const elapsed = Number((performance.now() - start).toFixed(1));
      setLatencyMs(elapsed);
      const clientRes = resolveInstagramInput(trimmed);
      if (clientRes.isValid) {
        setResult(clientRes);
      } else {
        setError(clientRes);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleResolve();
    } else if (e.key === 'Escape') {
      setQuery('');
      setResult(null);
      setError(null);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setQuery(text);
        handleResolve(text);
      }
    } catch {
      // Clipboard access unavailable or denied
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* Hero Headline */}
      <div className="text-center space-y-3 pt-4 sm:pt-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight text-balance">
          Find & Canonicalize Any{' '}
          <span className="bg-gradient-to-r from-amber-400 via-rose-500 to-purple-500 bg-clip-text text-transparent">
            Instagram Link
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed text-balance">
          Paste any handle or cluttered URL to strip tracking parameters, validate syntax, and generate a clean, safe profile link.
        </p>
      </div>

      {/* Main Search Input Card */}
      <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-white/15 via-white/5 to-transparent shadow-2xl">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 sm:p-7 space-y-4">
          <label htmlFor={inputId} className="block text-xs font-medium text-slate-400">
            Instagram Handle or Profile Link
          </label>

          <div className="relative flex items-center">
            <div className="absolute left-4 pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>

            <input
              id={inputId}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. @natgeo or instagram.com/creator?igsh=..."
              className="w-full bg-slate-950/80 border border-white/10 hover:border-white/20 focus:border-rose-500/80 rounded-xl py-3.5 pl-11 pr-24 text-white placeholder:text-slate-500 text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all font-mono"
              autoComplete="off"
              spellCheck="false"
            />

            <div className="absolute right-2 flex items-center gap-1.5">
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setResult(null);
                    setError(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  title="Clear input"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePaste}
                  className="px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-white/10 rounded-lg transition-colors"
                  title="Paste from clipboard"
                >
                  Paste
                </button>
              )}
            </div>
          </div>

          {/* Quick Examples */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-500">Examples:</span>
            {SAMPLE_QUERIES.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => {
                  setQuery(sample.query);
                  handleResolve(sample.query);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 hover:text-white transition-colors text-xs font-mono"
              >
                {sample.label}
              </button>
            ))}
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Strict origin lock · No persistent search history</span>
            </div>

            <button
              type="button"
              onClick={() => handleResolve()}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:via-rose-400 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-rose-500/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <span>Generate Clean Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Card */}
      {error && (
        <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-5 text-rose-200 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-300">
                Invalid Input
              </h3>
              <p className="text-sm text-rose-200">{error.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Aesthetic Profile Result Card */}
      {result && (
        <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-rose-500/30 via-purple-500/20 to-white/5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-slate-900/95 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 space-y-6">
            {/* Profile Header Lockup */}
            <div className="flex items-center gap-4 pb-6 border-b border-white/[0.08]">
              {/* Instagram Story Gradient Ring Avatar */}
              <div className="w-14 h-14 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shrink-0 shadow-sm shadow-rose-500/20">
                <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-white font-bold text-lg uppercase">
                  {result.username.charAt(0)}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-mono truncate">
                    @{result.username}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span>Constructed Link</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-400">Unverified Profile</span>
                  {latencyMs !== null && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums text-slate-400">{latencyMs}ms</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Canonical Link Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium">Canonical Profile Link</span>
                <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Origin Verified</span>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <div className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-slate-200 font-mono text-sm break-all select-all flex items-center">
                  <span>{result.profileUrl}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(result.profileUrl)}
                    className="flex-1 sm:flex-none px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                    title="Copy Link to Clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowQrModal(true)}
                    className="px-3.5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center transition-colors"
                    title="View QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Primary Action Button (Open Profile) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href={result.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-5 py-3.5 bg-gradient-to-r from-rose-600 via-rose-500 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group active:scale-95"
              >
                <span>Open Profile on Instagram</span>
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <a
                href={result.appDeepLink}
                className="w-full px-5 py-3.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4 text-slate-400" />
                <span>Open in Mobile App</span>
              </a>
            </div>

            {/* Trust & Verification Footnote */}
            <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-white/[0.06]">
              This link is syntactically normalized to Instagram's official origin. To preserve privacy, account existence is unverified without authorized Meta API access.
            </p>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && qrDataUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-xs w-full p-6 text-center space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>

            <h4 className="text-base font-bold text-white">Instagram Profile QR</h4>
            <p className="text-xs text-slate-400">Scan with phone camera to open @{result?.username}</p>

            <div className="bg-white p-3.5 rounded-xl inline-block shadow-lg">
              <img src={qrDataUrl} alt={`QR Code for ${result?.profileUrl}`} className="w-52 h-52 mx-auto" />
            </div>

            <div className="flex gap-2 pt-1">
              <a
                href={qrDataUrl}
                download={`instagram_${result?.username}_qr.png`}
                className="flex-1 py-2 px-3 bg-white text-slate-900 hover:bg-slate-100 text-xs font-semibold rounded-lg transition-colors"
              >
                Download
              </a>
              <button
                onClick={() => setShowQrModal(false)}
                className="py-2 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
