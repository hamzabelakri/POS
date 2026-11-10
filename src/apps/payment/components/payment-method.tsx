import { CreditCard, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/shadcn-io/spinner"
import { useBilledLines } from "@/hooks/use-articles"
import { usePayment } from "@/hooks/use-payment"

export function PaymentMethod() {
  const hasLines = useBilledLines().length > 0
  const { pay, isPending, variables } = usePayment()

  // Both buttons are disabled with nothing billed or while a payment is in flight
  const disabled = !hasLines || isPending

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
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
          Cash
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
          Card
        </Button>
      </CardContent>
    </Card>
  )
}