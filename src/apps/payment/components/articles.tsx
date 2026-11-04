import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePosArticles } from "@/hooks/use-articles"
import { type Article } from "@/models/articles-model"
import { SeasonParkerModal } from "@/apps/payment/modals/season-parker-modal"

const SEASON_PARKER_CODE = "SEASON_PARKER"

// A group of selectable article tiles (used for both sets)
function ArticleGroup({
  articles,
  onSelect,
}: {
  articles: Article[]
  onSelect: (article: Article) => void
}) {
  if (articles.length === 0) return null

  return (
    <section>
      <div className="flex flex-wrap gap-3">
        {articles.map((article) => (
          <Button
            key={article.id}
            variant="outline"
            title={article.description}
            className="h-auto min-h-28 w-36 flex-col justify-center gap-2 py-4 text-center whitespace-normal"
            onClick={() => onSelect(article)}
          >
            {article.iconUrl && (
              <img
                src={article.iconUrl}
                alt=""
                className="size-10 object-contain"
              />
            )}
            <span className="line-clamp-2 text-sm leading-tight">
              {article.title}
            </span>
          </Button>
        ))}
      </div>
    </section>
  )
}

export function Articles({
  onSelect,
}: {
  onSelect: (article: Article) => void
}) {
  const { articles, validations } = usePosArticles()
  const [seasonArticle, setSeasonArticle] = useState<Article | null>(null)
  const isEmpty = articles.length === 0 && validations.length === 0

  const handleSelect = (article: Article) => {
    if (article.code === SEASON_PARKER_CODE) {
      setSeasonArticle(article)
      return
    }
    onSelect(article)
  }

  return (
    <>
      {/* flex-1: grows to end level with the right column */}
      <Card className="flex-1">
        <CardHeader className="border-b">
          <CardTitle>Articles / Validation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEmpty ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No articles configured
            </p>
          ) : (
            <>
              <ArticleGroup articles={articles} onSelect={handleSelect} />
              <ArticleGroup articles={validations} onSelect={handleSelect} />
            </>
          )}
        </CardContent>
      </Card>

      {seasonArticle && (
        <SeasonParkerModal
          title={seasonArticle.title}
          onClose={() => setSeasonArticle(null)}
        />
      )}
    </>
  )
}