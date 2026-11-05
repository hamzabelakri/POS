import { useMemo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from '@tanstack/react-router'
import { IconLock } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { usePosConfigStore } from '@/stores/pos-config-store'
import { getDailyPassword } from '@/lib/daily-password'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PasswordInput } from '@/components/password-input'
import type { TFunction } from 'i18next'
import { useConfigReceiptPreview } from '@/hooks/use-printer'

const getSchema = (t: TFunction) =>
  z.object({
    password: z
      .string()
      .trim()
      .nonempty({ message: t('password_req', 'Password is required') }),
  })

type Values = z.infer<ReturnType<typeof getSchema>>

interface ConfigPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConfigPasswordModal({
  open,
  onOpenChange,
}: ConfigPasswordDialogProps) {
  const { t } = useTranslation()
  const router = useRouter()

  const schema = useMemo(() => getSchema(t), [t])
  const { mutate: loadReceiptPreview } = useConfigReceiptPreview()

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: '' },
  })

  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  const onSubmit = form.handleSubmit(({ password }) => {
    if (password !== getDailyPassword()) {
      form.setError('password', {
        message: t('incorrect_password', 'Incorrect password'),
      })
      return
    }

    // Fire-and-forget: the config page reads the result from the query cache.
    const config = usePosConfigStore.getState().config
    if (config) {
      const { receipt_header, receipt_body, receipt_footer } =
        config.carpark_receipt_settings
      loadReceiptPreview({ receipt_header, receipt_body, receipt_footer })
    }

    handleClose()
    router.navigate({ to: '/config' })
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose()
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='border-b pb-3'>
          <DialogTitle className='flex items-center gap-2'>
            <div className='bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
              <IconLock className='size-5' />
            </div>
            {t('configuration', 'Configuration')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id='config-password-form'
            onSubmit={onSubmit}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('password', 'Password')}</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete='off'
                      inputMode='numeric'
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={handleClose}>
            {t('cancel', 'Cancel')}
          </Button>

          <Button type='submit' form='config-password-form'>
            {t('submit', 'Submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}