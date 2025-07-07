import { config } from 'dotenv'
import { z } from 'zod/v4'

config()

const envSchema = z.object({
  THEME: z.literal(['green', 'red', 'rainbow']).default('green').catch('green'),
  MIN_SPEED: z.coerce.number().int().positive().default(2).catch(2),
  MAX_SPEED: z.coerce.number().int().positive().default(10).catch(10),
  MIN_LENGTH: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .catch(50)
    .transform((v) => v / 100),
  MAX_LENGTH: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(100)
    .catch(100)
    .transform((v) => v / 100),
})

export const env = envSchema.parse(process.env)
