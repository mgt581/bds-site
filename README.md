# Bryant Digital Solutions — SEO Audit Platform

Move site here from IONOS when done; set domain to bryantdigitalsolutions.com.

A production-ready Next.js 14 (App Router) application that runs automated SEO audits,
generates AI-assisted reports (HTML + PDF), emails results to leads, and gives the BDS
team an admin dashboard to manage those leads.

The original static marketing site is preserved under [`public/legacy/`](./public/legacy)
and is still reachable at `/legacy/*` (e.g. `/legacy/index.html`).

## Tech Stack

- **Next.js 14** (App Router, TypeScript, `src/` directory)
- **Tailwind CSS** for styling
- **Prisma** + **PostgreSQL** for persistence
- **Resend** for transactional email
- **cheerio** + **node-fetch** for page fetching/parsing
- **OpenAI** for AI-generated executive summaries (optional, falls back to a rule-based summary)
- **@react-pdf/renderer** for PDF report generation
- **zod** + **react-hook-form** for validation

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

At minimum you need a `DATABASE_URL` pointing at a PostgreSQL database and an
`ADMIN_PASSWORD` to access `/admin`. All other integrations (OpenAI, Resend,
PageSpeed) are optional and degrade gracefully when not configured:

| Variable | Required | Behavior when missing |
| --- | --- | --- |
| `DATABASE_URL` | Yes | App cannot start without a database |
| `ADMIN_PASSWORD` | Yes (for `/admin`) | Admin login is disabled |
| `NEXTAUTH_SECRET` | Recommended | Falls back to `ADMIN_PASSWORD`/an insecure dev secret |
| `RESEND_API_KEY` | No | Emails are skipped and logged to the console instead |
| `OPENAI_API_KEY` | No | A rule-based executive summary is generated instead |
| `PAGESPEED_API_KEY` | No | Performance is estimated from page weight/response time |

### 3. Set up the database

```bash
npm run db:push     # sync schema for local development
# or
npm run db:migrate   # create a versioned migration
```

### 4. Run the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the audit tool, and
[http://localhost:3000/admin](http://localhost:3000/admin) for the lead dashboard
(protected by `ADMIN_PASSWORD`).

## Project Structure

```
src/
  app/                 # Next.js App Router pages & API routes
    page.tsx           # Homepage with the audit request form
    audit/[id]/        # Public audit report page
    admin/             # Password-protected lead dashboard
    api/                # Route handlers (audit, leads, reports, admin auth)
  lib/
    audit/             # Fetching + individual SEO checks (on-page, technical, etc.)
    scoring/           # Weighted score calculation
    recommendations/   # Rule-based recommendation generator
    ai/                # OpenAI (or rule-based fallback) executive summary
    email/             # Resend email sending + templates
    pdf/                # @react-pdf/renderer PDF report generation
    report/             # Standalone HTML report generation
    db/                 # Prisma client singleton
    auth/               # Admin session cookie signing/verification
    rate-limit/         # In-memory IP rate limiter for /api/audit
    validations/        # zod schemas
  components/
    ui/                 # Design system primitives
    forms/              # AuditForm
    report/             # Audit results display
    admin/               # Leads table, filters, status badges
prisma/
  schema.prisma          # Lead + AuditReport models
public/legacy/            # Preserved static HTML marketing site
```

## How an Audit Works

1. A visitor submits the form on the homepage (`AuditForm`).
2. `POST /api/audit` validates the input, applies IP-based rate limiting
   (5 requests/hour), and runs the audit engine (`src/lib/audit`).
3. The engine fetches the target page, then runs on-page, technical, link,
   performance, social, schema, local SEO, and accessibility checks.
4. Scores are calculated (`src/lib/scoring`) and recommendations generated
   (`src/lib/recommendations`), followed by an AI (or rule-based) executive
   summary (`src/lib/ai`).
5. A `Lead` and `AuditReport` are persisted via Prisma, an HTML report is
   generated and stored, and customer/admin notification emails are sent via
   Resend (skipped gracefully if `RESEND_API_KEY` is not set).
6. The visitor is redirected to `/audit/[id]` to view their results, with a
   PDF download available at `/api/reports/[id]/pdf`.

## Admin Dashboard

Visit `/admin/login` and sign in with `ADMIN_PASSWORD`. From `/admin` you can:

- Search/filter leads by name, email, website, status, or score range
- Update a lead's status (New / Contacted / Won / Lost)
- View a lead's full audit history, view/download reports, and resend the
  customer notification email

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push the Prisma schema to the database (no migration history) |
| `npm run db:migrate` | Create/apply a Prisma migration |
| `npm run db:studio` | Open Prisma Studio |

## Deployment Notes

- Requires a PostgreSQL database reachable from the deployment environment.
- Set `NEXT_PUBLIC_APP_URL` to the deployed domain so email links resolve
  correctly.
- The legacy static site continues to work unmodified from `public/legacy/`.
