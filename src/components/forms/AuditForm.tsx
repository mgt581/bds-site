'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const formSchema = z.object({
  website: z.string().trim().min(3, 'Please enter your website URL'),
  businessName: z.string().trim().min(2, 'Please enter your business name'),
  name: z.string().trim().min(2, 'Please enter your full name'),
  email: z.string().trim().email('Please enter a valid email address'),
  phone: z.string().trim().optional(),
})

type FormValues = z.infer<typeof formSchema>

const STEPS = [
  'Fetching your page...',
  'Analyzing content...',
  'Calculating scores...',
  'Generating your report...',
]

export function AuditForm() {
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) })

  async function onSubmit(values: FormValues) {
    setSubmitError(null)
    setIsSubmitting(true)
    setStepIndex(0)

    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev))
    }, 2200)

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()

      if (!res.ok) {
        setSubmitError(data.error || 'Something went wrong. Please try again.')
        setIsSubmitting(false)
        clearInterval(interval)
        return
      }

      router.push(`/audit/${data.reportId}`)
    } catch {
      setSubmitError('Network error - please check your connection and try again.')
      setIsSubmitting(false)
      clearInterval(interval)
    }
  }

  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-2xl bg-white p-10 text-center shadow-lg">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-dark border-t-transparent" />
        <div>
          <p className="text-lg font-semibold text-brand-dark">{STEPS[stepIndex]}</p>
          <p className="mt-1 text-sm text-gray-500">This usually takes 20-40 seconds.</p>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-lg sm:p-8"
    >
      <div>
        <h2 className="text-xl font-bold text-brand-dark">Get Your Free SEO Audit</h2>
        <p className="mt-1 text-sm text-gray-500">
          Enter your website below and we&apos;ll analyze it across 6 key SEO categories.
        </p>
      </div>

      <Input
        label="Website URL"
        placeholder="https://yourbusiness.com"
        {...register('website')}
        error={errors.website?.message}
      />
      <Input
        label="Business Name"
        placeholder="Your Business Name"
        {...register('businessName')}
        error={errors.businessName?.message}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Your Name"
          placeholder="Jane Doe"
          {...register('name')}
          error={errors.name?.message}
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          error={errors.email?.message}
        />
      </div>
      <Input
        label="Phone Number (optional)"
        placeholder="(555) 555-5555"
        {...register('phone')}
        error={errors.phone?.message}
      />

      {submitError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>
      )}

      <Button type="submit" className="mt-2 w-full justify-center">
        Run My Free Audit
      </Button>
      <p className="text-center text-xs text-gray-400">
        No spam. We&apos;ll email your results and may follow up about our services.
      </p>
    </form>
  )
}
