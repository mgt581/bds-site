import type { AuditData } from '../audit'

export interface Recommendation {
  id: string
  category: 'technical' | 'onpage' | 'performance' | 'local' | 'accessibility'
  title: string
  description: string
  whyItMatters: string
  howToFix: string
  impact: 'High' | 'Medium' | 'Low'
  difficulty: 'Easy' | 'Medium' | 'Advanced'
}

export function generateRecommendations(data: AuditData): Recommendation[] {
  const recs: Recommendation[] = []

  // --- On-page ---
  if (!data.onPage.title.value) {
    recs.push({
      id: 'missing-title',
      category: 'onpage',
      title: 'Add a page title tag',
      description: 'This page is missing a <title> tag entirely.',
      whyItMatters:
        'The title tag is one of the strongest on-page ranking signals and is what appears as the clickable headline in search results.',
      howToFix: 'Add a unique, descriptive <title> tag (50-60 characters) to the <head> of the page.',
      impact: 'High',
      difficulty: 'Easy',
    })
  } else if (data.onPage.title.issues.length > 0) {
    recs.push({
      id: 'title-length',
      category: 'onpage',
      title: 'Optimize the title tag length',
      description: data.onPage.title.issues.join('; '),
      whyItMatters:
        'Titles that are too short waste valuable keyword real estate; titles that are too long get truncated in search results.',
      howToFix: 'Rewrite the title to be between 50-60 characters, front-loading your primary keyword.',
      impact: 'High',
      difficulty: 'Easy',
    })
  }

  if (!data.onPage.metaDescription.value) {
    recs.push({
      id: 'missing-meta-description',
      category: 'onpage',
      title: 'Add a meta description',
      description: 'This page is missing a meta description tag.',
      whyItMatters:
        'Meta descriptions act as ad copy in search results and directly influence click-through rate.',
      howToFix: 'Write a compelling 120-160 character meta description that includes your primary keyword and a call to action.',
      impact: 'High',
      difficulty: 'Easy',
    })
  } else if (data.onPage.metaDescription.issues.length > 0) {
    recs.push({
      id: 'meta-description-length',
      category: 'onpage',
      title: 'Optimize the meta description length',
      description: data.onPage.metaDescription.issues.join('; '),
      whyItMatters: 'A poorly sized meta description can be truncated or fail to entice clicks.',
      howToFix: 'Aim for 120-160 characters that summarize the page and include a call to action.',
      impact: 'Medium',
      difficulty: 'Easy',
    })
  }

  if (data.onPage.headings.h1.length === 0) {
    recs.push({
      id: 'missing-h1',
      category: 'onpage',
      title: 'Add an H1 heading',
      description: 'No H1 heading was found on this page.',
      whyItMatters: 'The H1 tells search engines and visitors the primary topic of the page.',
      howToFix: 'Add a single, descriptive H1 heading that includes your primary target keyword.',
      impact: 'High',
      difficulty: 'Easy',
    })
  } else if (data.onPage.headings.h1.length > 1) {
    recs.push({
      id: 'multiple-h1',
      category: 'onpage',
      title: 'Use only one H1 heading',
      description: `Found ${data.onPage.headings.h1.length} H1 headings on this page.`,
      whyItMatters: 'Multiple H1s can dilute topical focus and confuse search engines about the primary subject.',
      howToFix: 'Keep a single H1 for the main page topic and use H2/H3 for supporting sections.',
      impact: 'Medium',
      difficulty: 'Easy',
    })
  }

  if (data.onPage.images.missingAlt > 0) {
    recs.push({
      id: 'images-missing-alt',
      category: 'onpage',
      title: 'Add alt text to images',
      description: `${data.onPage.images.missingAlt} of ${data.onPage.images.total} images are missing alt text.`,
      whyItMatters: 'Alt text helps search engines understand image content and is essential for screen reader accessibility.',
      howToFix: 'Add descriptive, keyword-relevant alt attributes to every meaningful image.',
      impact: 'Medium',
      difficulty: 'Easy',
    })
  }

  if (data.social.issues.length > 0) {
    recs.push({
      id: 'social-tags',
      category: 'onpage',
      title: 'Complete Open Graph and Twitter Card tags',
      description: data.social.issues.join('; '),
      whyItMatters: 'Rich social previews increase click-through rates when your content is shared on social media.',
      howToFix: 'Add og:title, og:description, og:image, og:url, and twitter:card meta tags.',
      impact: 'Medium',
      difficulty: 'Easy',
    })
  }

  if (!data.schema.found) {
    recs.push({
      id: 'no-schema',
      category: 'onpage',
      title: 'Add structured data markup',
      description: 'No schema.org JSON-LD structured data was detected.',
      whyItMatters: 'Structured data helps search engines understand your content and can unlock rich results like star ratings and FAQs.',
      howToFix: 'Add relevant JSON-LD schema (Organization, WebSite, LocalBusiness, or Product) to key pages.',
      impact: 'Medium',
      difficulty: 'Advanced',
    })
  }

  // --- Technical ---
  if (!data.technical.https.enabled) {
    recs.push({
      id: 'no-https',
      category: 'technical',
      title: 'Migrate to HTTPS',
      description: 'The site is not served securely over HTTPS.',
      whyItMatters: 'HTTPS is a confirmed Google ranking factor and is required for user trust and modern browser features.',
      howToFix: 'Install an SSL/TLS certificate and redirect all HTTP traffic to HTTPS.',
      impact: 'High',
      difficulty: 'Medium',
    })
  }

  if (!data.technical.robotsTxt.exists) {
    recs.push({
      id: 'no-robots',
      category: 'technical',
      title: 'Add a robots.txt file',
      description: 'No robots.txt file was found.',
      whyItMatters: 'robots.txt helps guide search engine crawlers and can prevent crawl budget waste on unimportant pages.',
      howToFix: 'Create a robots.txt file at the site root that references your sitemap.',
      impact: 'Low',
      difficulty: 'Easy',
    })
  } else if (data.technical.robotsTxt.blocksGooglebot) {
    recs.push({
      id: 'robots-blocking',
      category: 'technical',
      title: 'Fix robots.txt blocking crawlers',
      description: 'robots.txt appears to disallow all crawlers from the entire site.',
      whyItMatters: 'This can completely prevent your site from being indexed by search engines.',
      howToFix: 'Update robots.txt to only disallow specific paths that should not be indexed.',
      impact: 'High',
      difficulty: 'Easy',
    })
  }

  if (!data.technical.sitemap.exists) {
    recs.push({
      id: 'no-sitemap',
      category: 'technical',
      title: 'Create an XML sitemap',
      description: 'No sitemap.xml or sitemap_index.xml was found.',
      whyItMatters: 'Sitemaps help search engines discover and crawl all important pages on your site efficiently.',
      howToFix: 'Generate an XML sitemap listing all indexable pages and submit it in Google Search Console.',
      impact: 'Medium',
      difficulty: 'Easy',
    })
  }

  if (!data.technical.canonical.value) {
    recs.push({
      id: 'no-canonical',
      category: 'technical',
      title: 'Add a canonical tag',
      description: 'No canonical link tag was found on this page.',
      whyItMatters: 'Canonical tags prevent duplicate content issues by telling search engines which URL version to index.',
      howToFix: 'Add a <link rel="canonical" href="..."> tag pointing to the preferred URL of this page.',
      impact: 'Medium',
      difficulty: 'Easy',
    })
  }

  if (data.technical.redirects.count > 1) {
    recs.push({
      id: 'redirect-chain',
      category: 'technical',
      title: 'Reduce redirect chains',
      description: `This URL redirects ${data.technical.redirects.count} times before reaching its final destination.`,
      whyItMatters: 'Redirect chains slow down page load and waste crawl budget.',
      howToFix: 'Update internal links to point directly to the final URL, removing intermediate redirects.',
      impact: 'Medium',
      difficulty: 'Medium',
    })
  }

  if (data.links.brokenSample.length > 0) {
    recs.push({
      id: 'broken-links',
      category: 'technical',
      title: 'Fix broken links',
      description: `${data.links.brokenSample.length} broken or unreachable link(s) detected in a sample check.`,
      whyItMatters: 'Broken links harm user experience and waste crawl budget, and can signal poor site maintenance to search engines.',
      howToFix: 'Update or remove broken links, and set up 301 redirects for moved pages.',
      impact: 'High',
      difficulty: 'Medium',
    })
  }

  // --- Performance ---
  if (data.performance.performanceScore < 90) {
    recs.push({
      id: 'core-web-vitals',
      category: 'performance',
      title: 'Improve Core Web Vitals',
      description: `Performance score is ${data.performance.performanceScore}/100.`,
      whyItMatters: 'Core Web Vitals are a Google ranking factor and directly affect bounce rate and conversions.',
      howToFix: 'Optimize images, enable caching/compression, minimize JavaScript, and use a CDN to improve load times.',
      impact: data.performance.performanceScore < 50 ? 'High' : 'Medium',
      difficulty: 'Advanced',
    })
  }

  // --- Local ---
  if (!data.local.hasLocalBusinessSchema) {
    recs.push({
      id: 'no-local-business-schema',
      category: 'local',
      title: 'Add LocalBusiness structured data',
      description: 'No LocalBusiness schema markup was detected.',
      whyItMatters: 'LocalBusiness schema helps your business appear in local search results, map packs, and knowledge panels.',
      howToFix: 'Add JSON-LD LocalBusiness schema with your name, address, phone, hours, and geo coordinates.',
      impact: 'High',
      difficulty: 'Advanced',
    })
  }

  if (!data.local.hasNAP) {
    recs.push({
      id: 'no-nap',
      category: 'local',
      title: 'Display consistent NAP information',
      description: 'Name, Address, and Phone number were not clearly detected on the page.',
      whyItMatters: 'Consistent NAP information builds trust with search engines and helps local ranking algorithms verify your business.',
      howToFix: 'Add your business name, full address, and phone number prominently, ideally in the header or footer.',
      impact: 'Medium',
      difficulty: 'Easy',
    })
  }

  if (!data.local.hasMapEmbed) {
    recs.push({
      id: 'no-map-embed',
      category: 'local',
      title: 'Embed a Google Map',
      description: 'No embedded Google Map was found on the page.',
      whyItMatters: 'A map embed reinforces your location signals and improves user experience for local visitors.',
      howToFix: 'Embed a Google Map on your contact or location page using your verified Google Business Profile.',
      impact: 'Low',
      difficulty: 'Easy',
    })
  }

  // --- Accessibility ---
  if (data.accessibility.missingAltCount > 0) {
    recs.push({
      id: 'a11y-alt-text',
      category: 'accessibility',
      title: 'Improve image accessibility',
      description: `${data.accessibility.missingAltCount} image(s) are missing alt text.`,
      whyItMatters: 'Alt text is essential for screen reader users and improves overall accessibility compliance (WCAG).',
      howToFix: 'Add descriptive alt attributes to all meaningful images; use empty alt="" for purely decorative images.',
      impact: 'Medium',
      difficulty: 'Easy',
    })
  }

  if (!data.accessibility.hasLangAttribute) {
    recs.push({
      id: 'a11y-lang',
      category: 'accessibility',
      title: 'Add a language attribute',
      description: 'The <html> element is missing a lang attribute.',
      whyItMatters: 'The lang attribute helps screen readers use correct pronunciation and assists search engines with language targeting.',
      howToFix: 'Add lang="en" (or the appropriate language code) to the <html> tag.',
      impact: 'Low',
      difficulty: 'Easy',
    })
  }

  if (data.accessibility.unlabeledInputsCount > 0) {
    recs.push({
      id: 'a11y-labels',
      category: 'accessibility',
      title: 'Label all form fields',
      description: `${data.accessibility.unlabeledInputsCount} form input(s) are missing associated labels.`,
      whyItMatters: 'Unlabeled form fields are a major barrier for screen reader users and can lead to WCAG compliance failures.',
      howToFix: 'Associate every input with a <label for="..."> element or add an aria-label attribute.',
      impact: 'Medium',
      difficulty: 'Easy',
    })
  }

  // Sort by impact (High > Medium > Low)
  const impactOrder = { High: 0, Medium: 1, Low: 2 }
  return recs.sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact])
}
