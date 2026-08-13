import z from 'zod'

export const forgotPasswordSchema = z.object({
  email: z.email('Vui lòng nhập email hợp lệ'),
})
