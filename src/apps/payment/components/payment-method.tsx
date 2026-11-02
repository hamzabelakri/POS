import { CreditCard, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PaymentMethod() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-16 flex-col gap-2">
          <Wallet />
          Cash
        </Button>
        <Button variant="outline" className="h-16 flex-col gap-2">
          <CreditCard />
          Card
        </Button>
      </CardContent>
    </Card>
  )
}