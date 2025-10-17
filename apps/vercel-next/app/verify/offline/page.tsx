'use client';

import { useState } from 'react';
import Link from 'next/link';

type VerifyResult = {
  valid: boolean;
  error?: string;
  message?: string;
  payload?: Record<string, unknown>;
  header?: Record<string, unknown>;
};

export default function VerifyOfflinePage() {
  const [receipt, setReceipt] = useState('');
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function verifyReceipt() {
    if (!receipt.trim()) {
      alert('Please paste a receipt');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receipt: receipt.trim() })
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({
        valid: false,
        error: 'network_error',
        message: error instanceof Error ? error.message : 'Network error'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-gray-900 font-bold text-xl">
            PEAC × x402
          </Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
            ← Back to Home
          </Link>
        </nav>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Verify PEAC Receipt
          </h1>
          <p className="text-xl text-gray-600">
            Paste a PEAC-Receipt JWS token to verify its authenticity
          </p>
        </div>

        <div className="max-w-4xl mx-auto card p-8">
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              PEAC-Receipt (JWS Token)
            </label>
            <textarea
              value={receipt}
              onChange={(e) => setReceipt(e.target.value)}
              placeholder="eyJhbGciOiJFZERTQSIsImtpZCI6InBlYWMtZGVtby1rZXktMSIsInR5cCI6InBlYWMtcmVjZWlwdCtqd3MifQ..."
              className="w-full h-40 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none text-gray-900 bg-gray-50"
            />
          </div>

          <button
            onClick={verifyReceipt}
            disabled={loading || !receipt.trim()}
            className="w-full btn-primary text-lg py-3 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Verifying...' : 'Verify Receipt'}
          </button>

          {result && (
            <div className={`mt-8 p-6 rounded-lg border-2 ${result.valid ? 'bg-green-50 border-success' : 'bg-red-50 border-error'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`text-3xl font-bold ${result.valid ? 'text-success' : 'text-error'}`}>
                  {result.valid ? '✓' : '✕'}
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${result.valid ? 'text-green-900' : 'text-red-900'}`}>
                    {result.valid ? 'Valid Receipt' : 'Invalid Receipt'}
                  </h3>
                  {result.message && (
                    <p className={`text-sm ${result.valid ? 'text-green-700' : 'text-red-700'}`}>
                      {result.message}
                    </p>
                  )}
                </div>
              </div>

              {result.valid && result.payload && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Receipt Details:</h4>
                  <div className="bg-white rounded-lg p-4 space-y-3 text-sm border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-gray-600 text-xs">Subject:</span>
                        <div className="font-semibold text-gray-900">{String(result.payload.subject || '')}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 text-xs">Amount:</span>
                        <div className="font-semibold text-gray-900">
                          ${String((result.payload.payment as Record<string, unknown>)?.amount || '')} {String((result.payload.payment as Record<string, unknown>)?.currency || '')}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 text-xs">Chain:</span>
                        <div className="font-semibold text-gray-900">{String((result.payload.payment as Record<string, unknown>)?.chain || '')}</div>
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-600 text-xs">Issued At:</span>
                      <div className="font-mono text-xs text-gray-900">{String(result.payload.issued_at || '')}</div>
                    </div>

                    <div>
                      <span className="text-gray-600 text-xs">Response Hash:</span>
                      <div className="font-mono text-xs break-all text-gray-900">{String((result.payload.response as Record<string, unknown>)?.body_sha256 || '')}</div>
                    </div>

                    <details className="mt-2">
                      <summary className="cursor-pointer text-brand font-semibold hover:text-brand-hover">
                        View Full Payload
                      </summary>
                      <pre className="mt-3 p-4 bg-gray-100 rounded-lg text-xs overflow-auto max-h-96 text-gray-900">
                        {JSON.stringify(result.payload, null, 2)}
                      </pre>
                    </details>
                  </div>
                </div>
              )}

              {result.header && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Protected Header:</h4>
                  <pre className="bg-white border border-gray-200 rounded-lg p-4 text-xs overflow-auto text-gray-900">
                    {JSON.stringify(result.header, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto mt-12 card p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">How Receipt Verification Works</h3>
          <ol className="space-y-4 text-gray-700">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center font-bold">1</span>
              <span className="pt-1">Receipt is a cryptographically signed JWS (JSON Web Signature) token</span>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center font-bold">2</span>
              <span className="pt-1">Signed with Ed25519 (EdDSA) private key held by the API provider</span>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center font-bold">3</span>
              <span className="pt-1">Verification uses the public key from <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-sm">/public-keys/[kid].json</code></span>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center font-bold">4</span>
              <span className="pt-1">Proves: payment was made, content was received, policy was agreed to</span>
            </li>
          </ol>
        </div>

        <div className="max-w-4xl mx-auto mt-8 text-center">
          <Link
            href="/shop"
            className="btn-primary text-base"
          >
            Try the Shop Demo →
          </Link>
        </div>
      </div>
    </div>
  );
}
