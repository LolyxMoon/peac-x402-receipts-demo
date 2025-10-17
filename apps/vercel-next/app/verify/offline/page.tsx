'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function VerifyOfflinePage() {
  const [receipt, setReceipt] = useState('');
  const [result, setResult] = useState<any>(null);
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
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8 text-center">
          <Link href="/" className="text-white/80 hover:text-white text-sm">← Back to Home</Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-2">
            Verify PEAC Receipt
          </h1>
          <p className="text-white/90 text-lg">
            Paste a PEAC-Receipt JWS token to verify its authenticity
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-lg rounded-xl p-8">
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              PEAC-Receipt (JWS Token)
            </label>
            <textarea
              value={receipt}
              onChange={(e) => setReceipt(e.target.value)}
              placeholder="eyJhbGciOiJFZERTQSIsImtpZCI6InBlYWMtZGVtby1rZXktMSIsInR5cCI6InBlYWMtcmVjZWlwdCtqd3MifQ..."
              className="w-full h-40 p-4 border-2 border-gray-300 rounded-lg font-mono text-sm focus:border-purple-500 focus:outline-none"
            />
          </div>

          <button
            onClick={verifyReceipt}
            disabled={loading || !receipt.trim()}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-purple-700 transition-all hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? '⏳ Verifying...' : '🔍 Verify Receipt'}
          </button>

          {result && (
            <div className={`mt-6 p-6 rounded-lg ${result.valid ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`text-3xl ${result.valid ? 'text-green-600' : 'text-red-600'}`}>
                  {result.valid ? '✅' : '❌'}
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${result.valid ? 'text-green-800' : 'text-red-800'}`}>
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
                  <h4 className="font-semibold text-gray-700 mb-2">Receipt Details:</h4>
                  <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <span className="text-gray-600">Subject:</span>
                        <div className="font-semibold">{result.payload.subject}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Amount:</span>
                        <div className="font-semibold">
                          ${result.payload.payment?.amount} {result.payload.payment?.currency}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Chain:</span>
                        <div className="font-semibold">{result.payload.payment?.chain}</div>
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-600">Issued At:</span>
                      <div className="font-mono text-xs">{result.payload.issued_at}</div>
                    </div>

                    <div>
                      <span className="text-gray-600">Response Hash:</span>
                      <div className="font-mono text-xs break-all">{result.payload.response?.body_sha256}</div>
                    </div>

                    <details className="mt-2">
                      <summary className="cursor-pointer text-purple-600 font-semibold">
                        View Full Payload
                      </summary>
                      <pre className="mt-2 p-4 bg-gray-50 rounded text-xs overflow-auto max-h-96">
                        {JSON.stringify(result.payload, null, 2)}
                      </pre>
                    </details>
                  </div>
                </div>
              )}

              {result.header && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Protected Header:</h4>
                  <pre className="bg-white rounded-lg p-4 text-xs overflow-auto">
                    {JSON.stringify(result.header, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto mt-8 bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4">How Receipt Verification Works</h3>
          <ol className="space-y-2 text-white/90">
            <li className="flex gap-3">
              <span className="font-bold">1.</span>
              <span>Receipt is a cryptographically signed JWS (JSON Web Signature) token</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">2.</span>
              <span>Signed with Ed25519 (EdDSA) private key held by the API provider</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">3.</span>
              <span>Verification uses the public key from <code className="bg-white/20 px-1 rounded">/public-keys/[kid].json</code></span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">4.</span>
              <span>Proves: payment was made, content was received, policy was agreed to</span>
            </li>
          </ol>
        </div>

        <div className="max-w-4xl mx-auto mt-6 text-center">
          <Link
            href="/shop"
            className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all hover:scale-105"
          >
            Try the Shop Demo →
          </Link>
        </div>
      </div>
    </div>
  );
}
