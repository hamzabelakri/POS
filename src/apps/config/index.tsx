import { useEffect, useMemo, useState } from 'react'
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
  Search,
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
import { Main } from '@/components/layout/main'
import { PasswordInput } from '@/components/password-input'
import { SidebarNav } from './components/sidebar-nav'
import { Section } from './components/field-list'
import { ReceiptPreview } from './components/receipt-preview'

const hostOf = (url?: string) => {
  try {
    return new URL(url ?? '').host
  } catch {
    return url ?? ''
  }
}

function Banner({ host, cameras }: { host: string; cameras: number }) {
  const { t } = useTranslation()

  return (
    <header className='relative overflow-hidden rounded-2xl bg-linear-to-br from-(--banner-from) via-(--banner-via) to-(--banner-to) text-white'>
      <div className='flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8'>
        <div className='space-y-1.5'>
          <h1 className='font-manrope text-2xl font-semibold tracking-tight sm:text-3xl'>
            {t('configuration', 'Configuration')}
          </h1>
          <p className='max-w-md text-sm text-white/70'>
            {t('configuration_hint')}
          </p>
        </div>

        <dl className='flex gap-8 text-sm'>
          <div>
            <dt className='text-white/60'>{t('back_office', 'Back office')}</dt>
            <dd className='mt-0.5 font-mono text-[13px]'>{host || '—'}</dd>
          </div>
          <div>
            <dt className='text-white/60'>{t('cameras')}</dt>
            <dd className='mt-0.5 font-medium tabular-nums'>{cameras}</dd>
          </div>
        </dl>
      </div>

      {/* Parking-bay markings */}
      <div
        aria-hidden='true'
        className='h-3 bg-[repeating-linear-gradient(90deg,rgb(255_255_255/0.16)_0_2px,transparent_2px_32px)]'
      />
    </header>
  )
}

export function Configuration() {
  const { t } = useTranslation()
  const config = usePosConfigStore((s) => s.config)
  const { showAlert } = useAlertStore()
  const { mutate, isPending } = useConfigurePos()

  // Remember the open section across reloads via the URL hash.
  const [section, setSection] = useState(
    () => window.location.hash.slice(1) || 'connection'
  )
  const [query, setQuery] = useState('')

  const changeSection = (value: string) => {
    setSection(value)
    setQuery('')
    window.history.replaceState(null, '', `#${value}`)
  }

  // Built once per language, not on every render.
  const schema = useMemo(
    () =>
      z.object({
        base_url: z.string().trim().url(t('enter_valid_url')),
        pos_token: z.string().trim().min(1, t('token_required')),
      }),
    [t]
  )
  type Values = z.infer<typeof schema>

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
          showAlert({ message: t('config_saved'), type: AlertEnum.SUCCESS }),
      }
    )
  })

  if (!config) {
    return (
      <Main>
        <p className='text-muted-foreground text-sm'>{t('no_config')}</p>
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
  const access = t('group_access', 'Access')
  const parking = t('group_parking', 'Parking')
  const devices = t('group_devices', 'Devices')
  const printing = t('group_printing', 'Printing')

  const items = [
    { value: 'connection', title: t('connection'), group: access, icon: <Plug className={icon} aria-hidden='true' /> },
    { value: 'pos', title: t('pos'), group: access, icon: <CreditCard className={icon} aria-hidden='true' /> },
    { value: 'carpark', title: t('carpark'), group: parking, icon: <ParkingSquare className={icon} aria-hidden='true' /> },
    { value: 'carpark-settings', title: t('carpark_settings'), group: parking, icon: <SlidersHorizontal className={icon} aria-hidden='true' /> },
    { value: 'extra', title: t('extra_settings'), group: parking, icon: <Database className={icon} aria-hidden='true' /> },
    { value: 'cameras', title: t('cameras'), group: devices, badge: (config.cameras?.length ?? 0) + 1, icon: <Camera className={icon} aria-hidden='true' /> },
    { value: 'receipt', title: t('receipt'), group: printing, icon: <Receipt className={icon} aria-hidden='true' /> },
  ]

  const active = items.some((i) => i.value === section) ? section : 'connection'
  const searchable = active !== 'connection'
  const { isDirty } = form.formState

  return (
    <Main>
      <div className='mx-auto max-w-6xl space-y-6'>
        <Banner
          host={hostOf(pos.backoffice_base_url)}
          cameras={(config.cameras?.length ?? 0) + 1}
        />

        <div className='flex flex-col gap-6 md:flex-row md:items-start'>
          <SidebarNav items={items} value={active} onValueChange={changeSection} />

          <div
            key={active}
            className='animate-setup-in min-w-0 flex-1 space-y-4 motion-reduce:animate-none'
          >
            {searchable && (
              <div className='relative'>
                <Search
                  className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2'
                  aria-hidden='true'
                />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('search_settings', 'Search settings')}
                  aria-label={t('search_settings', 'Search settings')}
                  className='bg-card pl-9'
                />
              </div>
            )}

            {active === 'connection' && (
              <Form {...form}>
                <form
                  onSubmit={onSubmit}
                  className='bg-card overflow-hidden rounded-xl border'
                >
                  <div className='space-y-5 p-5'>
                    <div>
                      <h3 className='font-manrope font-semibold'>
                        {t('connection')}
                      </h3>
                    </div>

                    <div className='grid gap-5 sm:grid-cols-2'>
                      <FormField
                        control={form.control}
                        name='base_url'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('base_url')}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                inputMode='url'
                                autoComplete='off'
                                className='font-mono text-[13px]'
                              />
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
                            <FormLabel>{t('pos_token')}</FormLabel>
                            <FormControl>
                              <PasswordInput
                                {...field}
                                autoComplete='off'
                                className='font-mono text-[13px]'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <footer className='bg-muted/40 flex items-center justify-between gap-3 border-t px-5 py-3'>
                    <p className='text-muted-foreground text-xs' aria-live='polite'>
                      {isDirty ? t('unsaved_changes', 'You have unsaved changes.') : ''}
                    </p>
                    <div className='flex gap-2'>
                      <Button
                        type='button'
                        variant='ghost'
                        disabled={!isDirty || isPending}
                        onClick={() => form.reset()}
                      >
                        {t('reset', 'Reset')}
                      </Button>
                      <Button type='submit' disabled={!isDirty || isPending}>
                        {isPending ? t('saving') : t('save_changes', 'Save changes')}
                      </Button>
                    </div>
                  </footer>
                </form>
              </Form>
            )}

            {active === 'pos' && (
              <Section
                title={t('pos')}
                data={pos}
                omit={['pos_token', 'backoffice_base_url']}
                query={query}
              />
            )}

            {active === 'carpark' && (
              <Section title={t('carpark')} data={carpark} query={query} />
            )}

            {active === 'carpark-settings' && (
              <Section
                title={t('carpark_settings')}
                data={carpark_settings}
                query={query}
              />
            )}

            {active === 'extra' && (
              <Section
                title={t('extra_settings')}
                data={config.carpark_extra_settings}
                query={query}
              />
            )}

            {active === 'cameras' && (
              <>
                <Section title={t('exit_camera')} data={config.camera} query={query} />
                {config.cameras?.map((cam) => (
                  <Section
                    key={cam.id}
                    title={t('camera_named', { name: cam.name })}
                    data={cam}
                    query={query}
                  />
                ))}
              </>
            )}

            {active === 'receipt' && (
              <div className='grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start'>
                <Section
                  title={t('receipt_settings')}
                  data={receipt}
                  query={query}
                  columns={1}
                />
                <div className='xl:sticky xl:top-4'>
                  <ReceiptPreview
                    header={receipt.receipt_header}
                    body={receipt.receipt_body}
                    footer={receipt.receipt_footer}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Main>
  )
}