import { useTranslation } from 'react-i18next'
import { ArrowRightIcon, GlobeIcon, KeyRoundIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { POS_TOKEN_LENGTH, brandButtonClass } from './setup-config'
import { StepHeading } from './step-heading'

export const WelcomeStep = ({ onNext }: { onNext: () => void }) => {
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
      <StepHeading
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
      <Button
        type='button'
        onClick={onNext}
        className={cn(brandButtonClass, 'w-full')}
      >
        {t('start_setup')} <ArrowRightIcon className='size-4' />
      </Button>
    </div>
  )
}