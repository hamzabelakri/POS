import { useEffect, useState } from 'react'
import { Camera, Images, RefreshCw } from 'lucide-react'
import type { CaptureResponse } from '@/models/bridge-model'
import { toImageSrc, toVehicleView, type ExitVehicleEvent } from '@/models/sse-model'
import { buildPlateSearchParams } from '@/service/consult'
import { useCaptureImage, useUpdateImage } from '@/hooks/use-bridge'
import { useSSEStore } from '@/stores/sse-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/shadcn-io/spinner'
import { ImagesModal } from '../modals/images-modal'
import { PlateSearchModal } from '../modals/plate-search-modal'

export function VehicleInfo() {
  const event = useSSEStore((s) => s.exitEvent)
  const view = toVehicleView(event)

  const { updateVehicleImage, isPending: isUpdatingImage } = useUpdateImage()
  const { mutate: capture, isPending: isCapturing } = useCaptureImage()

  // Result of the manual capture; only shown while no SSE event is displayed
  const [captured, setCaptured] = useState<CaptureResponse | null>(null)
  useEffect(() => {
    if (event) setCaptured(null) // the SSE data takes over
  }, [event])

  const image = view?.image ?? toImageSrc(captured?.image)
  const plate = view?.plate ?? captured?.media.lpn ?? ''

  const canCapture = !event && !captured
  const canUpdateImage = event?.type === 'exit_car' && !!view?.image

  const [showImages, setShowImages] = useState(false)

  // Each message is a new object, so a new search_car reopens the modal
  const [dismissed, setDismissed] = useState<ExitVehicleEvent | null>(null)
  const showSearch = event?.type === 'search_car' && dismissed !== event

  return (
    <>
      <Card>
        <CardContent className='grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]'>
          {/* Exit picture */}
          <div className='relative min-h-56 overflow-hidden rounded-lg border'>
            {image ? (
              <img
                src={image}
                alt='Exit'
                className='absolute inset-0 size-full object-cover'
              />
            ) : canCapture ? (
              <button
                type='button'
                disabled={isCapturing}
                onClick={() => capture(undefined, { onSuccess: setCaptured })}
                className='hover:bg-muted/50 flex size-full min-h-56 flex-col items-center justify-center gap-3 disabled:opacity-60'
              >
                <div className='flex size-16 items-center justify-center rounded-full border'>
                  {isCapturing ? <Spinner variant='circle' /> : <Camera className='size-7' />}
                </div>
                <span className='text-sm font-medium'>Capture Picture</span>
              </button>
            ) : (
              <div className='flex size-full min-h-56 flex-col items-center justify-center gap-3'>
                <div className='flex size-16 items-center justify-center rounded-full border'>
                  <Camera className='size-7' />
                </div>
                <span className='text-sm font-medium'>Exit Picture</span>
              </div>
            )}

            {canUpdateImage && (
              <Button
                size='sm'
                variant='secondary'
                className='absolute right-2 bottom-2'
                disabled={isUpdatingImage}
                onClick={updateVehicleImage}
              >
                {isUpdatingImage ? <Spinner variant='circle' /> : <RefreshCw />}
                Update Image
              </Button>
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
                  value={plate}
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
          initialPlate={plate}
          initialRange={undefined}
          initialParams={buildPlateSearchParams(plate, undefined, 1)}
        />
      )}
    </>
  )
}