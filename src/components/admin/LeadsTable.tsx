'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { LeadStatusBadge } from './LeadStatusBadge'
import { SearchFilters } from './SearchFilters'
import { scoreColor } from '@/lib/scoring'

interface LeadRow {
  id: string
  name: string
  email: string
  website: string
  businessName: string
  status: 'NEW' | 'CONTACTED' | 'WON' | 'LOST'
  createdAt: string
  auditReports: { id: string; overallScore: number; createdAt: string }[]
}

export function LeadsTable() {
  const [leads, setLeads] = useState<LeadRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [scoreRange, setScoreRange] = useState('')
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    if (scoreRange) {
      const [min, max] = scoreRange.split('-')
      params.set('minScore', min)
      params.set('maxScore', max)
    }
    try {
      const res = await fetch(`/api/leads?${params.toString()}`)
      const data = await res.json()
      setLeads(data.leads || [])
    } finally {
      setLoading(false)
    }
  }, [search, status, scoreRange])

  useEffect(() => {
    const timeout = setTimeout(fetchLeads, 300)
    return () => clearTimeout(timeout)
  }, [fetchLeads])

  async function updateStatus(id: string, newStatus: string) {
    await fetch(`/api/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    fetchLeads()
  }

  async function resendEmail(id: string) {
    setActionMessage(null)
    const res = await fetch(`/api/leads/${id}/resend`, { method: 'POST' })
    if (res.ok) {
      setActionMessage('Email resent successfully.')
    } else {
      const data = await res.json()
      setActionMessage(data.error || 'Failed to resend email.')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <SearchFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        scoreRange={scoreRange}
        onScoreRangeChange={setScoreRange}
      />

      {actionMessage && (
        <div className="rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">{actionMessage}</div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Website</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Score</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                  Loading leads...
                </td>
              </tr>
            )}
            {!loading && leads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                  No leads found.
                </td>
              </tr>
            )}
            {!loading &&
              leads.map((lead) => {
                const latestReport = lead.auditReports[0]
                return (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <Link href={`/admin/leads/${lead.id}`} className="hover:underline">
                        {lead.name}
                      </Link>
                      <div className="text-xs text-gray-400">{lead.businessName}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{lead.email}</td>
                    <td className="max-w-[180px] truncate px-4 py-3 text-gray-600">
                      {lead.website}
                    </td>
                    <td className="px-4 py-3">
                      {latestReport ? (
                        <span
                          className="font-bold"
                          style={{ color: scoreColor(latestReport.overallScore) }}
                        >
                          {latestReport.overallScore}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className="rounded border border-gray-200 bg-transparent px-2 py-1 text-xs"
                      >
                        <option value="NEW">New</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="WON">Won</option>
                        <option value="LOST">Lost</option>
                      </select>
                      <div className="mt-1">
                        <LeadStatusBadge status={lead.status} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {latestReport && (
                          <>
                            <a
                              href={`/audit/${latestReport.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-brand-dark hover:underline"
                            >
                              View
                            </a>
                            <a
                              href={`/api/reports/${latestReport.id}/pdf`}
                              className="text-xs font-medium text-brand-dark hover:underline"
                            >
                              PDF
                            </a>
                          </>
                        )}
                        <button
                          onClick={() => resendEmail(lead.id)}
                          className="text-xs font-medium text-brand-dark hover:underline"
                        >
                          Resend
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
