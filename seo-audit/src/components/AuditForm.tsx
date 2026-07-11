'use client';

import { useState } from 'react';
import type { AuditResult } from '@/types/audit';
import AuditResults from './AuditResults';

interface FormState {
  url: string;
  businessName: string;
  email: string;
}

const initialForm: FormState = {
  url: '',
  businessName: '',
  email: '',
};

export default function AuditForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      setResult(data as AuditResult);
      // Scroll to results
      setTimeout(() => {
        document.getElementById('audit-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch {
      setError('Unable to reach the server. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setForm(initialForm);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <section className="mx-auto max-w-2xl px-4 py-10">
        <form onSubmit={handleSubmit} className="card space-y-5" noValidate>
          <div>
            <label className="label" htmlFor="url">
              Website URL <span className="text-red-500">*</span>
            </label>
            <input
              id="url"
              name="url"
              type="url"
              inputMode="url"
              required
              placeholder="https://example.com"
              className="input-field"
              value={form.url}
              onChange={handleChange}
              disabled={isLoading}
              aria-describedby="url-hint"
            />
            <p id="url-hint" className="mt-1 text-xs text-gray-500">
              Enter the full URL of the page you want to audit.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="businessName">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              required
              placeholder="Acme Ltd"
              className="input-field"
              value={form.businessName}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="label" htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="input-field"
              value={form.email}
              onChange={handleChange}
              disabled={isLoading}
              aria-describedby="email-hint"
            />
            <p id="email-hint" className="mt-1 text-xs text-gray-500">
              We will send your full report to this address. No spam, ever.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !form.url || !form.businessName || !form.email}
            className="btn-primary w-full text-base py-3"
          >
            {isLoading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Analysing your site…
              </>
            ) : (
              'Run Free SEO Audit →'
            )}
          </button>

          <p className="text-center text-xs text-gray-500">
            Free, instant, no credit card required. Takes about 10 seconds.
          </p>
        </form>
      </section>

      {result && (
        <section id="audit-results" className="mx-auto max-w-4xl px-4 pb-16">
          <AuditResults result={result} onReset={handleReset} />
        </section>
      )}
    </>
  );
}
