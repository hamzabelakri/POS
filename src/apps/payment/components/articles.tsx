import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePosArticles } from "@/hooks/use-articles"
import { type Article } from "@/models/articles-model"
import { SeasonParkerModal } from "@/apps/payment/modals/season-parker-modal"
import { LostTicketModal } from "@/apps/payment/modals/lost-ticket-modal"
import { EvaluationModal } from "@/components/shared/modal/evaluation-modal"

const SEASON_PARKER_CODE = "SEASON_PARKER"
const LOST_TICKET_CODE = "LOST_TICKET_WITH_CALCULATION"
const SHORT_TERM_PARKER_CODE = "SHORT_TERM_PARKER"

// An article is disabled (but still shown) when it is not in production.
const isDisabled = (article: Article) => !article.isProduction

// Shown only when active, and never for the short term parker.
const isVisible = (article: Article) =>
  article.isActive && article.code !== SHORT_TERM_PARKER_CODE

function ArticleGroup({
  articles,
  onSelect,
}: {
  articles: Article[]
  onSelect: (article: Article) => void
}) {
  // Two articles per column: fills top to bottom, then moves to the next column.
  return (
    <div className="grid auto-cols-max grid-flow-col grid-rows-2 gap-3 overflow-x-auto pb-2">
      {articles.map((article) => (
        <Button
          key={article.id}
          variant="outline"
          disabled={isDisabled(article)}
          title={article.description}
          className="h-auto min-h-28 w-36 flex-col justify-center gap-2 py-4 text-center whitespace-normal"
          onClick={() => onSelect(article)}
        >
          {article.iconUrl && (
            <img src={article.iconUrl} alt="" className="size-10 object-contain" />
          )}
          <span className="line-clamp-2 text-sm leading-tight">{article.title}</span>
        </Button>
      ))}
    </div>
  )
}

export function Articles({ onSelect }: { onSelect: (article: Article) => void }) {
  const { articles } = usePosArticles()
  const [seasonArticle, setSeasonArticle] = useState<Article | null>(null)
  const [lostTicketArticle, setLostTicketArticle] = useState<Article | null>(null)
  // Article waiting for the evaluation password before it can proceed.
  const [pendingArticle, setPendingArticle] = useState<Article | null>(null)

  const visibleArticles = articles.filter(isVisible)

  // The main action, once any required permission has been granted.
  const proceed = (article: Article) => {
    if (article.code === SEASON_PARKER_CODE) {
      setSeasonArticle(article)
      return
    }
    if (article.code === LOST_TICKET_CODE) {
      setLostTicketArticle(article)
      return
    }
    onSelect(article)
  }

  const handleSelect = (article: Article) => {
    if (isDisabled(article)) return // defensive; the button is already disabled
    if (article.permissionRequired) {
      setPendingArticle(article) // ask for the evaluation password first
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
            <ArticleGroup articles={visibleArticles} onSelect={handleSelect} />
          )}
        </CardContent>
      </Card>

      <EvaluationModal
        open={!!pendingArticle}
        onClose={() => setPendingArticle(null)}
        onSuccess={() => {
          if (pendingArticle) proceed(pendingArticle)
        }}
      />

      {seasonArticle && (
        <SeasonParkerModal
          title={seasonArticle.title}
          onClose={() => setSeasonArticle(null)}
        />
      )}

      {lostTicketArticle && (
        <LostTicketModal
          title={lostTicketArticle.title}
          onClose={() => setLostTicketArticle(null)}
        />
      )}
    </>
  )
}