import { z } from 'zod'

export const auditRequestSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name').max(100),
  email: z.string().trim().email('Please enter a valid email address').max(200),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined)),
  website: z
    .string()
    .trim()
    .min(3, 'Please enter your website URL')
    .max(500)
    .transform((val) => {
      if (!/^https?:\/\//i.test(val)) {
        return `https://${val}`
      }
      return val
    })
    .refine(
      (val) => {
        try {
          const u = new URL(val)
          return !!u.hostname && u.hostname.includes('.')
        } catch {
          return false
        }
      },
      { message: 'Please enter a valid website URL' }
    ),
  businessName: z.string().trim().min(2, 'Please enter your business name').max(200),
})

export type AuditRequest = z.infer<typeof auditRequestSchema>

export const leadUpdateSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'WON', 'LOST']).optional(),
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().max(30).optional(),
})

export type LeadUpdate = z.infer<typeof leadUpdateSchema>
