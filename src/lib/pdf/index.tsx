import React from 'react'
import { Document, Page, Text, View, StyleSheet, Link, renderToBuffer } from '@react-pdf/renderer'
import type { ReportInput } from '../report'
import { scoreLabel } from '../scoring'

const BRAND_DARK = '#1e3a5f'
const BRAND_GOLD = '#d4a017'

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: 'Helvetica', color: '#111827' },
  header: {
    backgroundColor: BRAND_DARK,
    padding: 20,
    marginBottom: 16,
    borderRadius: 6,
  },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: 700 },
  headerSubtitle: { color: BRAND_GOLD, fontSize: 9, marginTop: 4, letterSpacing: 1 },
  section: { marginBottom: 14, padding: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 6 },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: BRAND_DARK, marginBottom: 8 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  scoreBox: { flexGrow: 1, textAlign: 'center', padding: 8 },
  scoreValue: { fontSize: 18, fontWeight: 700 },
  scoreLabel: { fontSize: 8, color: '#6b7280', marginTop: 2 },
  text: { fontSize: 10, lineHeight: 1.5, color: '#374151', marginBottom: 4 },
  listItem: { fontSize: 9, lineHeight: 1.5, color: '#374151', marginBottom: 3 },
  recTitle: { fontSize: 10, fontWeight: 700, color: '#111827' },
  recMeta: { fontSize: 8, color: '#6b7280', marginBottom: 2 },
  recDesc: { fontSize: 9, color: '#4b5563', marginBottom: 6 },
  footer: { marginTop: 16, textAlign: 'center', fontSize: 8, color: '#9ca3af' },
  ctaBox: {
    backgroundColor: BRAND_DARK,
    padding: 16,
    borderRadius: 6,
    textAlign: 'center',
    marginBottom: 14,
  },
  ctaTitle: { color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: 6 },
  ctaText: { color: '#d1d5db', fontSize: 9, marginBottom: 10 },
  ctaLink: { color: BRAND_GOLD, fontSize: 10, fontWeight: 700 },
})

function AuditPdfDocument({ input }: { input: ReportInput }) {
  const { businessName, website, createdAt, auditData, recommendations, aiSummary } = input
  const scores = auditData.scores
  const date = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const scoreEntries: [string, number][] = [
    ['Overall', scores.overall],
    ['Technical', scores.technical],
    ['On-Page', scores.onPage],
    ['Performance', scores.performance],
    ['Local SEO', scores.local],
    ['Accessibility', scores.accessibility],
  ]

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>BRYANT DIGITAL SOLUTIONS</Text>
          <Text style={styles.headerSubtitle}>FREE SEO AUDIT REPORT</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{businessName}</Text>
          <Text style={styles.text}>{website}</Text>
          <Text style={styles.recMeta}>Report generated on {date}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scores</Text>
          <View style={styles.scoreRow}>
            {scoreEntries.map(([label, value]) => (
              <View key={label} style={styles.scoreBox}>
                <Text style={styles.scoreValue}>{value}</Text>
                <Text style={styles.scoreLabel}>{label}</Text>
                <Text style={styles.scoreLabel}>{scoreLabel(value)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <Text style={styles.text}>{aiSummary.executiveSummary}</Text>
          <Text style={[styles.text, { fontWeight: 700, marginTop: 6 }]}>Biggest Opportunities:</Text>
          {aiSummary.biggestOpportunities.map((o, i) => (
            <Text key={i} style={styles.listItem}>• {o}</Text>
          ))}
        </View>

        <View style={styles.section} wrap>
          <Text style={styles.sectionTitle}>Recommendations ({recommendations.length})</Text>
          {recommendations.slice(0, 15).map((rec) => (
            <View key={rec.id} style={{ marginBottom: 8 }} wrap={false}>
              <Text style={styles.recTitle}>[{rec.impact}] {rec.title}</Text>
              <Text style={styles.recMeta}>Effort: {rec.difficulty}</Text>
              <Text style={styles.recDesc}>{rec.description}</Text>
            </View>
          ))}
        </View>

        <View style={styles.ctaBox}>
          <Text style={styles.ctaTitle}>Ready to fix these issues?</Text>
          <Text style={styles.ctaText}>Book a free 30-minute strategy call with our team.</Text>
          <Link src="https://bryantdigitalsolutions.com/contactus.html" style={styles.ctaLink}>
            bryantdigitalsolutions.com/contactus.html
          </Link>
        </View>

        <Text style={styles.footer}>
          Bryant Digital Solutions · info@bryantdigitalsolutions.com
        </Text>
      </Page>
    </Document>
  )
}

export async function generateAuditPdf(input: ReportInput): Promise<Buffer> {
  return renderToBuffer(<AuditPdfDocument input={input} />)
}
