import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type BarrierAction } from '@/models/barrier-model'
import {
  ArrowDown,
  ArrowUp,
  FileText,
  Lock,
  LockOpen,
  Printer,
  type LucideIcon,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useAutoPrintStore, usePrinterUi } from '@/stores/printer-store'
import { cn } from '@/lib/utils'
import {
  useCloseBarrier,
  useLockBarrier,
  useOpenBarrier,
  useUnlockBarrier,
} from '@/hooks/use-barrier'
import { usePrintLastReceipt } from '@/hooks/use-printer'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EvaluationModal } from '@/components/shared/modal/evaluation-modal'

// Actions that require the evaluation password first
const PROTECTED_ACTIONS: BarrierAction[] = ['open', 'unlock']

export function QuickActions() {
  const { t } = useTranslation()
  const open = useOpenBarrier()
  const close = useCloseBarrier()
  const lock = useLockBarrier()
  const unlock = useUnlockBarrier()

  const shift = useAuthStore((state) => state.shift)
  const printLast = usePrintLastReceipt()

  const autoPrint = useAutoPrintStore((s) => s.autoPrint)
  const toggleAutoPrint = useAutoPrintStore((s) => s.toggleAutoPrint)
  const printerUi = usePrinterUi()

  const barrierBusy =
    open.isPending || close.isPending || lock.isPending || unlock.isPending

  // Set while waiting for the evaluation password
  const [pendingAction, setPendingAction] = useState<BarrierAction | null>(null)

  // Built inside the component so labels are translated; ids stay as API values.
  const BARRIER_ACTIONS = [
    { id: 'open', label: t('open_barrier'), icon: ArrowUp },
    { id: 'close', label: t('close_barrier'), icon: ArrowDown },
    { id: 'lock', label: t('lock_barrier'), icon: Lock },
    { id: 'unlock', label: t('unlock_barrier'), icon: LockOpen },
  ] as const satisfies readonly {
    id: BarrierAction
    label: string
    icon: LucideIcon
  }[]

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
    if (!shift || printerUi.blocked) return
    printLast.mutate(shift.id)
  }

  return (
    <>
      <Card>
        <CardContent className='grid grid-cols-3 gap-3'>
          <DropdownMenu>
            {/* Styled trigger instead of `render`/`asChild`, so it works
                with both the Radix and Base UI versions of the component */}
            <DropdownMenuTrigger
              disabled={barrierBusy}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-20 flex-col gap-2'
              )}
            >
              <ArrowUp />
              {t('barrier')}
            </DropdownMenuTrigger>
            <DropdownMenuContent side='top' align='start' className='w-48'>
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
            variant={printerUi.blocked ? 'destructive' : 'outline'}
            className='h-20 flex-col gap-2'
            disabled={!shift || printerUi.blocked || printLast.isPending}
            onClick={handlePrintLastReceipt}
          >
            <Printer />
            {printerUi.label}
          </Button>

          <Button
            variant={autoPrint ? 'default' : 'outline'}
            aria-pressed={autoPrint}
            className='h-20 flex-col gap-2'
            onClick={toggleAutoPrint}
          >
            <FileText />
            {t('auto_print')}
          </Button>
        </CardContent>
      </Card>

      <EvaluationModal type="barrier"
        open={pendingAction !== null}
        onClose={() => setPendingAction(null)}
        onSuccess={() => {
          if (pendingAction) runBarrierAction(pendingAction)
        }}
      />
    </>
  )
}