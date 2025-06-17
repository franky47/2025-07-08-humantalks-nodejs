import { z } from 'zod/v4'

const envSchema = z.object({
  RAINBOW: z
    .string()
    .transform((v) => ['1', 'true'].includes(v.toLowerCase()))
    .default(false),
  MIN_SPEED: z.coerce.number().int().positive().default(2),
  MAX_SPEED: z.coerce.number().int().positive().default(10),
  MIN_LENGTH: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .transform((v) => v / 100),
  MAX_LENGTH: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(100)
    .transform((v) => v / 100),
})

export const env = envSchema.parse(process.env)
