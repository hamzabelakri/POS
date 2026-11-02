import { type LucideIcon } from "lucide-react"

export type Article = {
  id: string
  title: string
  icon?: LucideIcon // fallback icon
  iconUrl?: string // real article image, takes priority over `icon`
}

// One line in billing (the same article can be added more than once)
export type BillingLine = { key: number; article: Article }