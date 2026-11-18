import { useEffect, useMemo, useState } from 'react'
import * as z from 'zod'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { TFunction } from 'i18next'
import {
  ArrowLeftIcon,
  ArrowRight,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  GlobeIcon,
  KeyRoundIcon,
  Loader2Icon,
  LogInIcon,
  WifiIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useConfigurePos } from '@/hooks/use-pos-config'
import { AuroraText } from '@/components/ui/aurora-text'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  POS_TOKEN_LENGTH,
  brandButtonClass,
  maskToken,
  type ConfigValues,
} from './setup-config'

/* ----------------------------- steps & schema ----------------------------- */

// Step ids only. Titles are translated where they are rendered (see index.tsx).
export const STEP_IDS = ['welcome', 'configuration', 'ready'] as const

// Built from `t` so validation messages follow the active language.
const createConfigSchema = (t: TFunction) =>
  z.object({
    base_url: z.string().trim().url(t('backoffice_url_invalid')),
    pos_token: z
      .string()
      .length(
        POS_TOKEN_LENGTH,
        t('pos_token_length_invalid', { length: POS_TOKEN_LENGTH })
      ),
  })

/* ------------------------------ connection hook ------------------------------ */

type PendingAction = 'test' | 'save' | null

// Everything about talking to the backoffice during setup: testing, saving and the state the UI needs.
function useConnectionSetup(
  form: UseFormReturn<ConfigValues>,
  onSaved: (values: ConfigValues) => void
) {
  const configurePos = useConfigurePos()
  const [pending, setPending] = useState<PendingAction>(null)
  const [testPassed, setTestPassed] = useState(false)

  // A successful test only applies to the values that were tested:
  // clear it as soon as the URL or token changes.
  useEffect(() => {
    const subscription = form.watch(() => setTestPassed(false))
    return () => subscription.unsubscribe()
  }, [form])

  const test = async () => {
    const isValid = await form.trigger(['base_url', 'pos_token'])
    if (!isValid) return

    setPending('test')
    setTestPassed(false)
    try {
      const { base_url, pos_token } = form.getValues()
      await configurePos.mutateAsync({
        payload: { base_url, pos_token },
        save: false,
      })
      setTestPassed(true)
    } catch {
      // Error toasts are handled inside useConfigurePos.
      setTestPassed(false)
    } finally {
      setPending(null)
    }
  }

  const save = async (values: ConfigValues) => {
    setPending('save')
    try {
      await configurePos.mutateAsync({
        payload: { base_url: values.base_url, pos_token: values.pos_token },
        save: true,
      })
      onSaved(values)
    } catch {
      // Error toasts are handled inside useConfigurePos.
    } finally {
      setPending(null)
    }
  }

  return {
    testPassed,
    isTesting: pending === 'test',
    isSaving: pending === 'save',
    isPending: pending !== null,
    test,
    save,
  }
}

/* ------------------------------ STEP 0: WELCOME ------------------------------ */

export function WelcomeStep({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation()

  const requirements = [
    {
      icon: GlobeIcon,
      title: t('backoffice_address'),
      text: t('backoffice_address_description'),
    },
    {
      icon: KeyRoundIcon,
      title: t('pos_token'),
      text: t('pos_token_description', { length: POS_TOKEN_LENGTH }),
    },
  ]

  return (
    <section className='space-y-8'>
      <div>
        <AuroraText className='text-3xl font-semibold tracking-tight sm:text-4xl'>
          {' '}
          {t('pos_setup_title')}
        </AuroraText>

        <p className='text-muted-foreground mt-3'>
          {t('pos_setup_requirements')}
        </p>
      </div>

      <ul className='space-y-3'>
        {requirements.map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className='bg-card flex items-start gap-4 rounded-2xl border p-4'
          >
            <span className='bg-primary/15 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl'>
              <Icon className='h-5 w-5' />
            </span>
            <div>
              <p className='text-foreground text-sm font-semibold'>{title}</p>
              <p className='text-muted-foreground text-sm leading-relaxed'>
                {text}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <Button
        size='lg'
        onClick={onNext}
        className={cn(brandButtonClass, 'w-full')}
      >
        {t('start_setup')}
        {/* Flip arrow direction for RTL */}
        <ArrowRight className='mr-2 h-4 w-4 rtl:rotate-180' />
      </Button>
    </section>
  )
}

/* ---------------------------- STEP 1: CONFIGURATION ---------------------------- */

interface ConfigurationStepProps {
  // Values saved earlier, so going back from the last step does not wipe the form.
  defaultValues?: ConfigValues | null
  onBack: () => void
  onSaved: (values: ConfigValues) => void
}

export function ConfigurationStep({
  defaultValues,
  onBack,
  onSaved,
}: ConfigurationStepProps) {
  const { t } = useTranslation()
  const [showToken, setShowToken] = useState(false)

  const schema = useMemo(() => createConfigSchema(t), [t])

  const form = useForm<ConfigValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { base_url: '', pos_token: '' },
  })

  const { testPassed, isTesting, isSaving, isPending, test, save } =
    useConnectionSetup(form, onSaved)

  return (
    <section className='space-y-8'>
      <div>
        <AuroraText className='text-3xl font-semibold tracking-tight sm:text-4xl'>
          {' '}
          {t('backoffice_configuration')}
        </AuroraText>
        <p className='text-muted-foreground mt-3'>{t('configuration_intro')}</p>
      </div>

      <Form {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit(save)}
          className='space-y-6'
        >
          <FormField
            control={form.control}
            name='base_url'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('backoffice_url')}</FormLabel>
                <div className='relative'>
                  <GlobeIcon className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 rtl:right-3 rtl:left-auto' />
                  <FormControl>
                    <Input
                      type='text'
                      inputMode='url'
                      placeholder='http://192.168.1.10:8008'
                      autoComplete='off'
                      className='h-11 pl-9 rtl:pr-9 rtl:pl-3'
                      {...field}
                    />
                  </FormControl>
                </div>
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
                <div className='relative'>
                  <KeyRoundIcon className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 rtl:right-3 rtl:left-auto' />
                  <FormControl>
                    <Input
                      type={showToken ? 'text' : 'password'}
                      placeholder={t('enter_pos_token')}
                      maxLength={POS_TOKEN_LENGTH}
                      autoComplete='off'
                      spellCheck={false}
                      className='h-11 px-9 font-mono tracking-widest'
                      {...field}
                    />
                  </FormControl>
                  <button
                    type='button'
                    onClick={() => setShowToken((v) => !v)}
                    aria-label={showToken ? t('hide_token') : t('show_token')}
                    className='text-muted-foreground hover:text-foreground focus-visible:ring-primary/40 absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md outline-none focus-visible:ring-2 rtl:right-auto rtl:left-2'
                  >
                    {showToken ? (
                      <EyeOffIcon className='size-4' />
                    ) : (
                      <EyeIcon className='size-4' />
                    )}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {testPassed && (
            <Badge
              variant='success'
              role='status'
              className='h-auto w-full justify-start gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium whitespace-normal [&>svg]:size-4'
            >
              <CheckIcon strokeWidth={3} />
              {t('connection_successful_save')}
            </Badge>
          )}

          <div className='border-border flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center'>
            <Button
              type='button'
              variant='ghost'
              onClick={onBack}
              disabled={isPending}
              // Using logical margin utilities (`sm:mr-auto` flipped for RTL)
              className='h-11 sm:mr-auto rtl:sm:mr-0 rtl:sm:ml-auto'
            >
              <ArrowLeftIcon className='size-4 rtl:rotate-180' /> {t('back')}
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={test}
              disabled={isPending}
              className='h-11 font-semibold'
            >
              {isTesting ? (
                <Loader2Icon className='size-4 animate-spin' />
              ) : (
                <WifiIcon className='size-4' />
              )}
              {t('test_connection')}
            </Button>
            <Button
              type='submit'
              disabled={isPending}
              className={cn(brandButtonClass, 'flex-1')}
            >
              {isSaving && <Loader2Icon className='size-4 animate-spin' />}
              {t('validate_and_save')}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  )
}

/* ------------------------------ STEP 2: READY ------------------------------ */

interface ReadyStepProps {
  values: ConfigValues
  onBack: () => void
  onGoToLogin: () => void
}

export function ReadyStep({ values, onBack, onGoToLogin }: ReadyStepProps) {
  const { t } = useTranslation()

  return (
    <section className='space-y-8'>
      <div className='space-y-5 text-center'>
        <span className='mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 ring-8 ring-emerald-500/20 dark:text-emerald-400'>
          <CheckIcon className='size-7' strokeWidth={2.5} />
        </span>

        <AuroraText className='text-3xl font-semibold tracking-tight sm:text-4xl'>
          {t('pos_configured_successfully')}
        </AuroraText>
      </div>

      <dl className='divide-border border-border bg-card divide-y rounded-xl border text-sm'>
        <div className='flex items-center justify-between gap-4 px-4 py-3.5'>
          <dt className='text-muted-foreground'>{t('backoffice_url')}</dt>
          <dd className='truncate font-mono text-xs font-semibold'>
            {values.base_url}
          </dd>
        </div>
        <div className='flex items-center justify-between gap-4 px-4 py-3.5'>
          <dt className='text-muted-foreground'>{t('pos_token')}</dt>
          <dd className='font-mono text-xs font-semibold tracking-widest'>
            {maskToken(values.pos_token)}
          </dd>
        </div>
        <div className='flex items-center justify-between gap-4 px-4 py-3.5'>
          <dt className='text-muted-foreground'>{t('status')}</dt>
          <dd className='flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400'>
            <span className='size-2 rounded-full bg-emerald-500' />{' '}
            {t('connected_and_verified')}
          </dd>
        </div>
      </dl>

      <div className='border-border flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center'>
        <Button
          type='button'
          variant='ghost'
          onClick={onBack}
          className='h-11 sm:mr-auto rtl:sm:mr-0 rtl:sm:ml-auto'
        >
          <ArrowLeftIcon className='size-4 rtl:rotate-180' /> {t('back')}
        </Button>
        <Button
          type='button'
          onClick={onGoToLogin}
          className={cn(brandButtonClass, 'flex-1')}
        >
          <LogInIcon className='size-4' /> {t('go_to_login')}
        </Button>
      </div>
    </section>
  )
}
