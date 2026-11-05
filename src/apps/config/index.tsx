import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Camera,
  CreditCard,
  Database,
  ParkingSquare,
  Plug,
  Receipt,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react'
import { AlertEnum } from '@/models/alert-model'
import { useTranslation } from 'react-i18next'
import { useAlertStore } from '@/stores/alert-store'
import { usePosConfigStore } from '@/stores/pos-config-store'
import { useConfigurePos } from '@/hooks/use-pos-config'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Main } from '@/components/layout/main'
import { PasswordInput } from '@/components/password-input'
import { SidebarNav } from './components/sidebar-nav'
import { useConfigReceiptPreview, useConfigReceiptPreviewImage } from '@/hooks/use-printer'

const schema = z.object({
  base_url: z.string().trim().url('Enter a valid URL'),
  pos_token: z.string().trim().min(1, 'Token is required'),
})
type Values = z.infer<typeof schema>

const SENSITIVE = /(password|api_key|token)/i
const humanize = (key: string) => key.replace(/_/g, ' ')



const toImageSrc = (b64: string) =>
  b64.startsWith('data:') ? b64 : `data:image/png;base64,${b64}`

function ReceiptPreview({
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

  return (
    <section className='space-y-3 rounded-lg border p-4'>
      <div className='flex items-center justify-between'>
        <h3 className='font-semibold'>
          {t('receipt_body_preview', 'Receipt body preview')}
        </h3>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={isPending}
          onClick={() =>
            mutate({
              receipt_header: header,
              receipt_body: body,
              receipt_footer: footer,
            })
          }
        >
          <RefreshCw
            className={isPending ? 'size-4 animate-spin' : 'size-4'}
            aria-hidden='true'
          />
          {t('refresh', 'Refresh')}
        </Button>
      </div>

      {image ? (
        <img
          src={toImageSrc(image)}
          alt={t('receipt_body_preview', 'Receipt body preview')}
          className='mx-auto max-w-full rounded border bg-white'
        />
      ) : (
        <p className='text-sm text-muted-foreground'>
          {isPending
            ? t('loading', 'Loading…')
            : t('no_preview', 'No preview available.')}
        </p>
      )}
    </section>
  )
}


function ReadOnlyField({ name, value }: { name: string; value: unknown }) {
  const text = value === null || value === undefined ? '' : String(value)

  return (
    <div className='space-y-1.5'>
      <Label className='text-muted-foreground text-xs capitalize'>
        {humanize(name)}
      </Label>
      {SENSITIVE.test(name) ? (
        <PasswordInput value={text} readOnly />
      ) : text.includes('\n') ? (
        <Textarea
          value={text}
          readOnly
          rows={8}
          className='font-mono text-xs'
        />
      ) : (
        <Input value={text} readOnly />
      )}
    </div>
  )
}

// Renders every primitive field of an object; nested arrays/objects are skipped.
function Section({
  title,
  data,
  omit = [],
}: {
  title: string
  data: object
  omit?: string[]
}) {
  const entries = Object.entries(data).filter(
    ([key, value]) =>
      !omit.includes(key) && (value === null || typeof value !== 'object')
  )

  return (
    <section className='space-y-3 rounded-lg border p-4'>
      <h3 className='font-semibold'>{title}</h3>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {entries.map(([key, value]) => (
          <ReadOnlyField key={key} name={key} value={value} />
        ))}
      </div>
    </section>
  )
}

export function Configuration() {
  const { t } = useTranslation()
  const config = usePosConfigStore((s) => s.config)
  const { showAlert } = useAlertStore()
  const { mutate, isPending } = useConfigurePos()
  const [section, setSection] = useState('connection')

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { base_url: '', pos_token: '' },
  })

  // Re-sync the editable fields whenever the saved config changes.
  useEffect(() => {
    if (config) {
      form.reset({
        base_url: config.pos.backoffice_base_url,
        pos_token: config.pos.pos_token,
      })
    }
  }, [config, form])

  const onSubmit = form.handleSubmit((payload) => {
    mutate(
      { payload, save: true },
      {
        onSuccess: () =>
          showAlert({
            message: t('config_saved', 'Configuration saved'),
            type: AlertEnum.SUCCESS,
          }),
      }
    )
  })

  if (!config) {
    return (
      <Main>
        <p className='text-muted-foreground text-sm'>
          {t('no_config', 'No saved configuration found.')}
        </p>
      </Main>
    )
  }

  const {
    pos,
    carpark,
    carpark_settings,
    carpark_receipt_settings: receipt,
  } = config

  const icon = 'size-4'
  const items = [
    {
      value: 'connection',
      title: t('connection', 'Connection'),
      icon: <Plug className={icon} aria-hidden='true' />,
    },
    {
      value: 'pos',
      title: 'POS',
      icon: <CreditCard className={icon} aria-hidden='true' />,
    },
    {
      value: 'carpark',
      title: 'Carpark',
      icon: <ParkingSquare className={icon} aria-hidden='true' />,
    },
    {
      value: 'carpark-settings',
      title: 'Carpark settings',
      icon: <SlidersHorizontal className={icon} aria-hidden='true' />,
    },
    {
      value: 'receipt',
      title: 'Receipt',
      icon: <Receipt className={icon} aria-hidden='true' />,
    },
    {
      value: 'extra',
      title: 'Extra settings',
      icon: <Database className={icon} aria-hidden='true' />,
    },
    {
      value: 'cameras',
      title: 'Cameras',
      icon: <Camera className={icon} aria-hidden='true' />,
    },
  ]

  return (
    <Main>
      <div className='mx-auto flex max-w-6xl flex-col gap-6 md:flex-row'>
        <SidebarNav items={items} value={section} onValueChange={setSection} />

        <div className='min-w-0 flex-1 space-y-4'>
          {section === 'connection' && (
            <Form {...form}>
              <form
                onSubmit={onSubmit}
                className='space-y-4 rounded-lg border p-4'
              >
                <h3 className='font-semibold'>
                  {t('connection', 'Connection')}
                </h3>
                <div className='grid gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='base_url'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('base_url', 'Base URL')}</FormLabel>
                        <FormControl>
                          <Input {...field} autoComplete='off' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='pos_token'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('pos_token', 'POS Token')}</FormLabel>
                        <FormControl>
                          <Input {...field} autoComplete='off' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className='flex justify-end'>
                  <Button type='submit' disabled={isPending}>
                    {isPending ? t('saving', 'Saving…') : t('submit', 'Submit')}
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {section === 'pos' && (
            <Section
              title='POS'
              data={pos}
              omit={['pos_token', 'backoffice_base_url']}
            />
          )}

          {section === 'carpark' && <Section title='Carpark' data={carpark} />}

          {section === 'carpark-settings' && (
            <Section title='Carpark settings' data={carpark_settings} />
          )}

          {section === 'receipt' && (
            <>
              <Section title='Receipt settings' data={receipt} />
              <ReceiptPreview
                header={receipt.receipt_header}
                body={receipt.receipt_body}
                footer={receipt.receipt_footer}
              />
            </>
          )}

          {section === 'extra' && (
            <Section
              title='Extra settings'
              data={config.carpark_extra_settings}
            />
          )}

          {section === 'cameras' && (
            <>
              <Section title='Exit camera' data={config.camera} />
              {config.cameras?.map((cam) => (
                <Section
                  key={cam.id}
                  title={`Camera: ${cam.name}`}
                  data={cam}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </Main>
  )
}