import { AuditForm } from '@/components/forms/AuditForm'
import Image from 'next/image'

export default function Home() {
  const services = [
    {
      title: 'Website Design',
      body: 'Fast, conversion-focused websites built around trust, clear offers, and simple enquiry journeys.',
      href: '/legacy/websiteservices.html',
      image: '/legacy/assets/websitedesign.png',
    },
    {
      title: 'SEO Services',
      body: 'Technical SEO, local visibility, on-page improvements, and practical content plans that help customers find you.',
      href: '/legacy/seo.html',
      image: '/legacy/assets/seo.png',
    },
    {
      title: 'Social Media Growth',
      body: 'Content, campaign planning, and profile systems that keep your business visible across the right channels.',
      href: '/legacy/socialmedia.html',
      image: '/legacy/assets/socialmedia.jpg',
    },
  ]

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <section className="relative overflow-hidden bg-[#071527] text-white">
        <Image
          src="/legacy/assets/hero-bds.PNG"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-[#071527]/75" />

        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <a href="/" className="text-base font-extrabold tracking-wide sm:text-lg">
            BRYANT DIGITAL <span className="text-brand-gold">SOLUTIONS</span>
          </a>
          <nav className="hidden items-center gap-6 text-sm font-medium text-white/85 md:flex">
            <a href="#audit" className="hover:text-brand-gold">
              Free Audit
            </a>
            <a href="#services" className="hover:text-brand-gold">
              Services
            </a>
            <a href="/legacy/gallery.html" className="hover:text-brand-gold">
              Gallery
            </a>
            <a href="/legacy/contactus.html" className="hover:text-brand-gold">
              Contact
            </a>
          </nav>
          <a
            href="#audit"
            className="rounded-lg bg-brand-gold px-4 py-2 text-sm font-bold text-brand-dark transition hover:bg-[#bb8f14]"
          >
            Run Audit
          </a>
        </header>

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 pb-14 pt-6 sm:px-6 lg:min-h-[74svh] lg:grid-cols-[1fr_440px] lg:items-center lg:pb-20">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-lg bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-gold">
              Lead generation, SEO, websites and growth systems
            </p>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Turn your website into a working lead machine.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
              Bryant Digital Solutions builds high-converting websites, SEO systems, social media
              campaigns, and automation that help local businesses win more enquiries online.
            </p>
            <div className="mt-7 grid max-w-2xl grid-cols-1 gap-3 text-sm text-white/90 sm:grid-cols-3">
              <div className="rounded-lg border border-white/15 bg-white/10 p-4">
                <strong className="block text-2xl text-white">500+</strong>
                Projects completed
              </div>
              <div className="rounded-lg border border-white/15 bg-white/10 p-4">
                <strong className="block text-2xl text-white">300+</strong>
                Happy clients
              </div>
              <div className="rounded-lg border border-white/15 bg-white/10 p-4">
                <strong className="block text-2xl text-white">6</strong>
                SEO categories checked
              </div>
            </div>
          </div>

          <div id="audit" className="scroll-mt-8">
            <AuditForm />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-3">
          <div>
            <p className="text-sm font-bold uppercase text-brand-gold">Instant website audit</p>
            <h2 className="mt-2 text-2xl font-extrabold text-brand-dark">
              See what is holding your site back.
            </h2>
          </div>
          <p className="text-sm leading-6 text-slate-600 lg:col-span-2">
            The audit tool checks technical SEO, on-page content, performance, local SEO,
            accessibility, links, schema, and social signals. Each lead is saved into the admin
            dashboard with a report page and PDF download ready for follow-up.
          </p>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase text-brand-gold">Digital services</p>
            <h2 className="mt-2 text-3xl font-extrabold text-brand-dark">
              Built for traffic, trust, and enquiries.
            </h2>
          </div>
          <a href="/legacy/allourservices.html" className="text-sm font-bold text-brand-dark hover:underline">
            View all services
          </a>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {services.map((service) => (
            <a
              key={service.title}
              href={service.href}
              className="group overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <Image
                  src={service.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-extrabold text-brand-dark">{service.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{service.body}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="bg-brand-dark text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase text-brand-gold">Full growth setup</p>
            <h2 className="mt-2 text-3xl font-extrabold">From audit to action plan.</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {['Find technical blockers', 'Prioritise quick wins', 'Convert reports into booked calls'].map(
              (item) => (
                <div key={item} className="rounded-lg border border-white/15 bg-white/10 p-4 text-sm">
                  {item}
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
