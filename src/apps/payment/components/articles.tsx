import { useState } from 'react'
import {
  LOST_TICKET_WITH_CALCULATION_CODE,
  SEASON_PARKER_CODE,
  SHORT_TERM_PARKER_CODE,
  type Article,
} from '@/models/articles-model'
import { useTranslation } from 'react-i18next'
import { useSSEStore } from '@/stores/sse-store'
import {
  useCreateTransaction,
  usePosArticles,
  useArticleShortcuts,
  shortcutLabel,
} from '@/hooks/use-articles'
import { useCalculateTariff, useNeedsEvaluation } from '@/hooks/use-payment'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { EvaluationModal } from '@/components/shared/modal/evaluation-modal'
import { SeasonParkerModal } from '@/apps/payment/modals/season-parker-modal'
import { LostTicketWithCalculationModal } from '../modals/lost-ticket-with-calculation-modal'
import { PanelHeader } from './panel-header'

const isVisible = (article: Article) =>
  article.isActive && article.code !== SHORT_TERM_PARKER_CODE

function ArticleGroup({
  articles,
  shortcuts,
  isDisabled,
  onSelect,
}: {
  articles: Article[]
  shortcuts: Map<number, string> // article.id -> "Ctrl+2"
  isDisabled: (article: Article) => boolean
  onSelect: (article: Article) => void
}) {
  const renderButton = (article: Article) => {
    const shortcut = shortcuts.get(article.id)
    return (
      <Button
        key={article.id}
        variant='outline'
        disabled={isDisabled(article)}
        title={article.description}
        aria-keyshortcuts={shortcut?.replace('Ctrl', 'Control')}
        className='hover:border-primary hover:bg-primary/5 relative h-auto min-h-36 w-44 shrink-0 flex-col justify-center gap-3 px-3 py-5 text-center whitespace-normal transition-colors'
        onClick={() => onSelect(article)}
      >
        {shortcut && (
          <kbd className='bg-muted text-muted-foreground absolute end-2 top-2 rounded border px-1.5 py-0.5 font-mono text-[10px] leading-none'>
            {shortcut}
          </kbd>
        )}
        {article.iconUrl && (
          <img src={article.iconUrl} alt='' className='size-14 object-contain' />
        )}
        <span className='line-clamp-2 text-base leading-tight font-medium'>
          {article.title}
        </span>
      </Button>
    )
  }

  const production = articles.filter((a) => a.isProduction)
  const others = articles.filter((a) => !a.isProduction)

  return (
    <div className='overflow-x-auto pb-2'>
      <div className='flex w-max flex-col gap-3'>
        <div className='flex gap-3'>{production.map(renderButton)}</div>
        {others.length > 0 && (
          <div className='flex gap-3'>{others.map(renderButton)}</div>
        )}
      </div>
    </div>
  )
}

export function Articles({ billedIds }: { billedIds: Set<number> }) {
  const { t } = useTranslation()
  const { articles } = usePosArticles()
  const { submitArticle, isPending: isSubmitting } = useCreateTransaction()
  const { submitCalculation, isPending: isCalculating } = useCalculateTariff()

  const hasTrackedCar = useSSEStore(
    (s) => s.exitEvent?.type === 'exit_car' && !s.exitEvent.data.is_untracked
  )
  const needsEvaluation = useNeedsEvaluation()

  const [seasonArticle, setSeasonArticle] = useState<Article | null>(null)
  const [calculationArticle, setCalculationArticle] = useState<Article | null>(
    null
  )
  const [pendingArticle, setPendingArticle] = useState<Article | null>(null)

  const busy = isSubmitting || isCalculating
  const visibleArticles = articles.filter(isVisible)

  const isLocked = articles.some((a) => billedIds.has(a.id) && a.isProduction)

  const isDisabled = (article: Article) =>
    busy || isLocked || (article.isProduction ? hasTrackedCar : !hasTrackedCar)

  const proceed = (article: Article, adminId = 0) => {
    if (article.code === SEASON_PARKER_CODE) {
      setSeasonArticle(article)
      return
    }
    if (article.code === LOST_TICKET_WITH_CALCULATION_CODE) {
      setCalculationArticle(article)
      return
    }
    submitArticle(article, adminId)
  }

  const handleSelect = (article: Article) => {
    if (isDisabled(article)) return
    if (needsEvaluation(article)) {
      setPendingArticle(article)
      return
    }
    proceed(article)
  }

  // Keyboard order must match the visual order in ArticleGroup:
  // production first, then the rest.
  const orderedArticles = [
    ...visibleArticles.filter((a) => a.isProduction),
    ...visibleArticles.filter((a) => !a.isProduction),
  ]

  // article.id -> "Ctrl+2" for the buttons
  const shortcuts = new Map<number, string>()
  orderedArticles.forEach((article, index) => {
    const label = shortcutLabel(index)
    if (label) shortcuts.set(article.id, label)
  })

  // Register the keyboard listener (Ctrl+2…Ctrl+9 → select that article)
  useArticleShortcuts(
    orderedArticles,
    (article) => handleSelect(article),
    !busy && !isLocked
  )

  return (
    <>
      <Card className='flex-1 gap-0 py-0'>
        <PanelHeader>
          <CardTitle className='text-muted-foreground text-base'>
            {t('articles')}
          </CardTitle>
        </PanelHeader>
        <CardContent className='py-4'>
          {visibleArticles.length === 0 ? (
            <p className='text-muted-foreground py-6 text-center text-sm'>
              {t('no_articles_configured')}
            </p>
          ) : (
            <ArticleGroup
              articles={visibleArticles}
              shortcuts={shortcuts}
              isDisabled={isDisabled}
              onSelect={handleSelect}
            />
          )}
        </CardContent>
      </Card>

      <EvaluationModal
        type='article'
        open={!!pendingArticle}
        onClose={() => setPendingArticle(null)}
        onSuccess={(user) => {
          if (!pendingArticle) return
          const article = pendingArticle
          setPendingArticle(null)
          proceed(article, user.id)
        }}
      />

      {seasonArticle && (
        <SeasonParkerModal
          title={seasonArticle.title}
          onClose={() => setSeasonArticle(null)}
        />
      )}

      {calculationArticle && (
        <LostTicketWithCalculationModal
          title={calculationArticle.title}
          isPending={isCalculating}
          onClose={() => setCalculationArticle(null)}
          onSubmit={(values) =>
            submitCalculation(calculationArticle, values, () =>
              setCalculationArticle(null)
            )
          }
        />
      )}
    </>
  )
}