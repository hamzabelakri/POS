/**
 * OPTION B: premium redesign built from the original 3-step flow
 * (Welcome → Configuration → Confirmation). Split layout: brand panel with a
 * vertical stepper on the left, focused task on the right.
 *
 * To use: swap the import of `pos-setup` for `pos-setup.premium` in your route.
 */
import { useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from '@tanstack/react-router'
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
  WifiIcon
} from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useConfigurePos } from '@/hooks/use-pos-config'
import { cn } from '@/lib/utils'
import { SetupStep, SetupStepper } from '../auth/setup-stepper'
import {
  POS_TOKEN_LENGTH,
  brandButtonClass,
  configSchema,
  maskToken,
  type ConfigValues
} from '../auth/setup-config'
import { SetupBrand } from '../auth/setup-shell'

const PANEL = 'bg-[oklch(0.24_0.07_263)]'

const steps: SetupStep[] = [
  { id: 'welcome', title: 'Welcome', description: 'What you need to get started' },
  { id: 'configuration', title: 'Connection', description: 'Server address and token' },
  { id: 'confirmation', title: 'Ready', description: 'Sign in to this terminal' }
]

const Heading = ({ title, description }: { title: string; description: string }) => (
  <div className='space-y-2'>
    <h2 className='text-foreground text-2xl font-semibold tracking-tight'>{title}</h2>
    <p className='text-muted-foreground text-[15px] leading-relaxed'>{description}</p>
  </div>
)

// ─── Step 1 ─────────────────────────────────────────────────────────────────
const requirements = [
  {
    icon: GlobeIcon,
    title: 'Backoffice address',
    text: 'The URL of your backoffice server, for example http://192.168.1.10:8008.'
  },
  {
    icon: KeyRoundIcon,
    title: 'POS token',
    text: `The ${POS_TOKEN_LENGTH}-character code your administrator generated for this terminal.`
  }
]

const WelcomeStep = ({ onNext }: { onNext: () => void }) => (
  <div className='space-y-8'>
    <Heading
      title='Set up this terminal'
      description='Connect your POS to the backoffice in a couple of minutes. Have these two things ready:'
    />
    <ul className='divide-border border-border divide-y rounded-xl border'>
      {requirements.map(({ icon: Icon, title, text }) => (
        <li key={title} className='flex gap-4 p-4'>
          <span className='bg-brand/10 text-brand-soft flex size-10 shrink-0 items-center justify-center rounded-lg'>
            <Icon className='size-5' />
          </span>
          <div>
            <p className='text-foreground text-sm font-semibold'>{title}</p>
            <p className='text-muted-foreground text-sm leading-relaxed'>{text}</p>
          </div>
        </li>
      ))}
    </ul>
    <div className='space-y-3'>
      <Button type='button' onClick={onNext} className={cn(brandButtonClass, 'w-full')}>
        Start setup <ArrowRightIcon className='size-4' />
      </Button>
      <p className='text-muted-foreground text-center text-xs'>You only need to do this once per terminal.</p>
    </div>
  </div>
)

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

const ConfigurationStep = ({ form, testPassed, isTesting, isSaving, isPending, onBack, onTest, onSave }: ConfigStepProps) => {
  const [showToken, setShowToken] = useState(false)

  return (
    <div className='space-y-8'>
      <Heading
        title='Connect to your backoffice'
        description='Enter the server address and token, then test the connection before saving.'
      />

      <Form {...form}>
        <form
          onSubmit={e => {
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
                <FormLabel>Backoffice URL</FormLabel>
                <div className='relative'>
                  <GlobeIcon className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
                  <FormControl>
                    <Input
                      type='url'
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
                <FormLabel>POS token</FormLabel>
                <div className='relative'>
                  <KeyRoundIcon className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
                  <FormControl>
                    <Input
                      type={showToken ? 'text' : 'password'}
                      placeholder='Enter the POS token'
                      maxLength={POS_TOKEN_LENGTH}
                      autoComplete='off'
                      spellCheck={false}
                      className='h-11 px-9 font-mono tracking-widest'
                      {...field}
                    />
                  </FormControl>
                  <button
                    type='button'
                    onClick={() => setShowToken(v => !v)}
                    aria-label={showToken ? 'Hide token' : 'Show token'}
                    className='text-muted-foreground hover:text-foreground focus-visible:ring-brand/40 absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md outline-none focus-visible:ring-2'
                  >
                    {showToken ? <EyeOffIcon className='size-4' /> : <EyeIcon className='size-4' />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {testPassed && (
            <div
              role='status'
              className='bg-success/10 text-success border-success/25 flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm font-medium'
            >
              <CheckIcon className='size-4 shrink-0' strokeWidth={3} />
              Connection successful. You can save this configuration.
            </div>
          )}

          <div className='border-border flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center'>
            <Button type='button' variant='ghost' onClick={onBack} disabled={isPending} className='h-11 sm:mr-auto'>
              <ArrowLeftIcon className='size-4' /> Back
            </Button>
            <Button type='button' variant='outline' onClick={onTest} disabled={isPending} className='h-11 font-semibold'>
              {isTesting ? <Loader2Icon className='size-4 animate-spin' /> : <WifiIcon className='size-4' />}
              Test connection
            </Button>
            <Button type='submit' disabled={isPending} className={brandButtonClass}>
              {isSaving && <Loader2Icon className='size-4 animate-spin' />}
              Save and continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

// ─── Step 3 ─────────────────────────────────────────────────────────────────
const ConfirmationStep = ({ values, onGoToLogin }: { values: ConfigValues; onGoToLogin: () => void }) => (
  <div className='space-y-8'>
    <div className='space-y-5'>
      <span className='bg-success/15 text-success ring-success/20 flex size-14 items-center justify-center rounded-full ring-8'>
        <CheckIcon className='size-7' strokeWidth={2.5} />
      </span>
      <Heading title='This terminal is connected' description='Your POS is configured and verified. Sign in to start using it.' />
    </div>

    <dl className='divide-border border-border divide-y rounded-xl border text-sm'>
      <div className='flex items-center justify-between gap-4 px-4 py-3.5'>
        <dt className='text-muted-foreground'>Backoffice URL</dt>
        <dd className='truncate font-mono text-xs font-semibold'>{values.base_url}</dd>
      </div>
      <div className='flex items-center justify-between gap-4 px-4 py-3.5'>
        <dt className='text-muted-foreground'>POS token</dt>
        <dd className='font-mono text-xs font-semibold tracking-widest'>{maskToken(values.pos_token)}</dd>
      </div>
      <div className='flex items-center justify-between gap-4 px-4 py-3.5'>
        <dt className='text-muted-foreground'>Status</dt>
        <dd className='text-success flex items-center gap-2 font-semibold'>
          <span className='bg-success size-2 rounded-full' /> Connected and verified
        </dd>
      </div>
    </dl>

    <Button type='button' onClick={onGoToLogin} className={cn(brandButtonClass, 'w-full')}>
      <LogInIcon className='size-4' /> Go to login
    </Button>
  </div>
)

// ─── Page ───────────────────────────────────────────────────────────────────
const PosSetup = () => {
  const router = useRouter()
  const [step, setStep] = useState<string>('welcome')
  const [testPassed, setTestPassed] = useState(false)
  const [saved, setSaved] = useState<ConfigValues | null>(null)
  const { mutate, isPending, variables } = useConfigurePos()

  const isTesting = isPending && variables?.save === false
  const isSaving = isPending && variables?.save === true

  const form = useForm<ConfigValues>({
    resolver: zodResolver(configSchema),
    defaultValues: { base_url: '', pos_token: '' }
  })

  // Editing a field invalidates the previous test result
  useEffect(() => {
    const subscription = form.watch(() => setTestPassed(false))
    return () => subscription.unsubscribe()
  }, [form])

  // POST /pos/config?save=false
  const onTest = form.handleSubmit(values => {
    mutate({ payload: values, save: false }, { onSuccess: () => setTestPassed(true) })
  })

  // POST /pos/config?save=true
  const onSave = form.handleSubmit(values => {
    mutate(
      { payload: values, save: true },
      {
        onSuccess: () => {
          setSaved(values)
          setStep('confirmation')
        }
      }
    )
  })

  return (
    <div className='bg-background text-foreground flex min-h-svh'>
      {/* Brand panel */}
      <aside
        className={cn(
          'relative hidden w-[26rem] shrink-0 flex-col justify-between overflow-hidden p-10 text-white lg:flex xl:w-[30rem]',
          PANEL
        )}
      >
        <div
          aria-hidden
          className='absolute inset-0 opacity-[0.14] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]'
        />
        <SetupBrand inverse className='relative' />

        <div className='relative space-y-12'>
          <div className='space-y-3'>
            <h1 className='text-3xl leading-tight font-semibold tracking-tight'>
              Connect this terminal to your backoffice
            </h1>
            <p className='max-w-xs text-[15px] leading-relaxed text-white/65'>
              One-time setup. Your sales, products and staff sync automatically once it is done.
            </p>
          </div>
          <SetupStepper steps={steps} current={step} finished={step === 'confirmation'} orientation='vertical' tone='inverse' />
        </div>

        <p className='relative max-w-xs text-sm text-white/50'>
          Missing the URL or token? Ask your backoffice administrator.
        </p>
      </aside>

      {/* Task panel */}
      <div className='flex min-w-0 flex-1 flex-col'>
        <header className='flex items-center justify-between px-6 py-5'>
          <SetupBrand className='lg:invisible' />
          <div className='flex items-center gap-2'>{/* <LanguageSwitcher /> <ThemeToggle /> */}</div>
        </header>

        <main className='flex flex-1 flex-col items-center justify-center px-6 pb-12'>
          <div className='w-full max-w-md space-y-10'>
            <SetupStepper steps={steps} current={step} finished={step === 'confirmation'} className='lg:hidden' />
            <div key={step} className='animate-setup-in'>
              {step === 'welcome' && <WelcomeStep onNext={() => setStep('configuration')} />}
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
                <ConfirmationStep values={saved} onGoToLogin={() => router.navigate({ to: '/sign-in' })} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default PosSetup