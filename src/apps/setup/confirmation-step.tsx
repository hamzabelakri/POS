import { useTranslation } from 'react-i18next'
import { CheckIcon, LogInIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { brandButtonClass, maskToken, type ConfigValues } from './setup-config'
import { StepHeading } from './step-heading'

export const ConfirmationStep = ({
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
        <StepHeading title={t('pos_configured_successfully')} />
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