import { z } from 'zod'

/** Length of the POS token issued by the backoffice. Set to match your backend. */
export const POS_TOKEN_LENGTH = 5

// Field names match the API payload
export const configSchema = z.object({
  base_url: z.string().trim().url('Enter a valid URL, e.g. http://192.168.1.10:8008'),
  pos_token: z
    .string()
    .trim()
    .length(POS_TOKEN_LENGTH, `The POS token is ${POS_TOKEN_LENGTH} characters long`)
})

export type ConfigValues = z.infer<typeof configSchema>

/** "SD4F9" -> "SD•••" */
export const maskToken = (token: string) => token.slice(0, 2) + '•'.repeat(Math.max(token.length - 2, 0))

/** Shared primary-action styling for the setup flow */
export const brandButtonClass =
  'h-11 bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90 focus-visible:ring-ring/50'