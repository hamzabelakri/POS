import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearch } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ArrowLeftIcon, ArrowRightIcon, Loader2Icon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useStartShift } from '@/hooks/use-shift'
import { useAuthStore } from '@/stores/auth-store'
import { AuthCard } from './auth-card'

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
    defaultValues: { start_amount: '' }
  })

  const goToApp = () => {
    if (search.redirect) {
      router.history.push(search.redirect)
    } else {
      router.navigate({ to: '/' })
    }
  }

  // Drop the session so a different user can sign in
  const goBack = () => {
    clearAuth()
    router.navigate({ to: '/sign-in', search: { redirect: search.redirect } })
  }

  const onSubmit = form.handleSubmit(values => {
    mutate({ start_amount: Number(values.start_amount) }, { onSuccess: goToApp })
  })

  return (
    <AuthCard title={t('start_shift')} description={t('start_shift_description')}>
      <Form {...form}>
        <form onSubmit={onSubmit} className='space-y-4'>
          <FormField
            control={form.control}
            name='start_amount'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('starting_amount')}</FormLabel>
                <FormControl>
                  <Input type='number' inputMode='decimal' step='any' min={0} placeholder='0' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex justify-end gap-4'>
            <Button type='button' variant='outline' onClick={goBack} disabled={isPending}>
              <ArrowLeftIcon className='size-4' /> {t('back')}
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending && <Loader2Icon className='size-4 animate-spin' />}
              {t('start_shift')} <ArrowRightIcon className='size-4' />
            </Button>
          </div>
        </form>
      </Form>
    </AuthCard>
  )
}

export default StartShift