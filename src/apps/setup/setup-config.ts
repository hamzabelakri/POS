import { z } from 'zod'
import type { TFunction } from 'i18next'

/** Length of the POS token issued by the backoffice. Set to match your backend. */
export const POS_TOKEN_LENGTH = 5

/** Build the config schema with translated validation messages. */
export const createConfigSchema = (t: TFunction) =>
  z.object({
    base_url: z.string().trim().url(t('enter_valid_url_example')),
    pos_token: z
      .string()
      .trim()
      .length(
        POS_TOKEN_LENGTH,
        t('token_length_hint', { length: POS_TOKEN_LENGTH })
      ),
  })

export type ConfigValues = z.infer<ReturnType<typeof createConfigSchema>>

/** "SD4F9" -> "SD•••" */
export const maskToken = (token: string) =>
  token.slice(0, 2) + '•'.repeat(Math.max(token.length - 2, 0))

/** Shared primary-action styling for the setup flow */
export const brandButtonClass =
  'h-11 bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90 focus-visible:ring-ring/50'