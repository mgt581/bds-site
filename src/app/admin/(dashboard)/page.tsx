import { LeadsTable } from '@/components/admin/LeadsTable'

export const dynamic = 'force-dynamic'

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Leads Dashboard</h1>
        <p className="text-sm text-gray-500">
          Manage and follow up with SEO audit leads generated from the website.
        </p>
      </div>
      <LeadsTable />
    </div>
  )
}
