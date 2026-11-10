import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  useCreateTransaction,
  usePosArticles,
} from "@/hooks/use-articles"
import {
  LOST_TICKET_CODE,
  LOST_TICKET_WITH_CALCULATION_CODE,
  SEASON_PARKER_CODE,
  SHORT_TERM_PARKER_CODE,
  type Article,
} from "@/models/articles-model"
import { useSSEStore } from "@/stores/sse-store"
import { SeasonParkerModal } from "@/apps/payment/modals/season-parker-modal"
import { EvaluationModal } from "@/components/shared/modal/evaluation-modal"
import { LostTicketWithCalculationModal } from "../modals/lost-ticket-with-calculation-modal"
import { useCalculateLostTicketTariff } from "@/hooks/use-payment"

const isVisible = (article: Article) =>
  article.isActive && article.code !== SHORT_TERM_PARKER_CODE

// Lost ticket always needs an evaluation: its admin_id comes from it.
const needsEvaluation = (article: Article) =>
  article.permissionRequired || article.code === LOST_TICKET_CODE

const isLostTicketType = (article: Article) =>
  article.code === LOST_TICKET_CODE ||
  article.code === LOST_TICKET_WITH_CALCULATION_CODE

function ArticleGroup({
  articles,
  isDisabled,
  onSelect,
}: {
  articles: Article[]
  isDisabled: (article: Article) => boolean
  onSelect: (article: Article) => void
}) {
  const renderButton = (article: Article) => (
    <Button
      key={article.id}
      variant="outline"
      disabled={isDisabled(article)}
      title={article.description}
      className="h-auto min-h-28 w-36 shrink-0 flex-col justify-center gap-2 py-4 text-center whitespace-normal"
      onClick={() => onSelect(article)}
    >
      {article.iconUrl && (
        <img src={article.iconUrl} alt="" className="size-10 object-contain" />
      )}
      <span className="line-clamp-2 text-sm leading-tight">{article.title}</span>
    </Button>
  )

  const production = articles.filter((a) => a.isProduction)
  const others = articles.filter((a) => !a.isProduction)

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex w-max flex-col gap-3">
        <div className="flex gap-3">{production.map(renderButton)}</div>
        {others.length > 0 && (
          <div className="flex gap-3">{others.map(renderButton)}</div>
        )}
      </div>
    </div>
  )
}

export function Articles({ billedIds }: { billedIds: Set<number> }) {
  const { articles } = usePosArticles()
  const { submitArticle, isPending: isSubmitting } = useCreateTransaction()
  const { submitCalculation, isPending: isCalculating } =
    useCalculateLostTicketTariff()
  const hasExitCar = useSSEStore((s) => s.exitEvent?.type === "exit_car")

  const [seasonArticle, setSeasonArticle] = useState<Article | null>(null)
  const [calculationArticle, setCalculationArticle] = useState<Article | null>(
    null
  )
  const [pendingArticle, setPendingArticle] = useState<Article | null>(null)

  const busy = isSubmitting || isCalculating
  const visibleArticles = articles.filter(isVisible)

  // A billed production article or lost ticket locks every other article.
  const isLocked = articles.some(
    (a) => billedIds.has(a.id) && (a.isProduction || isLostTicketType(a))
  )

  // exit_car received -> non-production enabled, production disabled
  // no exit_car       -> production enabled, non-production disabled
  const isDisabled = (article: Article) =>
    busy || isLocked || (article.isProduction ? hasExitCar : !hasExitCar)

  const proceed = (article: Article, adminId = 0) => {
    if (article.code === SEASON_PARKER_CODE) {
      setSeasonArticle(article)
      return
    }
    if (article.code === LOST_TICKET_WITH_CALCULATION_CODE) {
      setCalculationArticle(article)
      return
    }
    // Lost ticket and every other article: the line appears with the SSE message
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

  return (
    <>
      <Card className="flex-1">
        <CardHeader className="border-b">
          <CardTitle>Articles</CardTitle>
        </CardHeader>
        <CardContent>
          {visibleArticles.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No articles configured
            </p>
          ) : (
            <ArticleGroup
              articles={visibleArticles}
              isDisabled={isDisabled}
              onSelect={handleSelect}
            />
          )}
        </CardContent>
      </Card>

      <EvaluationModal
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