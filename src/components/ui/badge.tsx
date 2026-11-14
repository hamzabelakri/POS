import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border border-transparent px-2 py-0.5 text-xs font-medium capitalize w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow,background-color] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'bg-primary/15 text-accent-foreground [a&]:hover:bg-primary/25',
        secondary:
          'bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/80',
        destructive: 'text-xs font-medium bg-red-500/15 text-red-700 dark:text-red-400',
        outline:
          'border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        success: 'text-xs font-medium bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
        info: 'text-xs font-medium bg-sky-500/15 text-sky-700 dark:text-sky-400',
        warning: 'text-xs font-medium bg-amber-500/15 text-amber-700 dark:text-amber-400',
        purple: 'text-xs font-medium bg-purple-500/15 text-purple-700 dark:text-purple-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot='badge'
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }