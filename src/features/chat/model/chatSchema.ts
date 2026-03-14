import { z } from 'zod'

export const contactFormSchema = z.object({
  content: z
    .string()
    .min(1, 'Vui lòng nhập nội dung tin nhắn')
    .max(500, 'Tin nhắn không được vượt quá 500 ký tự'),
})

export type ContactFormValues = z.infer<typeof contactFormSchema>
