import { Camera, Images } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function VehicleInfoCard() {
  return (
    <Card>
      <CardContent className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        {/* Exit picture */}
        <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-lg border">
          <div className="flex size-16 items-center justify-center rounded-full border">
            <Camera className="size-7" />
          </div>
          <span className="text-sm font-medium">Exit Picture</span>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="licensePlate">License Plate</Label>
            <div className="flex items-center gap-2">
              <Input id="licensePlate" readOnly className="flex-1" />
              <Button variant="outline" className="shrink-0">
                <Images />
                Show Entry
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="epan">EPAN</Label>
            <Input id="epan" readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cardType">Card Type</Label>
            <Input id="cardType" readOnly />
          </div>

          <div className="space-y-2">
            <Label htmlFor="entryTime">Entry Time</Label>
            <Input id="entryTime" readOnly placeholder="—" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parkingDuration">Parking Duration</Label>
            <Input id="parkingDuration" readOnly placeholder="—" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}