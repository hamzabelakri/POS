import { useMemo, useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { ConfigValues } from './setup-config'
import { SetupStepper } from './stepper'
import { STEP_IDS, WelcomeStep, ConfigurationStep, ReadyStep } from './setup-steps'

interface SetupFlowProps {
  onComplete?: (values: ConfigValues) => void
  onGoToLogin?: () => void
}

// Right-hand column of the setup page. The split-screen shell and background
// come from AuthLayout, so this component only renders the stepper and the active step.
export default function SetupFlow({ onComplete, onGoToLogin }: SetupFlowProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [savedValues, setSavedValues] = useState<ConfigValues | null>(null)

  const steps = useMemo(
    () => STEP_IDS.map(id => ({ id, title: t(`setup_step_${id}`) })),
    [t]
  )

  const next = () => setStep(s => Math.min(s + 1, STEP_IDS.length - 1))
  const back = () => setStep(s => Math.max(s - 1, 0))

  const handleSaved = (values: ConfigValues) => {
    setSavedValues(values)
    onComplete?.(values)
    next()
  }

  const handleGoToLogin = () => {
    if (onGoToLogin) {
      onGoToLogin()
    } else {
      router.navigate({ to: '/sign-in' })
    }
  }

  return (
    <>
      <header className='relative w-full'>
        <SetupStepper steps={steps} current={step} onSelect={setStep} />
      </header>

      <main className='flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10'>
        <div
          key={step}
          className='animate-in fade-in slide-in-from-right-4 w-full max-w-md space-y-8 duration-300 motion-reduce:animate-none'
        >
          {step === 0 && <WelcomeStep onNext={next} />}
          {step === 1 && <ConfigurationStep defaultValues={savedValues} onBack={back} onSaved={handleSaved} />}
          {step === 2 && savedValues && (
            <ReadyStep values={savedValues} onBack={back} onGoToLogin={handleGoToLogin} />
          )}
        </div>
      </main>
    </>
  )
}