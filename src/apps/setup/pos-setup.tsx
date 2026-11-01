import { useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ArrowRightIcon, CheckCircle2Icon, Loader2Icon } from 'lucide-react'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperSeparator,
  StepperNav,
  StepperTitle,
  StepperPanel,
  StepperContent
} from '@/components/ui/stepper'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useConfigurePos } from '@/hooks/use-pos-config'

const steps = [
  { id: 'welcome', title: 'Welcome' },
  { id: 'configuration', title: 'Configuration' },
  { id: 'confirmation', title: 'Confirmation' }
]

// Validation (field names match the API payload)
const configSchema = z.object({
  base_url: z.string().trim().url('Enter a valid URL, e.g. http://192.168.1.10:8008'),
  pos_token: z.string().trim().min(1, 'POS token is required')
})

type ConfigValues = z.infer<typeof configSchema>

// Step 1: Welcome
const WelcomeStep = ({ onNext }: { onNext: () => void }) => (
  <div className='space-y-6'>
    <p className='text-foreground text-base'>
      Configure your POS to connect with the backoffice system in just a few steps.
    </p>
    <div className='flex justify-end'>
      <Button type='button' onClick={onNext}>
        Next <ArrowRightIcon className='size-4' />
      </Button>
    </div>
  </div>
)

// Step 2: Configuration form
const ConfigurationStep = ({ onSaved }: { onSaved: () => void }) => {
  const [testPassed, setTestPassed] = useState(false)
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

  // Test Connection: POST /pos/config?save=false
  const onTest = form.handleSubmit(values => {
    mutate({ payload: values, save: false }, { onSuccess: () => setTestPassed(true) })
  })

  // Validate & Save: POST /pos/config?save=true
  const onSave = form.handleSubmit(values => {
    mutate({ payload: values, save: true }, { onSuccess: onSaved })
  })

  return (
    <Form {...form}>
      <form onSubmit={onSave} className='space-y-4'>
        <FormField
          control={form.control}
          name='base_url'
          render={({ field }) => (
            <FormItem className='text-start'>
              <FormLabel>Backoffice URL</FormLabel>
              <FormControl>
                <Input type='url' placeholder='http://192.168.1.10:8008' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='pos_token'
          render={({ field }) => (
            <FormItem className='text-start'>
              <FormLabel>POS Token</FormLabel>
              <FormControl>
                <Input placeholder='Enter the POS token' autoComplete='off' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {testPassed && (
          <div
            role='status'
            className='flex items-center gap-2 text-start text-sm text-green-600 dark:text-green-400'
          >
            <CheckCircle2Icon className='size-4 shrink-0' />
            Connection successful.
          </div>
        )}

        <div className='flex justify-end gap-4'>
          <Button type='button' variant='outline' onClick={onTest} disabled={isPending}>
            {isTesting && <Loader2Icon className='size-4 animate-spin' />}
            Test Connection
          </Button>
          <Button type='submit' disabled={isPending}>
            {isSaving && <Loader2Icon className='size-4 animate-spin' />}
            Validate &amp; Save
          </Button>
        </div>
      </form>
    </Form>
  )
}

// Step 3: Confirmation
const ConfirmationStep = ({ onGoToLogin }: { onGoToLogin: () => void }) => (
  <div className='flex flex-col items-center gap-6'>
    <CheckCircle2Icon className='size-12 text-green-600 dark:text-green-400' />
    <div className='space-y-1'>
      <h2 className='text-foreground text-lg font-semibold'>POS Configured Successfully</h2>
      <p className='text-muted-foreground'>Your terminal is connected and ready to use.</p>
    </div>
    <Button type='button' onClick={onGoToLogin}>
      Go to Login <ArrowRightIcon className='size-4' />
    </Button>
  </div>
)

// Stepper
const PosSetup = () => {
  const router = useRouter()
  const [current, setCurrent] = useState(steps[0].id)

  const currentIndex = steps.findIndex(s => s.id === current)
  const goNext = () => setCurrent(steps[Math.min(currentIndex + 1, steps.length - 1)].id)

  const isConfirmed = current === 'confirmation'

  return (
    <div className='flex min-h-svh items-center justify-center p-4'>
      <Stepper
        steps={steps}
        value={current}
        // Strictly linear flow: progress is driven by the step actions, not by clicking the nav
        onValueChange={() => {}}
        className='flex flex-col items-center justify-center gap-6'
        orientation='horizontal'
      >
        <StepperNav>
          {steps.map((step, index) => (
            <StepperItem key={step.id} stepId={step.id} className='relative flex-1'>
              <StepperTrigger className='pointer-events-none flex flex-col gap-2.5' aria-disabled>
                <StepperIndicator
                  className={
                    isConfirmed
                      ? 'group-data-[state=active]/step:ring-green-600/40 data-[state=active]:bg-green-600/20 data-[state=active]:text-green-600 data-[state=completed]:bg-green-600/20 data-[state=completed]:text-green-600 dark:group-data-[state=active]/step:ring-green-400/40 dark:data-[state=completed]:bg-green-400/20 dark:data-[state=completed]:text-green-400'
                      : ''
                  }
                >
                  {index + 1}
                </StepperIndicator>
                <StepperTitle>{step.title}</StepperTitle>
              </StepperTrigger>
              {steps.length > index + 1 && (
                <StepperSeparator
                  className={cn(
                    'absolute inset-x-0 top-2 right-[calc(-50%+18px)] left-[calc(50%+18px)]',
                    isConfirmed
                      ? 'group-data-[state=completed]/step:bg-green-600/20 dark:group-data-[state=completed]/step:bg-green-400/20'
                      : ''
                  )}
                />
              )}
            </StepperItem>
          ))}
        </StepperNav>

        <StepperPanel className='w-xs text-center text-sm sm:w-xl'>
          <StepperContent value='welcome'>
            <div className='px-8'>
              <WelcomeStep onNext={goNext} />
            </div>
          </StepperContent>

          <StepperContent value='configuration'>
            <div className='px-8'>
              <ConfigurationStep onSaved={goNext} />
            </div>
          </StepperContent>

          <StepperContent value='confirmation'>
            <div className='px-8'>
              <ConfirmationStep onGoToLogin={() => router.navigate({ to: '/sign-in' })} />
            </div>
          </StepperContent>
        </StepperPanel>
      </Stepper>
    </div>
  )
}

export default PosSetup