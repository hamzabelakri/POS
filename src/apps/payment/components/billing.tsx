import { Loader2, X } from "lucide-react"
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

// A billed line: icon tile (or initial), title, position, remove button
function BillingArticle({
  article,
  index,
  onRemove,
  disabled,
  isRemoving,
}: {
  article: Article
  index: number
  onRemove: () => void
  disabled?: boolean
  isRemoving?: boolean
}) {
  const { t } = useTranslation()
  return (
    <div
      className={
        "group relative flex items-center gap-3 overflow-hidden rounded-xl border bg-card " +
        "p-2.5 pl-4 shadow-xs transition-all duration-200 " +
        "animate-in fade-in slide-in-from-right-2 " +
        "hover:border-primary/40 hover:shadow-md " +
        (isRemoving ? "opacity-60" : "")
      }
    >
      {/* Accent bar */}
      <span className="absolute inset-y-0 left-0 w-1 bg-primary/70 transition-colors group-hover:bg-primary" />

      {/* Icon tile, falls back to the title's initial */}
      <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted ring-1 ring-border">
        {article.iconUrl ? (
          <img
            src={article.iconUrl}
            alt=""
            className="size-8 object-contain"
          />
        ) : (
          <span className="text-base font-semibold text-muted-foreground">
            {article.title.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm leading-tight font-semibold">
          {article.title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
          #{index + 1}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        aria-label={t('remove_article', { title: article.title })}
        onClick={onRemove}
        disabled={disabled}
      >
        {isRemoving ? <Loader2 className="animate-spin" /> : <X />}
      </Button>
    </div>
  )
}

export function Billing({
  lines,
  onRemove,
  onClear,
  isRemoving = false,
}: {
  lines: BillingLine[]
  onRemove: (key: string) => void
  onClear: () => void
  isRemoving?: boolean
}) {
  const { t } = useTranslation()

  return (
    // Stretches; the list scrolls, the total stays at the bottom.
    <Card className="flex-1 gap-0 overflow-hidden pb-0">
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
          instead of making the whole page taller. Empty = just blank. */}
      <CardContent className="relative min-h-40 flex-1 p-0">
        <div className="absolute inset-0 space-y-2.5 overflow-y-auto p-4">
          {lines.map(({ key, article }, i) => (
            <BillingArticle
              key={key}
              article={article}
              index={i}
              disabled={isRemoving}
              onRemove={() => onRemove(key)}
            />
          ))}
        </div>
      </CardContent>

      <CardFooter className="bg-green-500 text-primary-foreground flex-col gap-1 py-8">
        <span className="text-2xl font-bold tracking-widest">{t('total')}</span>
        {/* TODO: compute from the billed articles */}
        <span className="text-5xl font-bold tabular-nums">0 EGP</span>
      </CardFooter>
    </Card>
  )
}