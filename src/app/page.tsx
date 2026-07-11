import { AuditForm } from '@/components/forms/AuditForm'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-dark to-[#122a45]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <div className="text-lg font-extrabold tracking-wide text-white">
          BRYANT DIGITAL <span className="text-brand-gold">SOLUTIONS</span>
        </div>
        <a
          href="https://bryantdigitalsolutions.com/contactus.html"
          className="text-sm font-medium text-white hover:text-brand-gold"
        >
          Contact Us
        </a>
      </header>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 pb-20 pt-6 lg:grid-cols-2 lg:items-center">
        <div className="text-white">
          <p className="mb-3 inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-semibold tracking-wide text-brand-gold">
            100% FREE &middot; NO OBLIGATION
          </p>
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            Is Your Website Losing You Customers?
          </h1>
          <p className="mt-4 max-w-lg text-base text-gray-200 sm:text-lg">
            Get an instant, comprehensive SEO audit covering technical health, on-page SEO,
            performance, local search visibility, and accessibility &mdash; with a clear action
            plan to fix what&apos;s holding you back.
          </p>
          <ul className="mt-6 flex flex-col gap-2 text-sm text-gray-200">
            <li>&#10003; Full report delivered to your inbox in under a minute</li>
            <li>&#10003; AI-powered summary and prioritized action plan</li>
            <li>&#10003; Free downloadable PDF report</li>
          </ul>
        </div>

        <div>
          <AuditForm />
        </div>
      </section>
    </main>
  )
}
