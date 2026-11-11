import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

function ImagePane({ label, src }: { label: string; src: string | null }) {
  const { t } = useTranslation()
  return (
    <div className='space-y-2'>
      <span className='text-sm font-medium'>{label}</span>
      <div className='bg-muted/30 flex aspect-video items-center justify-center overflow-hidden rounded-lg border'>
        {src ? (
          <img
            src={src}
            alt={t('label_picture', { label })}
            className='size-full object-cover'
          />
        ) : (
          <span className='text-muted-foreground text-sm'>
            {t('no_image_available')}
          </span>
        )}
      </div>
    </div>
  )
}

export function ImagesModal({
  open,
  onOpenChange,
  plate,
  entryImage,
  exitImage,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  plate?: string
  entryImage: string | null
  exitImage: string | null
}) {
  const { t } = useTranslation()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle>{t('entry_exit_pictures')}</DialogTitle>
          <DialogDescription>{plate || '—'}</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 md:grid-cols-2'>
          <ImagePane label={t('entry')} src={entryImage} />
          <ImagePane label={t('exit')} src={exitImage} />
        </div>
      </DialogContent>
    </Dialog>
  )
}