import { useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeftIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  GlobeIcon,
  KeyRoundIcon,
  Loader2Icon,
  WifiIcon,
} from 'lucide-react'
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
  type ConfigValues,
} from './setup-config'
import { StepHeading } from './step-heading'

type Props = {
  form: UseFormReturn<ConfigValues>
  testPassed: boolean
  isTesting: boolean
  isSaving: boolean
  isPending: boolean
  onBack: () => void
  onTest: () => void
  onSave: () => void
}

export const ConfigurationStep = ({
  form,
  testPassed,
  isTesting,
  isSaving,
  isPending,
  onBack,
  onTest,
  onSave,
}: Props) => {
  const { t } = useTranslation()
  const [showToken, setShowToken] = useState(false)

  return (
    <div className='space-y-8'>
      <StepHeading
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