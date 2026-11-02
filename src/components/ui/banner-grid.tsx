import { cn } from '@/lib/utils'

/**
 * Decorative layers for the page banner: a faint dot texture plus two soft
 * glows. Purely visual, so it is hidden from assistive tech and ignores
 * pointer events. Render it as the first child of a `relative overflow-hidden`
 * container.
 */
export function BannerGrid({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0', className)}
    >
      {/* dot texture */}
      <div
        className='absolute inset-0 opacity-[0.07]'
        style={{
          backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />
      {/* indigo glow, top right */}
      <div className='absolute -top-20 -right-10 size-72 rounded-full bg-indigo-500/20 blur-3xl' />
      {/* sky glow, bottom centre */}
      <div className='absolute -bottom-24 left-1/2 size-72 rounded-full bg-sky-500/15 blur-3xl' />
    </div>
  )
}