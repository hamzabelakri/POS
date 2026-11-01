import { useRef, useState } from "react"
import { endOfDay, startOfDay } from "date-fns"
import { type DateRange } from "react-day-picker"
import {
  ArrowDown,
  ArrowUp,
  Building2,
  CalendarCheck,
  Calculator,
  Camera,
  CreditCard,
  FileText,
  Images,
  Lock,
  Printer,
  RefreshCw,
  Search,
  ShoppingBag,
  Ticket,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Main } from "@/components/layout/main"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/* ───────────── types & sample data (replace with real data) ───────────── */

type Article = {
  id: string
  title: string
  icon?: LucideIcon // fallback icon
  iconUrl?: string // real article image, takes priority over `icon`
}

// One line in billing (the same article can be added more than once)
type BillingLine = { key: number; article: Article }

const ARTICLES: Article[] = [
  { id: "lost-ticket", title: "Lost Ticket", icon: Ticket },
  {
    id: "lost-ticket-calc",
    title: "Lost Ticket With Calculation",
    icon: Calculator,
  },
  { id: "season-parker", title: "Season Parker", icon: CalendarCheck },
]

const VALIDATIONS: Article[] = [
  { id: "mall", title: "Mall Validation", icon: ShoppingBag },
  { id: "hotel", title: "Hotel Validation", icon: Building2 },
]

const BARRIER_ACTIONS = [
  { id: "open", label: "Open Barrier", icon: ArrowUp },
  { id: "close", label: "Close Barrier", icon: ArrowDown },
  { id: "hold-open", label: "Hold Open", icon: Lock },
  { id: "auto", label: "Return to Auto", icon: RefreshCw },
] as const

type BarrierActionId = (typeof BARRIER_ACTIONS)[number]["id"]

const PLATE_SLOTS = 8

/* ───────────── small building blocks ───────────── */

function ArticleIcon({
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

// A line inside Billing: icon on the left, title next, remove button on the right
function BillingArticle({
  article,
  onRemove,
}: {
  article: Article
  onRemove: () => void
}) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex items-center gap-3 p-3">
        <ArticleIcon article={article} className="size-8 shrink-0" />
        <span className="flex-1 truncate text-sm font-medium">
          {article.title}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          aria-label={`Remove ${article.title}`}
          onClick={onRemove}
        >
          <X />
        </Button>
      </CardContent>
    </Card>
  )
}

/* ───────────── page ───────────── */

export function Payment() {
  // Defaults to the whole of today; the chosen times live inside the dates
  const [range, setRange] = useState<DateRange | undefined>(() => ({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  }))
  const [billing, setBilling] = useState<BillingLine[]>([])
  const lineKey = useRef(0)

  const addToBilling = (article: Article) => {
    const key = ++lineKey.current
    setBilling((prev) => [...prev, { key, article }])
  }
  const removeFromBilling = (key: number) =>
    setBilling((prev) => prev.filter((line) => line.key !== key))

  const handleSearch = () => {
    // range.from / range.to already include the selected times
    // TODO: run the search
    console.debug("search:", range)
  }

  const handleBarrierAction = (action: BarrierActionId) => {
    // TODO: send the action to the barrier controller
    console.debug("barrier action:", action)
  }

  return (
    <Main>
      {/* Columns stretch to the same height (default grid behaviour) */}
      <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* ───────────── LEFT COLUMN ───────────── */}
        <div className="flex flex-col gap-4">
          {/* 1. Vehicle / exit info */}
          <Card>
            <CardContent className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
              {/* Exit picture */}
              <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-lg border">
                <div className="flex size-16 items-center justify-center rounded-full border">
                  <Camera className="size-7" />
                </div>
                <span className="text-sm font-medium">Exit Picture</span>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="licensePlate">License Plate</Label>
                  <div className="flex items-center gap-2">
                    <Input id="licensePlate" readOnly className="flex-1" />
                    <Button variant="outline" className="shrink-0">
                      <Images />
                      Show Entry
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="epan">EPAN</Label>
                  <Input id="epan" readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardType">Card Type</Label>
                  <Input id="cardType" readOnly />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entryTime">Entry Time</Label>
                  <Input id="entryTime" readOnly placeholder="—" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parkingDuration">Parking Duration</Label>
                  <Input id="parkingDuration" readOnly placeholder="—" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. License plate search: one wrapping row.
              Wide enough -> plate, range and search share a single row;
              otherwise the range + search wrap below the plate boxes. */}
          <Card>
            <CardHeader>
              <CardTitle>License Plate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {Array.from({ length: PLATE_SLOTS }).map((_, i) => (
                    <Input
                      key={i}
                      maxLength={1}
                      className="size-9 p-0 text-center"
                      aria-label={`Plate character ${i + 1}`}
                    />
                  ))}
                  <div className="flex h-9 w-20 items-center justify-center rounded-md border text-sm">
                    - - -
                  </div>
                </div>

                <DatePickerWithRange value={range} onChange={setRange} />

                <Button className="min-w-24 flex-1" onClick={handleSearch}>
                  <Search />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 3. Articles / validation: two sets (grows to end level with the right column) */}
          <Card className="flex-1">
            <CardHeader className="border-b">
              <CardTitle>Articles / Validation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ArticleGroup articles={ARTICLES} onSelect={addToBilling} />
              <ArticleGroup articles={VALIDATIONS} onSelect={addToBilling} />
            </CardContent>
          </Card>
        </div>

        {/* ───────────── RIGHT COLUMN ───────────── */}
        <div className="flex flex-col gap-4">
          {/* 1. Billing (stretches; the list scrolls, the total stays at the bottom) */}
          <Card className="flex-1">
            <CardHeader className="border-b">
              <CardTitle>Billing</CardTitle>
              <CardAction>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => setBilling([])}
                >
                  Clear All
                </Button>
              </CardAction>
            </CardHeader>

            {/* Absolutely positioned inner list: a long list scrolls
                instead of making the whole page taller */}
            <CardContent className="relative min-h-40 flex-1 p-0">
              <div className="absolute inset-0 space-y-2 overflow-y-auto p-4">
                {billing.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No articles added
                  </p>
                ) : (
                  billing.map(({ key, article }) => (
                    <BillingArticle
                      key={key}
                      article={article}
                      onRemove={() => removeFromBilling(key)}
                    />
                  ))
                )}
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-1 border-t">
              <span className="text-2xl font-bold tracking-widest">Total</span>
              {/* TODO: compute from the billed articles */}
              <span className="text-5xl font-bold">0 EGP</span>
            </CardFooter>
          </Card>

          {/* 2. Gate / print actions (pinned to the bottom) */}
          <Card>
            <CardContent className="grid grid-cols-3 gap-3">
              <DropdownMenu>
                {/* Styled trigger instead of `render`/`asChild`, so it works
                    with both the Radix and Base UI versions of the component */}
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-20 flex-col gap-2"
                  )}
                >
                  <ArrowUp />
                  Barrier
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-48">
                  {BARRIER_ACTIONS.map(({ id, label, icon: Icon }) => (
                    <DropdownMenuItem
                      key={id}
                      onClick={() => handleBarrierAction(id)}
                    >
                      <Icon />
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" className="h-20 flex-col gap-2">
                <Printer />
                Error
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <FileText />
                Auto Print
              </Button>
            </CardContent>
          </Card>

          {/* 3. Payment method (pinned to the bottom) */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-16 flex-col gap-2">
                <Wallet />
                Cash
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <CreditCard />
                Card
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Main>
  )
}