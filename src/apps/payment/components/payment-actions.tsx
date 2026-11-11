import { CreditCard, Wallet } from "lucide-react"
import { useTranslation } from 'react-i18next'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/shadcn-io/spinner"
import { useBilledLines } from "@/hooks/use-articles"
import { usePayment } from "@/hooks/use-payment"

export function PaymentActions() {
  const { t } = useTranslation()
  const hasLines = useBilledLines().length > 0
  const { pay, isPending, variables } = usePayment()

  // Both buttons are disabled with nothing billed or while a payment is in flight
  const disabled = !hasLines || isPending

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('payment_method')}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-16 flex-col gap-2"
          disabled={disabled}
          onClick={() => pay("cash")}
        >
          {isPending && variables?.method === "cash" ? (
            <Spinner variant="circle" />
          ) : (
            <Wallet />
          )}
          {t('cash')}
        </Button>
        <Button
          variant="outline"
          className="h-16 flex-col gap-2"
          disabled={disabled}
          onClick={() => pay("card")}
        >
          {isPending && variables?.method === "card" ? (
            <Spinner variant="circle" />
          ) : (
            <CreditCard />
          )}
          {t('card')}
        </Button>
      </CardContent>
    </Card>
  )
}