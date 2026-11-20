// src/apps/shift-report/shift-report-modal/receipt-viewer.tsx
import { useState } from 'react'
import { IconZoomIn, IconZoomOut } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ReceiptEmptyState } from './receipt-empty-state'

const BASE_WIDTH = 240
const ZOOMS = [1, 1.25, 1.5, 1.75]

// Torn-paper bottom edge, drawn with a mask (no assets)
const ZIGZAG =
  'conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 14px 100%'

// Subtle dotted "desk" backdrop that adapts to light/dark via currentColor
const DOTS =
  'radial-gradient(circle, color-mix(in oklab, currentColor 14%, transparent) 1px, transparent 1px)'

type Status = 'loading' | 'ready' | 'error'

export function ReceiptViewer({ src, alt }: { src: string; alt: string }) {
  const { t } = useTranslation()
  const [zoomIdx, setZoomIdx] = useState(0)
  const [status, setStatus] = useState<Status>('loading')

  const zoom = ZOOMS[zoomIdx]
  const ready = status === 'ready'

  if (status === 'error') return <ReceiptEmptyState variant='error' />

  return (
    <div className='relative w-full'>
      {/* Backdrop ("desk") */}
      <div
        className='text-foreground bg-muted/40 max-h-[75vh] min-h-72 overflow-auto rounded-xl border px-6 pt-6 pb-16'
        style={{ backgroundImage: DOTS, backgroundSize: '14px 14px' }}
      >
        {status === 'loading' && (
          <div className='flex justify-center'>
            <ReceiptEmptyState variant='loading' />
          </div>
        )}

        {/* Paper — always white so thermal black-on-white receipts stay legible in dark mode */}
        <div
          className={cn(
            'mx-auto w-fit drop-shadow-lg',
            !ready && 'hidden',
            'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 duration-500'
          )}
        >
          <div
            className='bg-white px-3 pt-3 pb-7'
            style={{ mask: ZIGZAG, WebkitMask: ZIGZAG }}
          >
            <img
              src={src}
              alt={alt}
              draggable={false}
              onLoad={() => setStatus('ready')}
              onError={() => setStatus('error')}
              className='block h-auto max-w-none transition-[width] duration-300 ease-out'
              style={{ width: `${BASE_WIDTH * zoom}px` }}
            />
          </div>
        </div>
      </div>

      {/* Floating zoom control */}
      {ready && (
        <div className='bg-background/90 absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-full border p-1 shadow-md backdrop-blur'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-7 rounded-full'
            aria-label={t('zoom_out', { defaultValue: 'Zoom out' })}
            disabled={zoomIdx === 0}
            onClick={() => setZoomIdx((i) => Math.max(0, i - 1))}
          >
            <IconZoomOut size={15} aria-hidden='true' />
          </Button>

          <Button
            type='button'
            variant='ghost'
            className='text-muted-foreground h-7 min-w-12 rounded-full px-2 text-xs tabular-nums'
            aria-label={t('zoom_reset', { defaultValue: 'Reset zoom' })}
            onClick={() => setZoomIdx(0)}
          >
            {Math.round(zoom * 100)}%
          </Button>

          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-7 rounded-full'
            aria-label={t('zoom_in', { defaultValue: 'Zoom in' })}
            disabled={zoomIdx === ZOOMS.length - 1}
            onClick={() => setZoomIdx((i) => Math.min(ZOOMS.length - 1, i + 1))}
          >
            <IconZoomIn size={15} aria-hidden='true' />
          </Button>
        </div>
      )}
    </div>
  )
}