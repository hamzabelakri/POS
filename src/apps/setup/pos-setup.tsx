/**
 * OPTION B: premium redesign built from the original 3-step flow
 * (Welcome → Configuration → Confirmation). Split layout: brand panel with a
 * vertical stepper on the left, focused task on the right.
 *
 * To use: swap the import of `pos-setup` for `pos-setup.premium` in your route.
 */
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  GlobeIcon,
  KeyRoundIcon,
  Loader2Icon,
  LogInIcon,
  WifiIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConfigurePos } from '@/hooks/use-pos-config'
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
  createConfigSchema,
  maskToken,
  type ConfigValues,
} from './setup-config'
import { SetupBrand } from './setup-shell'
import { SetupStep, SetupStepper } from './setup-stepper'
import { Badge } from '@/components/ui/badge'
import { LanguageSwitch } from '@/components/language-switch'
import { ThemeSwitch } from '@/components/theme-switch'

const PANEL = 'bg-[oklch(0.24_0.07_263)]'

const Heading = ({
  title,
  description,
}: {
  title: string
  description?: string
}) => (
  <div className='space-y-2'>
    <h2 className='text-foreground text-2xl font-semibold tracking-tight'>
      {title}
    </h2>
    {description && (
      <p className='text-muted-foreground text-[15px] leading-relaxed'>
        {description}
      </p>
    )}
  </div>
)

// ─── Step 1 ─────────────────────────────────────────────────────────────────
const WelcomeStep = ({ onNext }: { onNext: () => void }) => {
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
    <div className='space-y-8'>
      <Heading
        title={t('pos_setup_title')}
        description={t('pos_setup_requirements')}
      />
      <ul className='divide-border border-border divide-y rounded-xl border'>
        {requirements.map(({ icon: Icon, title, text }) => (
          <li key={title} className='flex gap-4 p-4'>
            <span className='bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg'>
              <Icon className='size-5' />
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
      <div className='space-y-3'>
        <Button
          type='button'
          onClick={onNext}
          className={cn(brandButtonClass, 'w-full')}
        >
          {t('start_setup')} <ArrowRightIcon className='size-4' />
        </Button>
      </div>
    </div>
  )
}

// ─── Step 2 ─────────────────────────────────────────────────────────────────
type ConfigStepProps = {
  form: ReturnType<typeof useForm<ConfigValues>>
  testPassed: boolean
  isTesting: boolean
  isSaving: boolean
  isPending: boolean
  onBack: () => void
  onTest: () => void
  onSave: () => void
}

const ConfigurationStep = ({
  form,
  testPassed,
  isTesting,
  isSaving,
  isPending,
  onBack,
  onTest,
  onSave,
}: ConfigStepProps) => {
  const { t } = useTranslation()
  const [showToken, setShowToken] = useState(false)

  return (
    <div className='space-y-8'>
      <Heading
        title={t('backoffice_configuration')}
        description={t('configuration_intro')}
      />

      <Form {...form}>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            onSave()
          }}
          className='space-y-6'
        >
          <FormField
            control={form.control}
            name='base_url'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('backoffice_url')}</FormLabel>
                <div className='relative'>
                  <GlobeIcon className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
                  <FormControl>
                    <Input
                      type='text'
                      inputMode='url'
                      placeholder='http://192.168.1.10:8008'
                      autoComplete='off'
                      className='h-11 pl-9'
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
                  <KeyRoundIcon className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
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
                    className='text-muted-foreground hover:text-foreground focus-visible:ring-primary/40 absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md outline-none focus-visible:ring-2'
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
              className='h-auto w-full justify-start gap-2 whitespace-normal rounded-lg px-3.5 py-2.5 text-sm font-medium [&>svg]:size-4'
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
              className='h-11 sm:mr-auto'
            >
              <ArrowLeftIcon className='size-4' /> {t('back')}
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={onTest}
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
              className={brandButtonClass}
            >
              {isSaving && <Loader2Icon className='size-4 animate-spin' />}
              {t('validate_and_save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

// ─── Step 3 ─────────────────────────────────────────────────────────────────
const ConfirmationStep = ({
  values,
  onGoToLogin,
}: {
  values: ConfigValues
  onGoToLogin: () => void
}) => {
  const { t } = useTranslation()

  return (
    <div className='space-y-8'>
      <div className='space-y-5 text-center'>
        <span className='mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 ring-8 ring-emerald-500/20 dark:text-emerald-400'>
          <CheckIcon className='size-7' strokeWidth={2.5} />
        </span>
        <Heading title={t('pos_configured_successfully')} />
      </div>

      <dl className='divide-border border-border divide-y rounded-xl border text-sm'>
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

      <Button
        type='button'
        onClick={onGoToLogin}
        className={cn(brandButtonClass, 'w-full')}
      >
        <LogInIcon className='size-4' /> {t('go_to_login')}
      </Button>
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────
const PosSetup = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const [step, setStep] = useState<string>('welcome')
  const [testPassed, setTestPassed] = useState(false)
  const [saved, setSaved] = useState<ConfigValues | null>(null)
  const { mutate, isPending, variables } = useConfigurePos()

  const isTesting = isPending && variables?.save === false
  const isSaving = isPending && variables?.save === true

  // Rebuild schema when language changes so Zod messages translate
  const schema = useMemo(() => createConfigSchema(t), [t])

  const form = useForm<ConfigValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { base_url: '', pos_token: '' },
  })

  // Editing a field invalidates the previous test result
  useEffect(() => {
    const subscription = form.watch((_, info) => {
      if (info.type === 'change') setTestPassed(false)
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Translated step labels — ids stay untranslated (internal state keys)
  const steps: SetupStep[] = useMemo(
    () => [
      { id: 'welcome', title: t('welcome') },
      { id: 'configuration', title: t('connection') },
      { id: 'confirmation', title: t('ready') },
    ],
    [t]
  )

  // POST /pos/config?save=false
  const onTest = form.handleSubmit((values) => {
    mutate(
      { payload: values, save: false },
      { onSuccess: () => setTestPassed(true) }
    )
  })

  // POST /pos/config?save=true
  const onSave = form.handleSubmit((values) => {
    mutate(
      { payload: values, save: true },
      {
        onSuccess: () => {
          setSaved(values)
          setStep('confirmation')
        },
      }
    )
  })

  return (
    <div className='bg-background text-foreground flex min-h-svh'>
      {/* Brand panel */}
      <aside
        className={cn(
          'relative hidden w-[26rem] shrink-0 flex-col overflow-hidden p-10 text-white lg:flex xl:w-[30rem]',
          PANEL
        )}
      >
        <div
          aria-hidden
          className='absolute inset-0 [background-image:radial-gradient(white_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] [background-size:22px_22px] opacity-[0.14]'
        />

        <div className='relative flex flex-col gap-10'>
          <SetupBrand inverse />

          <div className='space-y-8'>
            <h1 className='text-3xl leading-tight font-semibold tracking-tight'>
              {t('setup_banner_title')}
            </h1>{' '}
            <p className='max-w-xs text-[15px] leading-relaxed text-white/65'>
              {t('setup_banner_description')}
            </p>
            <SetupStepper
              steps={steps}
              current={step}
              finished={step === 'confirmation'}
              orientation='vertical'
              tone='inverse'
            />
          </div>
        </div>
      </aside>

      {/* Task panel */}
      <div className='flex min-w-0 flex-1 flex-col'>
        <header className='flex items-center justify-between px-6 py-5'>
          <SetupBrand className='lg:invisible' />
          <div className='flex items-center gap-2'>
            <LanguageSwitch />
            <ThemeSwitch />
          </div>
        </header>

        <main className='flex flex-1 flex-col items-center justify-start px-6 pt-6 pb-12'>
          <div className='w-full max-w-md space-y-10'>
            <SetupStepper
              steps={steps}
              current={step}
              finished={step === 'confirmation'}
              className='lg:hidden'
            />
            <div key={step} className='animate-setup-in'>
              {step === 'welcome' && (
                <WelcomeStep onNext={() => setStep('configuration')} />
              )}
              {step === 'configuration' && (
                <ConfigurationStep
                  form={form}
                  testPassed={testPassed}
                  isTesting={isTesting}
                  isSaving={isSaving}
                  isPending={isPending}
                  onBack={() => setStep('welcome')}
                  onTest={onTest}
                  onSave={onSave}
                />
              )}
              {step === 'confirmation' && saved && (
                <ConfirmationStep
                  values={saved}
                  onGoToLogin={() => router.navigate({ to: '/sign-in' })}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default PosSetup