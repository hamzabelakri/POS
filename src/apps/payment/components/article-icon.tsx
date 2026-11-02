import { Ticket } from "lucide-react"

import { cn } from "@/lib/utils"
import { type Article } from "../types"

export function ArticleIcon({
  article,
  className,
}: {
  article: Article
  className?: string
}) {
  if (article.iconUrl) {
    return (
      <img
        src={article.iconUrl}
        alt=""
        className={cn("object-contain", className)}
      />
    )
  }
  const Icon = article.icon ?? Ticket
  return <Icon className={className} aria-hidden="true" />
}