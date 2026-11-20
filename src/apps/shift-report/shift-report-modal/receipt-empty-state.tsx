// src/apps/shift-report/shift-report-modal/receipt-empty-state.tsx
import { IconReceiptOff, IconRefresh } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type Variant = 'loading' | 'empty' | 'error'

// Torn-paper bottom edge (zigzag) using a mask, no extra assets needed
const ZIGZAG =
  'conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 14px 100%'

const BARCODE = [2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2]

function Bar({ w, className }: { w: string; className?: string }) {
  return (
    <div
      className={cn('bg-foreground/10 h-1.5 rounded-full', className)}
      style={{ width: w }}
    />
  )
}

function ReceiptPaper({
  variant,
  children,
}: {
  variant: Variant
  children?: React.ReactNode
}) {
  return (
    <div className='relative -rotate-2 drop-shadow-md'>
      <div
        className={cn(
          'bg-card w-44 space-y-3 px-4 pt-5 pb-7',
          variant === 'loading' && 'motion-safe:animate-pulse'
        )}
        style={{ mask: ZIGZAG, WebkitMask: ZIGZAG }}
        aria-hidden='true'
      >
        {/* header */}
        <div className='flex flex-col items-center gap-2'>
          <div className='bg-foreground/10 size-6 rounded-full' />
          <Bar w='60%' />
        </div>

        <div className='border-t border-dashed' />

        {/* line items */}
        <div className='space-y-2'>
          {['45%', '55%', '38%', '50%'].map((w, i) => (
            <div key={i} className='flex items-center justify-between'>
              <Bar w={w} />
              <Bar w='18%' />
            </div>
          ))}
        </div>

        <div className='border-t border-dashed' />

        {/* total */}
        <div className='flex items-center justify-between'>
          <Bar w='28%' className='h-2' />
          <Bar w='30%' className='h-2' />
        </div>

        {/* barcode */}
        <div className='flex h-6 items-stretch justify-center gap-px pt-1'>
          {BARCODE.map((w, i) => (
            <div
              key={i}
              className='bg-foreground/15'
              style={{ width: `${w}px` }}
            />
          ))}
        </div>
      </div>

      {children}
    </div>
  )
}

interface ReceiptEmptyStateProps {
  variant: Variant
  onRetry?: () => void
  retrying?: boolean
}

export function ReceiptEmptyState({
  variant,
  onRetry,
  retrying,
}: ReceiptEmptyStateProps) {
  const { t } = useTranslation()

  if (variant === 'loading') {
    return (
      <div
        role='status'
        aria-label={t('loading', { defaultValue: 'Loading' })}
        className='flex flex-col items-center gap-4 py-4'
      >
        <ReceiptPaper variant='loading' />
      </div>
    )
  }

  const isError = variant === 'error'

  return (
    <div
      role='status'
      className='flex flex-col items-center gap-5 px-4 py-4 text-center'
    >
      <ReceiptPaper variant={variant}>
        {/* badge overlapping the paper */}
        <div className='absolute inset-0 flex items-center justify-center'>
          <span
            className={cn(
              'bg-background/90 flex size-12 items-center justify-center rounded-full border shadow-sm backdrop-blur',
              isError ? 'text-destructive border-destructive/30' : 'text-muted-foreground'
            )}
          >
            <IconReceiptOff size={22} aria-hidden='true' />
          </span>
        </div>
      </ReceiptPaper>

      <div className='max-w-60 space-y-1'>
        <p className='text-foreground text-sm font-semibold'>
          {isError ? t('receipt_load_failed') : t('receipt_not_available')}
        </p>
        <p className='text-muted-foreground text-xs leading-relaxed'>
          {isError
            ? t('receipt_load_failed_hint', {
                defaultValue: 'Check your connection and try again.',
              })
            : t('receipt_not_available_hint', {
                defaultValue: 'No preview is available for this payment.',
              })}
        </p>
      </div>

      {onRetry && (
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='h-8 gap-1.5 rounded-full px-3 text-xs'
          disabled={retrying}
          onClick={onRetry}
        >
          <IconRefresh
            size={14}
            className={cn(retrying && 'motion-safe:animate-spin')}
            aria-hidden='true'
          />
          {t('retry', { defaultValue: 'Retry' })}
        </Button>
      )}
    </div>
  )
}