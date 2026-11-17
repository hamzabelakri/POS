import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearch } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ArrowRightIcon, EyeIcon, EyeOffIcon, Loader2Icon, LockIcon, UserIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useLogin } from '@/hooks/use-auth'
import { useCloseCurrentShift, useFetchCurrentShift } from '@/hooks/use-shift'
import { AlertEnum } from '@/models/alert-model'
import { useAlertStore } from '@/stores/alert-store'
import { useAuthStore } from '@/stores/auth-store'
import { AuthCard } from './auth-card'

export const SignIn = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const search = useSearch({ from: '/(auth)/sign-in' })
  const clearAuth = useAuthStore(state => state.clearAuth)
  const setShift = useAuthStore(state => state.setShift)
  const { mutate: login, isPending: isLoggingIn } = useLogin()
  const { mutate: fetchCurrentShift, isPending: isFetchingShift } = useFetchCurrentShift()
  const { mutate: closeCurrentShift, isPending: isClosingShift } = useCloseCurrentShift()
  const { showAlert } = useAlertStore()
  const [showPassword, setShowPassword] = useState(false)

  const isBusy = isLoggingIn || isFetchingShift || isClosingShift

  // Schema built inside the component so validation messages are translated.
  const loginSchema = z.object({
    username: z.string().trim().min(1, t('username_required')),
    password: z.string().min(1, t('password_required'))
  })

  type LoginValues = z.infer<typeof loginSchema>

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' }
  })

  const goToApp = () => {
    if (search.redirect) {
      router.history.push(search.redirect)
    } else {
      router.navigate({ to: '/' })
    }
  }

  const goToStartShift = () => router.navigate({ to: '/start-shift', search: { redirect: search.redirect } })

  // A shift is already open: resume it, or close it and start a new one.
  const showExistingShiftAlert = () =>
    showAlert({
      type: AlertEnum.WARNING,
      message: t('shift_already_open'),
      description: t('shift_already_open_description'),
      confirmText: t('continue_shift'),
      onConfirm: goToApp,
      cancelText: t('close_and_start_new'),
      onCancel: () => closeCurrentShift(undefined, { onSuccess: goToStartShift })
    })

  const onSubmit = form.handleSubmit(values => {
    login(values, {
      onSuccess: data => {
        if (!data.data.has_open_shift) {
          goToStartShift()
          return
        }
        fetchCurrentShift(undefined, {
          onSuccess: showExistingShiftAlert,
          onError: error => {
            if (error.response?.status === 404) {
              setShift(null)
              goToStartShift()
            } else {
              clearAuth()
            }
          }
        })
      }
    })
  })

  return (
    <AuthCard title={t('sign_in')} description={t('sign_in_description')}>
      <Form {...form}>
        <form onSubmit={onSubmit} className='space-y-5'>
          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('username')}</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <UserIcon className='text-muted-foreground pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2' />
                    <Input
                      className='h-11 ps-10'
                      placeholder={t('enter_username')}
                      autoComplete='username'
                      autoFocus
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('password')}</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <LockIcon className='text-muted-foreground pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2' />
                    <Input
                      className='h-11 px-10'
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('enter_password')}
                      autoComplete='current-password'
                      {...field}
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(v => !v)}
                      aria-label={showPassword ? t('hide_password') : t('show_password')}
                      className='text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute end-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md focus-visible:ring-2 focus-visible:outline-none'
                    >
                      {showPassword ? <EyeOffIcon className='size-4' /> : <EyeIcon className='size-4' />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type='submit' size='lg' className='h-11 w-full' disabled={isBusy}>
            {isBusy ? <Loader2Icon className='size-4 animate-spin' /> : null}
            {t('sign_in')}
            {!isBusy && <ArrowRightIcon className='size-4 rtl:rotate-180' />}
          </Button>
        </form>
      </Form>
    </AuthCard>
  )
}

export default SignIn