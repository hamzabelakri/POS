import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function SetupBrand({ className, inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Replace with your logo asset */}
      <img src='/logo.png' alt='Posify' className='size-9 rounded-lg object-contain' />
      <span className={cn('text-sm font-semibold', inverse ? 'text-white/80' : 'text-muted-foreground')}>Setup</span>
    </div>
  )
}

/** Full-page shell: ambient glow, header (brand + actions slot) and a centred content area. */
export function SetupShell({ children, headerActions }: { children: ReactNode; headerActions?: ReactNode }) {
  return (
    <div className='bg-background text-foreground relative flex min-h-svh flex-col overflow-hidden'>
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_0%,color-mix(in_oklch,var(--brand)_18%,transparent),transparent)]'
      />
      <header className='relative z-10 flex items-center justify-between px-6 py-5'>
        <SetupBrand />
        <div className='flex items-center gap-2'>{headerActions}</div>
      </header>
      <main className='relative z-10 flex flex-1 flex-col items-center justify-center px-4 pt-2 pb-12'>
        {children}
      </main>
    </div>
  )
}