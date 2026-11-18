import { useMemo, type MouseEvent } from "react"
import { Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"
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
import { buttonVariants } from "@/components/ui/button"
import { alertStyles } from "@/components/shared/alert/confirm-alert"
import { cn } from "@/lib/utils"
import type { QueuedLaneAlert } from "@/models/sse-model"
import { useSSEStore } from "@/stores/sse-store"
import { useRetryOpenBarrier } from "@/hooks/use-barrier"

type BarrierAlert = Extract<QueuedLaneAlert, { type: "open_barrier_try_again" }>

const isBarrierAlert = (a: QueuedLaneAlert): a is BarrierAlert =>
  a.type === "open_barrier_try_again"

function BarrierRetryAlert({
  alert,
  onDismiss,
}: {
  alert: BarrierAlert
  onDismiss: (id: number) => void
}) {
  const { t } = useTranslation()
  const { mutate: retryBarrier, isPending } = useRetryOpenBarrier()

  const { Icon, background, color, animation, button } = alertStyles.warning

  const title = t("open_barrier_try_again", { defaultValue: alert.message })
  const description = alert.message !== title ? alert.message : undefined

  const handleRetry = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault() // stay open (with spinner) until the retry succeeds
    retryBarrier(undefined, { onSuccess: () => onDismiss(alert.id) })
  }

  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open && !isPending) onDismiss(alert.id)
      }}
    >
      <AlertDialogContent className="data-[state=open]:!zoom-in-0 data-[state=closed]:!zoom-out-0 origin-center duration-400 w-120">
        <AlertDialogHeader className="items-center">
          <div
            className={cn(
              "mb-2 mx-auto flex h-16 w-16 items-center justify-center rounded-full",
              background
            )}
          >
            <Icon className={cn("h-9 w-9", color, animation)} />
          </div>
          <AlertDialogTitle className="text-center">{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="text-center">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-2 sm:justify-center">
          <AlertDialogCancel
            onClick={() => onDismiss(alert.id)}
            disabled={isPending}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRetry}
            disabled={isPending}
            className={cn(buttonVariants({ variant: button, size: "lg" }), "gap-2")}
          >
            {isPending && <Loader2 className="animate-spin" />}
            {t("try_again")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/** Renders every open `open_barrier_try_again` lane alert. Mount it next to LaneAlertDialogs. */
export function BarrierRetryAlerts() {
  const laneAlerts = useSSEStore((s) => s.laneAlerts)
  const clearLaneAlert = useSSEStore((s) => s.clearLaneAlert)

  // Filter outside the selector: a selector returning a new array each time re-renders endlessly
  const barrierAlerts = useMemo(() => laneAlerts.filter(isBarrierAlert), [laneAlerts])

  return (
    <>
      {barrierAlerts.map((a) => (
        <BarrierRetryAlert key={a.id} alert={a} onDismiss={clearLaneAlert} />
      ))}
    </>
  )
}