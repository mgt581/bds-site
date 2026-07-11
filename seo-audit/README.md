# Bryant Digital Solutions — SEO Audit Tool

A **production-ready SEO audit tool** built with Next.js 15 as a subapp of the Bryant Digital Solutions repository. This is **Step 1** of a multi-iteration build. See the [Roadmap](#roadmap) section for planned next steps.

## What it does (Step 1)

- Accepts a URL, business name, and email address
- Fetches and parses the target page
- Runs SEO checks for:
  - Page title (presence, length, generic detection)
  - Meta description (presence, length)
  - Heading structure (H1/H2 presence and count)
  - Image alt text (missing or empty alt attributes)
- Calculates an overall score out of 100
- Groups findings into **high / medium / low priority**
- Provides plain-English explanations for every finding
- Persists results locally (file-based store — see [Persistence](#persistence))

## Getting started

### Prerequisites

- Node.js 18+ 
- npm 9+

### Install and run

```bash
cd seo-audit
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
npm run build
npm start
```

## Project structure

```text
seo-audit/
├── src/
│   ├── app/
│   │   ├── api/audit/route.ts    # POST /api/audit endpoint
│   │   ├── layout.tsx            # App shell (header, footer)
│   │   ├── page.tsx              # Landing page
│   │   └── globals.css           # Tailwind + global styles
│   ├── components/
│   │   ├── AuditForm.tsx         # URL / name / email form + state
│   │   └── AuditResults.tsx      # Score, grouped findings, CTA
│   ├── lib/
│   │   ├── audit/
│   │   │   ├── index.ts          # Audit orchestrator
│   │   │   ├── fetcher.ts        # URL fetch + HTML parse (cheerio)
│   │   │   └── checks/           # One file per check category
│   │   │       ├── title.ts
│   │   │       ├── meta-description.ts
│   │   │       ├── headings.ts
│   │   │       └── images.ts
│   │   ├── scoring/index.ts      # Score calculation (100 − penalties)
│   │   ├── prioritization/       # Grouping helpers
│   │   └── persistence/
│   │       ├── index.ts          # AuditStore interface + factory
│   │       └── file-store.ts     # File-based implementation (swappable)
│   └── types/audit.ts            # Shared TypeScript types
└── data/
    └── audits/                   # JSON audit results (gitignored)
```

## Persistence

Audit results are currently saved as JSON files in `data/audits/`. This requires no external service and works immediately out of the box.

To swap in a real database, implement the `AuditStore` interface from `src/lib/persistence/index.ts` and update `createStore()` to return your new class. The API route and audit engine will not need to change.

## Environment variables

No environment variables are required for Step 1. Future iterations will introduce:

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Email delivery (Step 2 — Resend integration) |
| `DATABASE_URL` | Production database (Step 3 — DB persistence) |
| `OPENAI_API_KEY` | AI-enhanced explanations (Step 5) |

## Roadmap

This is a step-by-step build. Planned follow-up iterations:

1. **PDF generation** — Generate a branded PDF report using a library such as `@react-pdf/renderer` or Puppeteer.
2. **Resend email delivery** — Send the audit results to the user's email address using [Resend](https://resend.com).
3. **Real database persistence** — Replace `FileAuditStore` with a PostgreSQL / Supabase / PlanetScale store.
4. **Broken-link and Core Web Vitals analysis** — Crawl linked pages and integrate Lighthouse / CrUX data.
5. **AI-enhanced recommendations** — Use OpenAI to generate richer, business-specific fix suggestions.

## Relationship to the main site

The main Bryant Digital Solutions marketing site is a plain-HTML static site in the repo root. This Next.js app lives entirely in the `seo-audit/` subdirectory and does not affect the static site in any way. Both can be deployed independently.
