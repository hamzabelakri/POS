import { useTranslation } from 'react-i18next'
import { XCircle } from 'lucide-react'
import { useSSEStore } from '@/stores/sse-store'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { buttonVariants } from '@/components/ui/button'

export function LaneErrorAlert() {
  const { t } = useTranslation()
  const error = useSSEStore((s) => s.laneError)
  const clear = useSSEStore((s) => s.clearLaneError)

  if (!error) return null

  // Translated title; the backend message is the fallback and the description
  const title = t(error.type, { defaultValue: error.message })
  const showDescription = !!error.message && error.message !== title

  return (
    <AlertDialog open onOpenChange={(open) => !open && clear()}>
      <AlertDialogContent className='w-120'>
        <AlertDialogHeader className='items-center'>
          <div className='bg-destructive/10 mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full'>
            <XCircle className='text-destructive h-9 w-9 animate-pulse' />
          </div>
          <AlertDialogTitle className='text-center'>{title}</AlertDialogTitle>
          {showDescription && (
            <AlertDialogDescription className='text-center'>
              {error.message}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className='mt-2 sm:justify-center'>
          <AlertDialogAction
            onClick={clear}
            className={buttonVariants({ variant: 'destructive', size: 'lg' })}
          >
            {t('ok')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}