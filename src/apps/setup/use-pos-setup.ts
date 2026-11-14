import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useConfigurePos } from '@/hooks/use-pos-config'
import { createConfigSchema, type ConfigValues } from './setup-config'
import type { SetupStep } from './setup-stepper'

export type PosSetupStepId = 'welcome' | 'configuration' | 'confirmation'

export function usePosSetup() {
  const { t } = useTranslation()
  const [step, setStep] = useState<PosSetupStepId>('welcome')
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

  // Ids are internal state keys; only titles are translated
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

  return {
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
  }
}