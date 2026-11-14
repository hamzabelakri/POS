import { useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { LanguageSwitch } from '@/components/language-switch'
import { ThemeSwitch } from '@/components/theme-switch'
import { SetupStepper } from './setup-stepper'
import { ConfigurationStep } from './configuration-step'
import { ConfirmationStep } from './confirmation-step'
import { usePosSetup } from './use-pos-setup'
import { WelcomeStep } from './welcome-step'


function SetupBrand({
  className,
}: {
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Change the logo size here, it doesn't affect the layout */}
      <img
        src='./images/logo.svg'
        alt='E-Pos'
        className='size-30 rounded-lg object-contain'
      />
    </div>
  )
}

const PosSetup = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const {
    step,
    setStep,
    steps,
    form,
    testPassed,
    saved,
    isTesting,
    isSaving,
    isPending,
    onTest,
    onSave,
  } = usePosSetup()

  const finished = step === 'confirmation'

  return (
    <div className='bg-background text-foreground flex min-h-svh'>
      {/* LEFT: brand panel, pinned to the viewport, independent of the right side */}
     <aside
  className={cn(
    'relative hidden shrink-0 overflow-hidden text-white',
    'lg:sticky lg:top-0 lg:flex lg:h-svh lg:w-[26rem] xl:w-[30rem]',
    'bg-panel panel-glow border-border border-e'
  )}
>
        <div
          aria-hidden
          className='absolute inset-0 [background-image:radial-gradient(white_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] [background-size:22px_22px] opacity-[0.14]'
        />
        <SetupBrand className='absolute start-10' />

        <div className='relative flex h-full flex-col justify-center space-y-8 px-10 py-28'>
          <h1 className='text-2xl leading-tight font-semibold tracking-tight'>
            {t('setup_banner_title')}
          </h1>
          <p className='max-w-xs text-[15px] leading-relaxed text-white/65'>
            {t('setup_banner_description')}
          </p>
          <SetupStepper
            steps={steps}
            current={step}
            finished={finished}
            orientation='vertical'
            tone='inverse'
          />
        </div>
      </aside>

      {/* RIGHT: switches float in the corner (no header), content has a fixed top offset */}
      <div className='relative flex min-w-0 flex-1 flex-col'>
        <div className='absolute end-4 top-4 z-10 flex items-center gap-2'>
          <LanguageSwitch />
          <ThemeSwitch />
        </div>

        <main className='flex flex-1 flex-col items-center px-6 pt-24 pb-12'>
          <div className='w-full max-w-md space-y-10'>
            {/* Mobile only: the left panel is hidden */}
            <div className='space-y-8 lg:hidden'>
              <SetupBrand className='justify-center' />
              <SetupStepper steps={steps} current={step} finished={finished} />
            </div>

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