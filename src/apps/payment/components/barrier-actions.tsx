import { useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  FileText,
  Lock,
  LockOpen,
  Printer,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  useCloseBarrier,
  useLockBarrier,
  useOpenBarrier,
  useUnlockBarrier,
} from "@/hooks/use-barrier"
import { usePrintLastReceipt } from "@/hooks/use-printer"
import { type BarrierAction } from "@/models/barrier-model"
import { useAuthStore } from "@/stores/auth-store"
import { EvaluationModal } from "@/components/shared/modal/evaluation-modal"

const BARRIER_ACTIONS = [
  { id: "open", label: "Open Barrier", icon: ArrowUp },
  { id: "close", label: "Close Barrier", icon: ArrowDown },
  { id: "lock", label: "Lock Barrier", icon: Lock },
  { id: "unlock", label: "Unlock Barrier", icon: LockOpen },
] as const satisfies readonly {
  id: BarrierAction
  label: string
  icon: LucideIcon
}[]

// Actions that require the evaluation password first
const PROTECTED_ACTIONS: BarrierAction[] = ["open", "unlock"]

export function BarrierActions() {
  const open = useOpenBarrier()
  const close = useCloseBarrier()
  const lock = useLockBarrier()
  const unlock = useUnlockBarrier()

  const shift = useAuthStore((state) => state.shift)
  const printReceipt = usePrintLastReceipt()

  const barrierBusy =
    open.isPending || close.isPending || lock.isPending || unlock.isPending

  // Set while waiting for the evaluation password
  const [pendingAction, setPendingAction] = useState<BarrierAction | null>(null)

  const runBarrierAction = (action: BarrierAction) => {
    const run = { open, close, lock, unlock }[action]
    run.mutate()
  }

  const handleBarrierAction = (action: BarrierAction) => {
    if (PROTECTED_ACTIONS.includes(action)) {
      setPendingAction(action) // opens the modal; the action runs on success
      return
    }
    runBarrierAction(action)
  }

  const handlePrintLastReceipt = () => {
    if (!shift) return
    printReceipt.mutate(shift.id)
  }

  return (
    <>
      <Card>
        <CardContent className="grid grid-cols-3 gap-3">
          <DropdownMenu>
            {/* Styled trigger instead of `render`/`asChild`, so it works
                with both the Radix and Base UI versions of the component */}
            <DropdownMenuTrigger
              disabled={barrierBusy}
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

          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            disabled={!shift || printReceipt.isPending}
            onClick={handlePrintLastReceipt}
          >
            <Printer />
            Error
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <FileText />
            Auto Print
          </Button>
        </CardContent>
      </Card>

      <EvaluationModal
        open={pendingAction !== null}
        onClose={() => setPendingAction(null)}
        onSuccess={() => {
          if (pendingAction) runBarrierAction(pendingAction)
        }}
      />
    </>
  )
}