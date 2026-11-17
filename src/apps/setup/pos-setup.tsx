import { useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ArrowRightIcon, CheckCircle2Icon, KeyRoundIcon, Loader2Icon, ServerIcon, WifiIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useConfigurePos } from '@/hooks/use-pos-config'
import { AuthCard } from './auth-card'

// Step 1: Welcome. Tell the installer what to have ready.
const WelcomeStep = ({ onNext }: { onNext: () => void }) => {
  const { t } = useTranslation()
  const items = [
    { icon: ServerIcon, label: t('pos_setup_need_url') },
    { icon: KeyRoundIcon, label: t('pos_setup_need_token') },
    { icon: WifiIcon, label: t('pos_setup_need_network') }
  ]
  return (
    <div className='space-y-8'>
      <ul className='divide-y rounded-xl border'>
        {items.map(({ icon: Icon, label }) => (
          <li key={label} className='flex items-center gap-4 p-4'>
            <span className='bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg'>
              <Icon className='size-4' />
            </span>
            <span className='text-sm'>{label}</span>
          </li>
        ))}
      </ul>
      <Button type='button' className='h-11 w-full sm:w-auto sm:px-8' onClick={onNext}>
        {t('next')} <ArrowRightIcon className='size-4 rtl:rotate-180' />
      </Button>
    </div>
  )
}

// Step 2: Configuration form
const ConfigurationStep = ({ onSaved }: { onSaved: () => void }) => {
  const { t } = useTranslation()
  const [testPassed, setTestPassed] = useState(false)
  const { mutate, isPending, variables } = useConfigurePos()

  const isTesting = isPending && variables?.save === false
  const isSaving = isPending && variables?.save === true

  const configSchema = z.object({
    base_url: z.string().trim().url(t('enter_valid_url_example')),
    pos_token: z.string().trim().min(1, t('pos_token_required'))
  })

  type ConfigValues = z.infer<typeof configSchema>

  const form = useForm<ConfigValues>({
    resolver: zodResolver(configSchema),
    defaultValues: { base_url: '', pos_token: '' }
  })

  // Editing a field invalidates the previous test result
  useEffect(() => {
    const subscription = form.watch(() => setTestPassed(false))
    return () => subscription.unsubscribe()
  }, [form])

  const onTest = form.handleSubmit(values => {
    mutate({ payload: values, save: false }, { onSuccess: () => setTestPassed(true) })
  })

  const onSave = form.handleSubmit(values => {
    mutate({ payload: values, save: true }, { onSuccess: onSaved })
  })

  return (
    <Form {...form}>
      <form onSubmit={onSave} className='space-y-5'>
        <FormField
          control={form.control}
          name='base_url'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('backoffice_url')}</FormLabel>
              <FormControl>
                <Input
                  className='h-11'
                  type='url'
                  dir='ltr'
                  placeholder='http://192.168.1.10:8008'
                  autoFocus
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='pos_token'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('pos_token')}</FormLabel>
              <FormControl>
                <Input
                  className='h-11 font-mono'
                  dir='ltr'
                  placeholder={t('enter_pos_token')}
                  autoComplete='off'
                  spellCheck={false}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {testPassed && (
          <div
            role='status'
            className='flex items-center gap-2 rounded-lg border border-green-600/20 bg-green-600/10 px-3 py-2.5 text-sm text-green-700 dark:border-green-400/20 dark:bg-green-400/10 dark:text-green-400'
          >
            <CheckCircle2Icon className='size-4 shrink-0' />
            {t('connection_successful')}
          </div>
        )}

        <div className='flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end'>
          <Button type='button' variant='outline' className='h-11' onClick={onTest} disabled={isPending}>
            {isTesting && <Loader2Icon className='size-4 animate-spin' />}
            {t('test_connection')}
          </Button>
          <Button type='submit' className='h-11 sm:px-8' disabled={isPending}>
            {isSaving && <Loader2Icon className='size-4 animate-spin' />}
            {t('validate_and_save')}
          </Button>
        </div>
      </form>
    </Form>
  )
}

// Step 3: Confirmation
const ConfirmationStep = ({ onGoToLogin }: { onGoToLogin: () => void }) => {
  const { t } = useTranslation()
  return (
    <div className='space-y-8'>
      <div className='flex size-16 items-center justify-center rounded-full bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400'>
        <CheckCircle2Icon className='size-8' />
      </div>
      <Button type='button' className='h-11 w-full sm:w-auto sm:px-8' onClick={onGoToLogin}>
        {t('go_to_login')} <ArrowRightIcon className='size-4 rtl:rotate-180' />
      </Button>
    </div>
  )
}

const PosSetup = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const [current, setCurrent] = useState('welcome')

  const steps = [
    { id: 'welcome', title: t('welcome') },
    { id: 'configuration', title: t('configuration') },
    { id: 'confirmation', title: t('confirmation') }
  ]

  const currentIndex = steps.findIndex(s => s.id === current)
  const goNext = () => setCurrent(steps[Math.min(currentIndex + 1, steps.length - 1)].id)

  // Each step owns its heading, so the form panel always says what to do now.
  const heading = {
    welcome: { title: t('pos_setup_welcome_title'), description: t('pos_setup_welcome_description') },
    configuration: { title: t('pos_setup_config_title'), description: t('pos_setup_config_description') },
    confirmation: { title: t('pos_configured_successfully'), description: t('pos_configured_description') }
  }[current]!

  return (
    <AuthCard title={heading.title} description={heading.description} steps={steps} currentStep={current}>
      {current === 'welcome' && <WelcomeStep onNext={goNext} />}
      {current === 'configuration' && <ConfigurationStep onSaved={goNext} />}
      {current === 'confirmation' && <ConfirmationStep onGoToLogin={() => router.navigate({ to: '/sign-in' })} />}
    </AuthCard>
  )
}

export default PosSetup