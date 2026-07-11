import AuditForm from '@/components/AuditForm';

export default function HomePage() {
  return (
    <>
      {/* Hero section */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium mb-6">
            <span className="text-accent-400">✦</span>
            Free instant analysis — no account needed
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight">
            Find out why your website<br className="hidden sm:block" /> isn&apos;t ranking higher
          </h1>
          <p className="mt-5 text-lg text-white/80 max-w-xl mx-auto leading-relaxed">
            Get a detailed, plain-English SEO audit in seconds. We check your
            page title, meta description, headings, images, and more — then
            tell you exactly what to fix and why.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-white/70">
            <div className="flex items-center gap-1.5">
              <CheckIcon /> Page title analysis
            </div>
            <div className="flex items-center gap-1.5">
              <CheckIcon /> Meta description check
            </div>
            <div className="flex items-center gap-1.5">
              <CheckIcon /> Heading structure
            </div>
            <div className="flex items-center gap-1.5">
              <CheckIcon /> Image alt text
            </div>
            <div className="flex items-center gap-1.5">
              <CheckIcon /> Priority action plan
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <AuditForm />

      {/* How it works */}
      <section className="mx-auto max-w-4xl px-4 pb-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          How it works
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <StepCard
            step="1"
            title="Enter your URL"
            description="Paste the web address of the page you want to audit, along with your name and email."
          />
          <StepCard
            step="2"
            title="We analyse it instantly"
            description="Our engine checks your page title, meta description, headings, images, and more in seconds."
          />
          <StepCard
            step="3"
            title="Get your action plan"
            description="Receive a prioritised list of fixes with plain-English explanations — no jargon."
          />
        </div>
      </section>
    </>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 text-accent-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="card text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-lg">
        {step}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
