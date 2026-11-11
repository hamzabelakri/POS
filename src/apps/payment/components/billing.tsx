import { X } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BillingLine, type Article } from "@/models/articles-model"

// A line inside Billing: optional icon, title, remove button on the right
function BillingArticle({
  article,
  onRemove,
}: {
  article: Article
  onRemove: () => void
}) {
  const { t } = useTranslation()
  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex items-center gap-3 p-3">
        {article.iconUrl && (
          <img
            src={article.iconUrl}
            alt=""
            className="size-8 shrink-0 object-contain"
          />
        )}
        <span className="flex-1 truncate text-sm font-medium">
          {article.title}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          aria-label={t('remove_article', { title: article.title })}
          onClick={onRemove}
        >
          <X />
        </Button>
      </CardContent>
    </Card>
  )
}

export function Billing({
  lines,
  onRemove,
  onClear,
}: {
  lines: BillingLine[]
  onRemove: (key: string) => void
  onClear: () => void
}) {
  const { t } = useTranslation()
  return (
    // Stretches; the list scrolls, the total stays at the bottom
    <Card className="flex-1">
      <CardHeader className="border-b">
        <CardTitle>{t('billing')}</CardTitle>
        <CardAction>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0"
            onClick={onClear}
          >
            {t('clear_all')}
          </Button>
        </CardAction>
      </CardHeader>

      {/* Absolutely positioned inner list: a long list scrolls
          instead of making the whole page taller */}
      <CardContent className="relative min-h-40 flex-1 p-0">
        <div className="absolute inset-0 space-y-2 overflow-y-auto p-4">
          {lines.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t('no_articles_added')}
            </p>
          ) : (
            lines.map(({ key, article }) => (
              <BillingArticle
                key={key}
                article={article}
                onRemove={() => onRemove(key)}
              />
            ))
          )}
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-1 border-t">
        <span className="text-2xl font-bold tracking-widest">{t('total')}</span>
        {/* TODO: compute from the billed articles */}
        <span className="text-5xl font-bold">0 EGP</span>
      </CardFooter>
    </Card>
  )
}