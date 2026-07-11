import { redirect } from 'next/navigation'

export default function Home() {
  redirect(process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://mgt581.github.io/bds-site/')
}
