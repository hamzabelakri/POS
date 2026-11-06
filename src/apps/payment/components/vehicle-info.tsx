import { useState } from 'react'
import { toImageSrc } from '@/models/consult-model'
import { Camera, Images } from 'lucide-react'
import { useSSEStore } from '@/stores/sse-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImagesModal } from '../modals/images-modal'

export function VehicleInfo() {
  const info = useSSEStore((s) => s.exitCar?.vehicle_info)
  const [showImages, setShowImages] = useState(false)

  const exitImage = toImageSrc(info?.image)
  const entryImage = toImageSrc(info?.entry_image)

  return (
    <>
      <Card>
        <CardContent className='grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]'>
          {/* Exit picture */}
          {/* Exit picture */}
          <div className='relative min-h-56 overflow-hidden rounded-lg border'>
            {exitImage ? (
              <img
                src={exitImage}
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
                  value={info?.media.lpn ?? ''}
                />
                <Button
                  variant='outline'
                  className='shrink-0'
                  disabled={!info}
                  onClick={() => setShowImages(true)}
                >
                  <Images />
                  Show Entry
                </Button>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='epan'>EPAN</Label>
              <Input
                id='epan'
                readOnly
                value={info?.external_unique_id ?? ''}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='cardType'>Card Type</Label>
              <Input id='cardType' readOnly value={info?.card_type ?? ''} />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='entryTime'>Entry Time</Label>
              <Input
                id='entryTime'
                readOnly
                placeholder='—'
                value={info?.entry_time ?? ''}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='parkingDuration'>Parking Duration</Label>
              <Input
                id='parkingDuration'
                readOnly
                placeholder='—'
                value={info?.parking_duration ?? ''}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <ImagesModal
        open={showImages}
        onOpenChange={setShowImages}
        plate={info?.media.lpn}
        entryImage={entryImage}
        exitImage={exitImage}
      />
    </>
  )
}
