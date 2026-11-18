import React from "react"
import { AlertTriangle, CheckCircle2, Loader2, OctagonX, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export type DialogTone = "success" | "destructive" | "warning"

export type DetailItem = {
  label: string
  value: React.ReactNode
}

export type DetailSection = {
  title?: string
  image?: string | null
  imageAlt?: string
  details?: DetailItem[]
}

export type AlertButton = {
  label: string
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  loading?: boolean
}

export type StatusAlertDialogProps = {
  tone: DialogTone
  title: string
  description?: string
  image?: string | null
  imageAlt?: string
  details?: DetailItem[]
  /** Side-by-side columns; when set, `image` / `details` are ignored. */
  sections?: DetailSection[]
  cancelLabel?: string
  confirmLabel?: string
  onCancel?: () => void
  onConfirm?: (event: React.MouseEvent<HTMLButtonElement>) => void
  cancelButton?: AlertButton
  confirmButton?: AlertButton
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ButtonVariant = "destructive" | "warning" | "success" | "default"

type ToneConfig = {
  icon: LucideIcon
  badge: string
  headerBg: string
  color: string
  titleColor: string // Added matching title text color per tone
  ring: string
  animation: string
  buttonVariant: ButtonVariant
}

const TONES: Record<DialogTone, ToneConfig> = {
  success: {
    icon: CheckCircle2,
    badge: "bg-success/15 dark:bg-success/20",
    headerBg: "bg-success/5 dark:bg-success/10",
    color: "text-success",
    titleColor: "text-success dark:text-success", // Matches success icon theme
    ring: "ring-success/20 dark:ring-success/20",
    animation: "animate-bounce",
    buttonVariant: "success",
  },
  destructive: {
    icon: OctagonX,
    badge: "bg-destructive/15 dark:bg-destructive/20",
    headerBg: "bg-destructive/5 dark:bg-destructive/10",
    color: "text-destructive",
    titleColor: "text-destructive dark:text-destructive", // Matches destructive icon theme
    ring: "ring-destructive/20 dark:ring-destructive/20",
    animation: "animate-pulse",
    buttonVariant: "destructive",
  },
  warning: {
    icon: AlertTriangle,
    badge: "bg-warning/15 dark:bg-warning/20",
    headerBg: "bg-warning/5 dark:bg-warning/10",
    color: "text-warning",
    titleColor: "text-warning dark:text-warning", // Matches warning icon theme
    ring: "ring-warning/20 dark:ring-warning/20",
    animation: "animate-bounce",
    buttonVariant: "warning",
  },
}

function DetailSectionBlock({ section, ring }: { section: DetailSection; ring: string }) {
  return (
    <div className="min-w-0 space-y-4">
      {section.title ? (
        <h3 className="text-sm font-semibold text-muted-foreground">{section.title}</h3>
      ) : null}

      {section.image ? (
        <div className={cn("h-36 overflow-hidden rounded-xl ring-1 bg-muted", ring)}>
          <img src={section.image} alt={section.imageAlt ?? ""} className="h-full w-full object-cover" />
        </div>
      ) : null}

      {section.details?.length ? (
        <dl className="divide-y rounded-xl border text-sm">
          {section.details.map((d) => (
            <div key={d.label} className="flex items-center justify-between gap-4 px-4 py-2.5">
              <dt className="text-muted-foreground">{d.label}</dt>
              <dd className="text-right font-medium tabular-nums text-foreground">{d.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  )
}

export function StatusAlertDialog({
  tone,
  title,
  description,
  image,
  imageAlt = "",
  details,
  sections,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  cancelButton,
  confirmButton,
  open,
  onOpenChange,
}: StatusAlertDialogProps) {
  const t = TONES[tone]
  const Icon = t.icon

  const finalCancel = cancelButton || (cancelLabel ? { label: cancelLabel, onClick: onCancel } : undefined)
  const finalConfirm = confirmButton || (confirmLabel ? { label: confirmLabel, onClick: onConfirm } : undefined)

  // Normalize to sections: existing callers that pass `image` / `details` get a single section.
  const resolvedSections: DetailSection[] = sections?.length
    ? sections
    : [{ image, imageAlt, details }]
  const hasBody = resolvedSections.some((s) => s.image || s.details?.length)
  const isWide = resolvedSections.length > 1

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={cn(
          "gap-0 overflow-hidden p-0 sm:rounded-2xl",
          isWide ? "sm:max-w-3xl" : "max-w-md"
        )}
      >
        {/* Header banner with tone-based light background */}
        <div className={cn("border-b px-6 py-5", t.headerBg)}>
          <AlertDialogHeader className="flex-row items-start gap-4 space-y-0 text-left">
            <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full", t.badge)}>
              <Icon className={cn("h-5 w-5", t.color, t.animation)} aria-hidden="true" />
            </span>
            <div className="space-y-1.5">
              <AlertDialogTitle className={cn("text-lg font-semibold tracking-tight", t.titleColor)}>
                {title}
              </AlertDialogTitle>
              {description ? (
                <AlertDialogDescription className="text-sm leading-relaxed">
                  {description}
                </AlertDialogDescription>
              ) : null}
            </div>
          </AlertDialogHeader>
        </div>

        {/* Body content: one or more sections (image + details) */}
        {hasBody ? (
          <div className={cn("gap-6 px-6 pt-5 pb-6", isWide ? "grid md:grid-cols-2" : "")}>
            {resolvedSections.map((s, i) => (
              <DetailSectionBlock key={s.title ?? i} section={s} ring={t.ring} />
            ))}
          </div>
        ) : null}

        {/* Footer */}
        {(finalCancel || finalConfirm) ? (
          <AlertDialogFooter className="gap-2 border-t bg-muted/30 px-6 py-4 sm:space-x-0">
            {finalCancel ? (
              <AlertDialogCancel
                onClick={finalCancel.onClick}
                disabled={finalCancel.disabled}
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-0 gap-2")}
              >
                {finalCancel.loading && <Loader2 className="animate-spin" />}
                {finalCancel.label}
              </AlertDialogCancel>
            ) : null}
            {finalConfirm ? (
              <AlertDialogAction
                onClick={finalConfirm.onClick}
                disabled={finalConfirm.disabled}
                className={cn(buttonVariants({ variant: t.buttonVariant, size: "lg" }), "gap-2")}
              >
                {finalConfirm.loading && <Loader2 className="animate-spin" />}
                {finalConfirm.label}
              </AlertDialogAction>
            ) : null}
          </AlertDialogFooter>
        ) : null}
      </AlertDialogContent>
    </AlertDialog>
  )
}