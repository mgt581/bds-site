import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Free SEO Audit | Bryant Digital Solutions',
  description:
    'Get a free, instant SEO audit of your website from Bryant Digital Solutions. Discover technical, on-page, performance, local SEO, and accessibility issues holding your rankings back.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
