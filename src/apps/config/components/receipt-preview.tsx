import { RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  useConfigReceiptPreview,
  useConfigReceiptPreviewImage,
} from '@/hooks/use-printer'

const toImageSrc = (b64: string) =>
  b64.startsWith('data:') ? b64 : `data:image/png;base64,${b64}`

export function ReceiptPreview({
  header,
  body,
  footer,
}: {
  header: string
  body: string
  footer: string
}) {
  const { t } = useTranslation()
  const { data: image } = useConfigReceiptPreviewImage()
  const { mutate, isPending } = useConfigReceiptPreview()

  const refresh = () =>
    mutate({
      receipt_header: header,
      receipt_body: body,
      receipt_footer: footer,
    })

  return (
    <section className='bg-card overflow-hidden rounded-xl border'>
      <header className='flex items-center justify-between border-b px-4 py-3'>
        <h3 className='font-manrope font-semibold'>
          {t('receipt_body_preview')}
        </h3>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={isPending}
          onClick={refresh}
        >
          <RefreshCw
            className={isPending ? 'size-4 animate-spin' : 'size-4'}
            aria-hidden='true'
          />
          {t('refresh')}
        </Button>
      </header>

      {/* The "desk" the receipt lies on */}
      <div className='bg-muted/50 px-4 py-8'>
        <div className='mx-auto w-full max-w-[320px] drop-shadow-lg'>
          <div
            className='receipt-edge bg-white px-3 pt-4 pb-7 text-neutral-900'
            aria-busy={isPending}
          >
            {image ? (
              <img
                src={toImageSrc(image)}
                alt={t('receipt_body_preview')}
                className={
                  'mx-auto w-full transition-opacity ' +
                  (isPending ? 'opacity-50' : 'opacity-100')
                }
              />
            ) : (
              <p className='py-16 text-center font-mono text-xs text-neutral-500'>
                {isPending
                  ? t('loading')
                  : t('no_preview_hint', 'Select refresh to print a sample receipt.')}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}