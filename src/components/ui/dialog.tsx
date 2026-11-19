'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Root ─────────────────────────────────────────────────────────

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

// ── Overlay ───────────────────────────────────────────────────────

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot='dialog-overlay'
      className={cn(
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
        className
      )}
      {...props}
    />
  )
}

// ── Content ───────────────────────────────────────────────────────

function DialogContent({
  className,
  children,
  showCloseButton = false,
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
          // Size
          'w-full max-w-[calc(100%-2rem)] sm:max-w-lg',
          // max-h gives the flex column a ceiling so DialogBody can scroll
          // instead of the page behind it
          'max-h-[90vh]',
          // Shape & surface
          'bg-background rounded-xl border shadow-xl',
          // Layout — no padding on the container itself;
          // header / body / footer each own their spacing
          'flex flex-col overflow-hidden',
          // Animation
          'duration-200',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            className={cn(
              'absolute end-4 top-5.5 z-20',
              'flex size-7 items-center justify-center rounded-md',
              'text-white/80 transition-colors hover:bg-white/20 hover:text-white',
              'focus:ring-2 focus:ring-white/30 focus:outline-none',
              'disabled:pointer-events-none',
              "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            )}
          >
            <XIcon />
            <span className='sr-only'>Close</span>
          </DialogPrimitive.Close>
        )}

        {/* Close button — absolute so it doesn't affect layout */}
        <DialogPrimitive.Close
          className={cn(
            'absolute end-4 top-5.5 z-20',
            'flex size-7 items-center justify-center rounded-md',
            'text-panel-close transition-colors',
            'hover:bg-panel-close-hover hover:text-white',
            'focus-visible:ring-panel-close-ring focus-visible:ring-2 focus-visible:outline-none',
            'disabled:pointer-events-none',
            "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          )}
        >
          <XIcon />
          <span className='sr-only'>Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

// ── Header ────────────────────────────────────────────────────────
// Owns its own padding + bottom border.
// pr-10 leaves room for the absolute close button.

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
        'bg-panel relative flex shrink-0 items-center gap-3 overflow-hidden text-white',
        // pe-14 leaves room for the absolute close button
        'ps-6 pe-14 pt-5 pb-4',
        '**:data-[slot=dialog-title]:text-white',
        '**:data-[slot=dialog-description]:text-white/70',
        className
      )}
      {...props}
    >
      {/* cool glow, top right */}
      <div
        aria-hidden
        className='bg-panel-glow-cool pointer-events-none absolute -top-24 right-0 size-80 rounded-full blur-3xl'
      />
      {/* warm glow, bottom left */}
      <div
        aria-hidden
        className='bg-panel-glow-warm pointer-events-none absolute -bottom-24 left-24 size-64 rounded-full blur-3xl'
      />

      {Icon && (
        <div className='relative flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10'>
          <Icon className='size-5' />
        </div>
      )}

      <div className='relative flex min-w-0 flex-col gap-1'>{children}</div>
    </div>
  )
}

// ── Body ──────────────────────────────────────────────────────────
// Scrollable content area. flex-1 fills the space between header
// and footer; overflow-y-auto scrolls when content overflows.

function DialogBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='dialog-body'
      className={cn('flex-1 overflow-y-auto', 'px-6 py-5', className)}
      {...props}
    />
  )
}

// ── Footer ────────────────────────────────────────────────────────
// Owns its own padding + top border. shrink-0 ensures it never
// gets squeezed when the body content is tall.

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='dialog-footer'
      className={cn(
        'flex shrink-0 items-center justify-end gap-2',
        'px-6 py-4',
        'bg-muted/20 border-t',
        className
      )}
      {...props}
    />
  )
}

// ── Title ─────────────────────────────────────────────────────────

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot='dialog-title'
      className={cn(
        'text-foreground text-lg leading-tight font-semibold',
        className
      )}
      {...props}
    />
  )
}

// ── Description ───────────────────────────────────────────────────

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot='dialog-description'
      className={cn('text-muted-foreground text-xs leading-relaxed', className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
