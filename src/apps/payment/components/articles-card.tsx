import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ARTICLES, VALIDATIONS } from "../data"
import { type Article } from "../types"
import { ArticleIcon } from "./article-icon"

// A group of selectable article tiles (used for both sets)
function ArticleGroup({
  articles,
  onSelect,
}: {
  articles: Article[]
  onSelect: (article: Article) => void
}) {
  return (
    <section>
      <div className="flex flex-wrap gap-3">
        {articles.map((article) => (
          <Button
            key={article.id}
            variant="outline"
            className="h-auto min-h-20 w-36 flex-col gap-2 py-3 text-center whitespace-normal"
            onClick={() => onSelect(article)}
          >
            <ArticleIcon article={article} className="size-6" />
            <span className="line-clamp-2 text-xs leading-tight">
              {article.title}
            </span>
          </Button>
        ))}
      </div>
    </section>
  )
}

export function ArticlesCard({
  onSelect,
}: {
  onSelect: (article: Article) => void
}) {
  return (
    // flex-1: grows to end level with the right column
    <Card className="flex-1">
      <CardHeader className="border-b">
        <CardTitle>Articles / Validation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ArticleGroup articles={ARTICLES} onSelect={onSelect} />
        <ArticleGroup articles={VALIDATIONS} onSelect={onSelect} />
      </CardContent>
    </Card>
  )
}