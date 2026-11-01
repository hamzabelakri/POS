import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearch } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ArrowRightIcon, Loader2Icon } from 'lucide-react'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useLogin } from '@/hooks/use-auth'
import { useCloseCurrentShift, useFetchCurrentShift } from '@/hooks/use-shift'
import { AlertEnum } from '@/models/alert-model'
import { useAlertStore } from '@/stores/alert-store'
import { useAuthStore } from '@/stores/auth-store'
import { AuthCard } from './auth-card'

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
})

type LoginValues = z.infer<typeof loginSchema>

export const SignIn = () => {
  const router = useRouter()
  const search = useSearch({ from: '/(auth)/sign-in' })
  const clearAuth = useAuthStore(state => state.clearAuth)
  const setShift = useAuthStore(state => state.setShift)
  const { mutate: login, isPending: isLoggingIn } = useLogin()
  const { mutate: fetchCurrentShift, isPending: isFetchingShift } = useFetchCurrentShift()
  const { mutate: closeCurrentShift, isPending: isClosingShift } = useCloseCurrentShift()
  const { showAlert } = useAlertStore()

  const isBusy = isLoggingIn || isFetchingShift || isClosingShift

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
      message: 'A shift is already open',
      description: 'Continue it, or close it and start a new one.',
      confirmText: 'Continue Shift',
      onConfirm: goToApp,
      cancelText: 'Close & Start New',
      onCancel: () => closeCurrentShift(undefined, { onSuccess: goToStartShift })
    })

  const onSubmit = form.handleSubmit(values => {
    login(values, {
      onSuccess: data => {
        // No open shift: go enter the starting amount.
        if (!data.data.has_open_shift) {
          goToStartShift()
          return
        }

        // Open shift: load it (we need its id to close it later), then let the cashier choose.
        fetchCurrentShift(undefined, {
          onSuccess: showExistingShiftAlert,
          onError: error => {
            if (error.response?.status === 404) {
              // Login said a shift was open but the server has none: nothing to resume.
              setShift(null)
              goToStartShift()
            } else {
              // Any other failure: undo the half-finished login so they can simply try again.
              clearAuth()
            }
          }
        })
      }
    })
  })

  return (
    <AuthCard title='Sign in' description='Enter your credentials to continue.'>
      <Form {...form}>
        <form onSubmit={onSubmit} className='space-y-4'>
          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder='Enter your username' autoComplete='username' {...field} />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type='password' placeholder='Enter your password' autoComplete='current-password' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type='submit' className='w-full' disabled={isBusy}>
            {isBusy && <Loader2Icon className='size-4 animate-spin' />}
            Sign In <ArrowRightIcon className='size-4' />
          </Button>
        </form>
      </Form>
    </AuthCard>
  )
}

export default SignIn