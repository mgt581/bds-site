import Link from 'next/link'
import { LogoutButton } from './LogoutButton'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-brand-dark">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/admin" className="font-bold text-white">
            BDS <span className="text-brand-gold">Admin</span>
          </Link>
          <LogoutButton />
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  )
}
