import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Free SEO Audit | Bryant Digital Solutions',
  description:
    'Get a free, instant SEO audit for your website. Discover what is holding your site back from ranking higher and converting more visitors.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <a
              href="https://bryantdigitalsolutions.com"
              className="flex items-center gap-2 text-brand-700 hover:text-brand-800"
              aria-label="Bryant Digital Solutions home"
            >
              <span className="text-lg font-bold tracking-tight">
                Bryant Digital Solutions
              </span>
            </a>
            <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-600">
              <a href="https://bryantdigitalsolutions.com/seo.html" className="hover:text-brand-700 transition-colors">
                SEO Services
              </a>
              <a href="https://bryantdigitalsolutions.com/contactus.html" className="hover:text-brand-700 transition-colors">
                Contact
              </a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-16 border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-8 text-center text-sm text-gray-500">
            <p>
              &copy; {new Date().getFullYear()} Bryant Digital Solutions. All rights reserved.
            </p>
            <p className="mt-1">
              <a
                href="https://bryantdigitalsolutions.com/privacy.html"
                className="underline hover:text-brand-700"
              >
                Privacy Policy
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
