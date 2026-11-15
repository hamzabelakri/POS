import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PanelDots } from './panel-dots'

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot='dialog' {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot='dialog-trigger' {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot='dialog-portal' {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot='dialog-close' {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot='dialog-overlay'
      className={cn(
        'fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal data-slot='dialog-portal'>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot='dialog-content'
        className={cn(
          // Position
          'fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%]',
          // Size (max-h gives DialogBody a ceiling so it scrolls, not the page)
          'max-h-[90vh] w-full max-w-[calc(100%-2rem)] sm:max-w-lg',
          // Shape & surface. No padding: header / body / footer own their spacing
          'flex flex-col overflow-hidden rounded-lg border bg-background shadow-lg',
          // Animation
          'duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          // Absolute, so it doesn't affect layout. Light styles for the dark header
          <DialogPrimitive.Close
            data-slot='dialog-close'
            className={cn(
              'absolute end-4 top-4 z-20',
              'flex size-7 items-center justify-center rounded-md',
              'text-white/80 transition-colors hover:bg-white/20 hover:text-white',
              'focus:ring-2 focus:ring-white/30 focus:outline-hidden',
              'disabled:pointer-events-none',
              "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            )}
          >
            <XIcon />
            <span className='sr-only'>Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

// Panel-style header: dark surface, glow, dotted overlay and an optional
// module icon. Owns its padding and bottom border.
// pe-12 leaves room for the absolute close button.
function DialogHeader({
  className,
  children,
  icon: Icon,
  ...props
}: React.ComponentProps<'div'> & {
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div
      data-slot='dialog-header'
      className={cn(
        'relative shrink-0 overflow-hidden bg-panel panel-glow text-white',
        'border-b border-white/10 px-6 py-5 pe-12',
        // Title/description set their own colors, so override them here
        '[&_[data-slot=dialog-title]]:text-white',
        '[&_[data-slot=dialog-description]]:text-white/70',
        className
      )}
      {...props}
    >
      <PanelDots />

      {/* Content sits above the dots */}
      <div className='relative z-10 flex items-center gap-4'>
        {Icon && (
          <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur-sm'>
            <Icon className='size-6' aria-hidden='true' />
          </div>
        )}
        <div className='flex min-w-0 flex-col gap-1'>{children}</div>
      </div>
    </div>
  )
}

// Scrollable content area between header and footer.
function DialogBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='dialog-body'
      className={cn('flex-1 overflow-y-auto px-6 py-5', className)}
      {...props}
    />
  )
}

// Owns its padding and top border. shrink-0 keeps it from being squeezed.
function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='dialog-footer'
      className={cn(
        'flex shrink-0 flex-col-reverse gap-2 border-t bg-muted/20 px-6 py-4',
        'sm:flex-row sm:items-center sm:justify-end',
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot='dialog-title'
      className={cn('text-lg leading-tight font-semibold', className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot='dialog-description'
      className={cn('text-xs leading-relaxed text-muted-foreground', className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}