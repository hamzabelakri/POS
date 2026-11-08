import { useState } from 'react'
import { Camera, Images } from 'lucide-react'
import { toVehicleView, type ExitVehicleEvent } from '@/models/sse-model'
import { buildPlateSearchParams } from '@/service/consult'
import { useSSEStore } from '@/stores/sse-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImagesModal } from '../modals/images-modal'
import { PlateSearchModal } from '../modals/plate-search-modal'

export function VehicleInfo() {
  const event = useSSEStore((s) => s.exitEvent)
  const view = toVehicleView(event)

  const [showImages, setShowImages] = useState(false)

  // Each message is a new object, so a new search_car reopens the modal
  const [dismissed, setDismissed] = useState<ExitVehicleEvent | null>(null)
  const showSearch = event?.type === 'search_car' && dismissed !== event
  const plateChars = [...(view?.plate ?? '')]

  return (
    <>
      <Card>
        <CardContent className='grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]'>
          {/* Exit picture */}
          <div className='relative min-h-56 overflow-hidden rounded-lg border'>
            {view?.image ? (
              <img
                src={view.image}
                alt='Exit'
                className='absolute inset-0 size-full object-cover'
              />
            ) : (
              <div className='flex size-full min-h-56 flex-col items-center justify-center gap-3'>
                <div className='flex size-16 items-center justify-center rounded-full border'>
                  <Camera className='size-7' />
                </div>
                <span className='text-sm font-medium'>Exit Picture</span>
              </div>
            )}
          </div>

          {/* Fields */}
          <div className='grid grid-cols-2 gap-x-6 gap-y-4'>
            <div className='col-span-2 space-y-2'>
              <Label htmlFor='licensePlate'>License Plate</Label>
              <div className='flex items-center gap-2'>
                <Input
                  id='licensePlate'
                  readOnly
                  className='flex-1'
                  value={view?.plate ?? ''}
                />
                <Button
                  variant='outline'
                  className='shrink-0'
                  disabled={!view?.hasEntry}
                  onClick={() => setShowImages(true)}
                >
                  <Images />
                  Show Entry
                </Button>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='epan'>EPAN</Label>
              <Input id='epan' readOnly value={view?.epan ?? ''} />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='cardType'>Card Type</Label>
              <Input id='cardType' readOnly value={view?.cardType ?? ''} />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='entryTime'>Entry Time</Label>
              <Input
                id='entryTime'
                readOnly
                placeholder='—'
                value={view?.entryTime ?? ''}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='parkingDuration'>Parking Duration</Label>
              <Input
                id='parkingDuration'
                readOnly
                placeholder='—'
                value={view?.parkingDuration ?? ''}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <ImagesModal
        open={showImages}
        onOpenChange={setShowImages}
        plate={view?.plate}
        entryImage={view?.entryImage ?? null}
        exitImage={view?.image ?? null}
      />

      {showSearch && (
        <PlateSearchModal
          onClose={() => setDismissed(event)}
          initialPlate={plateChars}
          initialRange={undefined}
          initialParams={buildPlateSearchParams(plateChars, undefined, 1)}
        />
      )}
    </>
  )
}