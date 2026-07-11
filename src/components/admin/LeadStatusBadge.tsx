import { Badge } from '@/components/ui/Badge'

type Status = 'NEW' | 'CONTACTED' | 'WON' | 'LOST'

const colorMap: Record<Status, 'blue' | 'amber' | 'green' | 'red'> = {
  NEW: 'blue',
  CONTACTED: 'amber',
  WON: 'green',
  LOST: 'red',
}

export function LeadStatusBadge({ status }: { status: Status }) {
  return <Badge color={colorMap[status]}>{status}</Badge>
}
