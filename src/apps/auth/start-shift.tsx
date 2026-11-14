import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearch } from '@tanstack/react-router'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { ArrowRightIcon, InfoIcon, LogOut, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/shadcn-io/spinner'
import { useStartShift } from '@/hooks/use-shift'
import { useAuthStore } from '@/stores/auth-store'
import { AuthCard } from './auth-card'

const DENOMINATOR = 1000

export const StartShift = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const search = useSearch({ from: '/(auth)/start-shift' })
  const clearAuth = useAuthStore(state => state.clearAuth)
  const { mutate, isPending } = useStartShift()

  // Kept as a string in the form (avoids z.coerce typing issues) and converted on submit
  const shiftSchema = z.object({
    start_amount: z
      .string()
      .trim()
      .min(1, t('starting_amount_required'))
      .refine(
        v => Number.isFinite(Number(v)) && Number(v) >= 0,
        t('starting_amount_invalid')
      )
  })

  type ShiftValues = z.infer<typeof shiftSchema>

  const form = useForm<ShiftValues>({
    resolver: zodResolver(shiftSchema),
    defaultValues: { start_amount: '0' }
  })

  // Watch the raw input so the converted amount updates live.
  const rawAmount = useWatch({ control: form.control, name: 'start_amount' })
  const numericAmount = Number(rawAmount)
  const hasValidAmount =
    rawAmount?.trim() !== '' && Number.isFinite(numericAmount) && numericAmount >= 0
  const convertedAmount = hasValidAmount ? numericAmount / DENOMINATOR : 0

  const formattedConverted = new Intl.NumberFormat('en-EG', {
    maximumFractionDigits: 3
  }).format(convertedAmount)

  const goToApp = () => {
    if (search.redirect) {
      router.history.push(search.redirect)
    } else {
      router.navigate({ to: '/' })
    }
  }

  // Logout on this screen: no shift exists yet, so just drop the local session
  // and go back to sign-in (any open shift stays untouched on the server).
  const onLogout = () => {
    clearAuth()
    router.navigate({ to: '/sign-in', search: { redirect: search.redirect } })
  }

  const onSubmit = form.handleSubmit(values => {
    mutate({ start_amount: Number(values.start_amount) }, { onSuccess: goToApp })
  })

  return (
    <AuthCard title={t('start_shift')} description={t('start_shift_description')}>
      <Form {...form}>
        <form onSubmit={onSubmit} className='grid gap-3'>
          <FormField
            control={form.control}
            name='start_amount'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('starting_amount')}</FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupInput
                      type='number'
                      inputMode='decimal'
                      step='any'
                      min={0}
                      placeholder='0'
                      {...field}
                    />
                    <InputGroupAddon>
                      <Wallet />
                    </InputGroupAddon>
                    <InputGroupAddon align='inline-end'>
                      <Badge variant='success'>{formattedConverted} EGP</Badge>
                    </InputGroupAddon>
                  </InputGroup>
                </FormControl>
                <FormDescription className='flex items-start gap-1.5'>
                  <InfoIcon className='mt-0.5 size-4 shrink-0' />
                  <span>{t('start_amount_hint')}</span>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex items-center gap-4'>
            <Button
              type='button'
              variant='outline'
              onClick={onLogout}
              disabled={isPending}
              className='shrink-0'
            >
              <LogOut className='size-4' /> {t('log_out')}
            </Button>
            {isPending ? (
              <Button type='submit' disabled  className='flex-1'>
                <Spinner variant='circle' />
                {t('loading')}
              </Button>
            ) : (
              <Button type='submit'  className='flex-1'>
                {t('start_shift')} <ArrowRightIcon className='size-4' />
              </Button>
            )}
          </div>
        </form>
      </Form>
    </AuthCard>
  )
}

export default StartShift