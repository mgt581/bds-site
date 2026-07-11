import type { AuditData } from '../audit'
import type { Recommendation } from '../recommendations'
import { scoreLabel } from '../scoring'

export interface AISummary {
  executiveSummary: string
  biggestOpportunities: string[]
  priorityActionPlan: string[]
  expectedImprovements: string
}

export async function generateAISummary(
  data: AuditData,
  recommendations: Recommendation[],
  businessName: string
): Promise<AISummary> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return ruleBasedSummary(data, recommendations, businessName)
  }

  try {
    const { default: OpenAI } = await import('openai')
    const client = new OpenAI({ apiKey })

    const topIssues = recommendations
      .slice(0, 8)
      .map((r) => `- [${r.impact}] ${r.title}: ${r.description}`)
      .join('\n')

    const prompt = `You are an SEO consultant writing a friendly, professional summary for a small business owner named "${businessName}".
Their website scored ${data.scores.overall}/100 overall (${scoreLabel(data.scores.overall)}).
Category scores: Technical ${data.scores.technical}, On-Page ${data.scores.onPage}, Performance ${data.scores.performance}, Local SEO ${data.scores.local}, Accessibility ${data.scores.accessibility}.

Top issues found:
${topIssues}

Respond with strict JSON matching this TypeScript type, and nothing else:
{
  "executiveSummary": string, // 2-3 sentences, friendly but professional, non-technical tone
  "biggestOpportunities": string[], // 3-4 short bullet points
  "priorityActionPlan": string[], // 3-5 short, ordered action steps
  "expectedImprovements": string // 1-2 sentences on realistic expected benefits of fixing these issues
}`

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) return ruleBasedSummary(data, recommendations, businessName)

    const parsed = JSON.parse(content)
    if (
      typeof parsed.executiveSummary === 'string' &&
      Array.isArray(parsed.biggestOpportunities) &&
      Array.isArray(parsed.priorityActionPlan) &&
      typeof parsed.expectedImprovements === 'string'
    ) {
      return parsed as AISummary
    }
    return ruleBasedSummary(data, recommendations, businessName)
  } catch {
    return ruleBasedSummary(data, recommendations, businessName)
  }
}

function ruleBasedSummary(
  data: AuditData,
  recommendations: Recommendation[],
  businessName: string
): AISummary {
  const label = scoreLabel(data.scores.overall)
  const highImpact = recommendations.filter((r) => r.impact === 'High')

  const executiveSummary = `${businessName}'s website scored ${data.scores.overall}/100, which is rated "${label}". ${
    highImpact.length > 0
      ? `We identified ${highImpact.length} high-impact issue${highImpact.length === 1 ? '' : 's'} that are likely holding back search visibility.`
      : 'The site is in solid shape overall, with only minor improvements recommended.'
  } Addressing the recommendations below can meaningfully improve organic search performance.`

  const biggestOpportunities = (highImpact.length > 0 ? highImpact : recommendations)
    .slice(0, 4)
    .map((r) => r.title)

  const priorityActionPlan = recommendations.slice(0, 5).map((r, i) => `${i + 1}. ${r.title}`)

  const expectedImprovements =
    'Implementing these recommendations typically improves search rankings, click-through rates, and site usability within 4-12 weeks, depending on competition and how quickly changes are deployed.'

  return { executiveSummary, biggestOpportunities, priorityActionPlan, expectedImprovements }
}
