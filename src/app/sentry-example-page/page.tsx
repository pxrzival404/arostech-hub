'use client';

export const runtime = 'edge';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Server, ArrowLeft, Bug, ShieldAlert, Sparkles } from 'lucide-react';

export default function SentryExamplePage() {
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [apiErrorMsg, setApiErrorMsg] = useState<string | null>(null);

  const triggerClientError = () => {
    // Intentionally trigger a JavaScript runtime error on the client
    throw new Error('Sentry Example Client-Side Error: Testing automatic client tracking');
  };

  const triggerApiError = async () => {
    setApiStatus('loading');
    setApiErrorMsg(null);
    try {
      // Call the faulty API route which throws an error on the server
      const res = await fetch('/api/sentry-example-api');
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      setApiStatus('idle');
    } catch (err: any) {
      setApiStatus('error');
      setApiErrorMsg(err.message || 'Intentionally triggered API error.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 selection:bg-rose-500/30 selection:text-rose-200">
      {/* Decorative Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500">
            <Bug className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-rose-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
              Sentry Diagnostic Portal
            </h1>
            <p className="text-xs text-slate-400">Next.js Integration Verification</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-8">
          This diagnostic portal lets you trigger test exceptions on both the client (browser runtime) and the server (API routes) to verify that your Sentry configuration is active and reporting issues.
        </p>

        {/* Buttons / Actions */}
        <div className="space-y-4 mb-8">
          {/* Client Error Button */}
          <button
            onClick={triggerClientError}
            className="w-full flex items-center justify-between p-4 bg-slate-850 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 rounded-xl transition duration-200 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400 group-hover:scale-110 transition">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-200 group-hover:text-rose-300 transition">
                  Trigger Client Exception
                </div>
                <div className="text-xs text-slate-400">Throws a JavaScript error in the browser</div>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-slate-600 group-hover:text-rose-400 transition" />
          </button>

          {/* API Error Button */}
          <button
            onClick={triggerApiError}
            disabled={apiStatus === 'loading'}
            className="w-full flex items-center justify-between p-4 bg-slate-850 hover:bg-violet-500/10 border border-slate-800 hover:border-violet-500/30 rounded-xl transition duration-200 group text-left cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400 group-hover:scale-110 transition">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-200 group-hover:text-violet-300 transition">
                  Trigger API Route Exception
                </div>
                <div className="text-xs text-slate-400">Calls a serverless route that throws an error</div>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition" />
          </button>
        </div>

        {/* API Response Status Feedback */}
        {apiStatus === 'loading' && (
          <div className="flex items-center gap-2 text-xs text-violet-400 animate-pulse bg-violet-950/20 border border-violet-900/30 rounded-lg p-3 mb-8">
            <Server className="w-4 h-4" />
            <span>Invoking API Route and triggering Server-Side Exception...</span>
          </div>
        )}

        {apiStatus === 'error' && (
          <div className="flex items-start gap-2.5 text-xs text-rose-400 bg-rose-950/20 border border-rose-900/30 rounded-lg p-3 mb-8">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Server Exception Sent:</span>
              <span className="font-mono text-slate-300 break-words">{apiErrorMsg}</span>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="flex justify-center border-t border-slate-800 pt-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition duration-150"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Hub</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
