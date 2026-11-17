import { Loader2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardTitle,
} from '@/components/ui/card'
import { BillingLine, type Article } from '@/models/articles-model'
import type { ExitCarTransaction } from '@/models/sse-model'
import { PanelHeader } from './panel-header'
import { formatAmount } from '@/lib/utils'

// A billed line: icon tile (or initial), title, amount, remove button
function BillingArticle({
  article,
  transaction,
  onRemove,
  disabled,
  isRemoving,
}: {
  article: Article
  transaction?: ExitCarTransaction
  onRemove: () => void
  disabled?: boolean
  isRemoving?: boolean
}) {
  const { t } = useTranslation()

  // Accent bar, amount, and hover border share the same semantic color
  const isDiscount = transaction?.is_discount === true
  const accentBar = isDiscount
    ? 'bg-destructive/70 group-hover:bg-destructive'
    : 'bg-green-600/70 group-hover:bg-green-600 dark:bg-green-500/70 dark:group-hover:bg-green-500'
  const hoverBorder = isDiscount
    ? 'hover:border-destructive/40'
    : 'hover:border-green-600/40 dark:hover:border-green-500/40'

  return (
    <div
      className={
        'group relative flex items-center gap-3 overflow-hidden rounded-xl border bg-card ' +
        'p-2.5 pl-4 shadow-xs transition-all duration-200 ' +
        'animate-in fade-in slide-in-from-right-2 ' +
        'hover:shadow-md ' +
        hoverBorder +
        ' ' +
        (isRemoving ? 'opacity-60' : '')
      }
    >
      {/* Accent bar — matches the amount color */}
      <span
        className={
          'absolute inset-y-0 left-0 w-1 transition-colors ' + accentBar
        }
      />

      {/* Icon tile, falls back to the title's initial */}
      <div className='bg-muted ring-border flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg ring-1'>
        {article.iconUrl ? (
          <img src={article.iconUrl} alt='' className='size-8 object-contain' />
        ) : (
          <span className='text-muted-foreground text-base font-semibold'>
            {article.title.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className='min-w-0 flex-1'>
        <p className='line-clamp-2 text-sm leading-tight font-semibold'>
          {article.title}
        </p>
      </div>

      {transaction && (
        <span
          className={
            'shrink-0 text-base font-semibold tabular-nums ' +
            (transaction.is_discount
              ? 'text-destructive'
              : 'text-green-600 dark:text-green-500')
          }
        >
          {transaction.is_discount ? '-' : ''}
          {formatAmount(Math.abs(transaction.value))}
        </span>
      )}

      <Button
        variant='ghost'
        size='icon'
        className='text-muted-foreground hover:bg-destructive/10 hover:text-destructive size-8 shrink-0 rounded-full'
        aria-label={t('remove_article', { title: article.title })}
        onClick={onRemove}
        disabled={disabled}
      >
        {isRemoving ? <Loader2 className='animate-spin' /> : <X />}
      </Button>
    </div>
  )
}

export function Billing({
  lines,
  transactions,
  total,
  onRemove,
  onClear,
  isRemoving = false,
}: {
  lines: BillingLine[]
  transactions: Record<string, ExitCarTransaction>
  total: number
  onRemove: (key: string) => void
  onClear: () => void
  isRemoving?: boolean
}) {
  const { t } = useTranslation()

  return (
    // Stretches; the list scrolls, the total stays at the bottom.
    <Card className='flex-1 gap-0 overflow-hidden py-0'>
      <PanelHeader>
        <CardTitle className='text-muted-foreground text-base'>
          {t('billing')}
        </CardTitle>
        <CardAction>
          <Button
            variant='link'
            size='sm'
            className='h-auto p-0'
            onClick={onClear}
          >
            {t('clear_all')}
          </Button>
        </CardAction>
      </PanelHeader>

      {/* Absolutely positioned inner list: a long list scrolls
          instead of making the whole page taller. Empty = just blank. */}
      <CardContent className='relative min-h-40 flex-1 p-0'>
        <div className='absolute inset-0 space-y-2.5 overflow-y-auto p-4'>
          {lines.map(({ key, article }) => (
            <BillingArticle
              key={key}
              article={article}
              transaction={transactions[key]}
              disabled={isRemoving}
              onRemove={() => onRemove(key)}
            />
          ))}
        </div>
      </CardContent>

      <CardFooter className='bg-green-500 text-primary-foreground flex-col gap-1 py-8'>
        <span className='text-2xl font-bold tracking-widest'>{t('total')}</span>
        <span className='text-5xl font-bold tabular-nums'>
          {formatAmount(total)}
        </span>
      </CardFooter>
    </Card>
  )
}