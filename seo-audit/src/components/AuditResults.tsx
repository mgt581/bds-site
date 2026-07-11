'use client';

import type { AuditFinding, AuditResult, Priority } from '@/types/audit';
import { groupByPriority } from '@/lib/prioritization';
import { scoreLabel } from '@/lib/scoring';

interface Props {
  result: AuditResult;
  onReset: () => void;
}

export default function AuditResults({ result, onReset }: Props) {
  const { score, findings, summary, input, auditedAt } = result;
  const { label, color } = scoreLabel(score);
  const groups = groupByPriority(findings);
  const auditDate = new Date(auditedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-8">
      {/* Score summary card */}
      <div className="card flex flex-col sm:flex-row items-center gap-6">
        <ScoreCircle score={score} color={color} />
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl font-bold text-gray-900">
            SEO Audit for{' '}
            <span className="text-brand-700">{input.businessName}</span>
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Audited: <span className="font-medium text-gray-700">{input.url}</span>
            {' · '}{auditDate}
          </p>
          <p className="mt-2 text-base font-semibold" style={{ color: color }}>
            {label}
          </p>
          <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-3 text-sm">
            <SummaryBadge count={summary.high} label="High priority" variant="high" />
            <SummaryBadge count={summary.medium} label="Medium priority" variant="medium" />
            <SummaryBadge count={summary.low} label="Low priority" variant="low" />
            <SummaryBadge count={summary.passed} label="Passed" variant="pass" />
          </div>
        </div>
      </div>

      {/* Priority groups */}
      {groups.high.length > 0 && (
        <FindingGroup
          title="🔴 High Priority"
          subtitle="Fix these first — they have the biggest impact on your rankings and visibility."
          findings={groups.high}
          priority="high"
        />
      )}
      {groups.medium.length > 0 && (
        <FindingGroup
          title="🟡 Medium Priority"
          subtitle="Important improvements that will strengthen your SEO once the high-priority items are addressed."
          findings={groups.medium}
          priority="medium"
        />
      )}
      {groups.low.length > 0 && (
        <FindingGroup
          title="🔵 Low Priority"
          subtitle="Minor optimisations and polish. Worth doing, but not urgent."
          findings={groups.low}
          priority="low"
        />
      )}
      {groups.passed.length > 0 && (
        <FindingGroup
          title="✅ Passed"
          subtitle="These SEO elements are already in good shape."
          findings={groups.passed}
          priority="low"
          isPass
        />
      )}

      {/* Next steps CTA */}
      <div className="card bg-brand-50 border-brand-100 text-center space-y-3">
        <h3 className="text-lg font-bold text-brand-800">
          Want expert help fixing these issues?
        </h3>
        <p className="text-sm text-brand-700 max-w-lg mx-auto">
          Bryant Digital Solutions specialises in turning SEO findings like these into
          real ranking improvements and more enquiries for your business.
        </p>
        <a
          href="https://bryantdigitalsolutions.com/contactus.html"
          className="btn-primary mx-auto"
        >
          Book a Free Consultation →
        </a>
      </div>

      <div className="text-center">
        <button
          onClick={onReset}
          className="text-sm text-brand-600 underline hover:text-brand-800"
        >
          ← Audit another website
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────

function ScoreCircle({ score, color }: { score: number; color: string }) {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex-shrink-0 flex items-center justify-center">
      <svg width="100" height="100" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <span className="block text-2xl font-bold leading-none" style={{ color: color }}>
          {score}
        </span>
        <span className="text-[10px] text-gray-500 font-medium">/ 100</span>
      </div>
    </div>
  );
}

function SummaryBadge({
  count,
  label,
  variant,
}: {
  count: number;
  label: string;
  variant: Priority | 'pass';
}) {
  const cls =
    variant === 'high'
      ? 'badge-high'
      : variant === 'medium'
      ? 'badge-medium'
      : variant === 'low'
      ? 'badge-low'
      : 'badge-pass';
  return (
    <span className={cls}>
      {count} {label}
    </span>
  );
}

function FindingGroup({
  title,
  subtitle,
  findings,
  priority,
  isPass = false,
}: {
  title: string;
  subtitle: string;
  findings: AuditFinding[];
  priority: Priority;
  isPass?: boolean;
}) {
  return (
    <div>
      <h3 className="text-base font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-3">{subtitle}</p>
      <div className="space-y-3">
        {findings.map((finding) => (
          <FindingCard key={finding.id} finding={finding} isPass={isPass} />
        ))}
      </div>
    </div>
  );
}

function FindingCard({
  finding,
  isPass,
}: {
  finding: AuditFinding;
  isPass: boolean;
}) {
  const badgeCls = isPass
    ? 'badge-pass'
    : finding.priority === 'high'
    ? 'badge-high'
    : finding.priority === 'medium'
    ? 'badge-medium'
    : 'badge-low';

  const borderColor = isPass
    ? 'border-l-green-400'
    : finding.priority === 'high'
    ? 'border-l-red-400'
    : finding.priority === 'medium'
    ? 'border-l-amber-400'
    : 'border-l-blue-400';

  return (
    <div
      className={`card border-l-4 ${borderColor} py-4 px-5 space-y-2`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-gray-800">{finding.label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">{finding.category}</span>
          <span className={badgeCls}>
            {isPass ? 'Pass' : finding.priority}
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{finding.explanation}</p>
      {finding.value && (
        <p className="text-xs text-gray-400 font-mono bg-gray-50 rounded px-2 py-1 truncate">
          {finding.value}
        </p>
      )}
    </div>
  );
}
