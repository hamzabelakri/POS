import type { ButtonHTMLAttributes, ComponentType, ReactNode } from 'react'
import { IconInfoCircle } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { BannerGrid } from '@/components/ui/banner-grid'

type BannerIcon = ComponentType<{ className?: string }>

export type PageBannerKpi = {
  icon: BannerIcon
  label: string
  value: ReactNode
  /** small line under the value, e.g. "+5.2% vs prior" */
  sub?: ReactNode
  subIcon?: BannerIcon
  /** colors the sub line: up = positive, warn = needs attention */
  tone?: 'up' | 'warn' | 'muted'
  /** shows an info icon next to the label with this text on hover */
  tooltip?: ReactNode
}

const subTone = {
  up: 'text-emerald-400',
  warn: 'text-amber-400',
  muted: 'text-white/55',
} as const

type PageBannerProps = {
  icon: BannerIcon
  title: ReactNode
  /** right side of the header, usually a <PageBannerButton /> */
  action?: ReactNode
  kpis: PageBannerKpi[]
  className?: string
}

export function PageBanner({
  icon: TitleIcon,
  title,
  action,
  kpis,
  className,
}: PageBannerProps) {
  return (
    <section
      className={cn(
        'bg-banner relative overflow-hidden rounded-xl p-6 text-white lg:px-8 lg:py-7',
        className
      )}
    >
      <BannerGrid />

      <div className='relative'>
        {/* Header: icon + title, action */}
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <span className='flex size-12 shrink-0 items-center justify-center rounded-lg border border-sky-400/20 bg-sky-500/20 text-sky-300'>
              <TitleIcon className='size-5' />
            </span>
            <h1 className='text-xl font-bold tracking-tight lg:text-2xl'>
              {title}
            </h1>
          </div>
          {action}
        </div>

        {/* KPIs: columns adapt to however many are passed */}
        <div className='mt-5 grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-x-6 gap-y-5 border-t border-white/10 pt-5'>
          {kpis.map(
            ({ icon: KpiIcon, subIcon: SubIcon, tone = 'muted', ...k }) => (
              <div key={k.label} className='space-y-1'>
                <div className='flex items-center gap-1.5 text-[11px] tracking-wide text-white/60 uppercase'>
                  <KpiIcon className='size-3.5' />
                  {k.label}
                  {k.tooltip && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <IconInfoCircle
                          size={14}
                          strokeWidth={1.5}
                          className='cursor-help text-white/50'
                        />
                      </TooltipTrigger>
                      <TooltipContent>{k.tooltip}</TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className='text-2xl font-bold lg:text-[28px]'>
                  {k.value}
                </div>
                {k.sub && (
                  <div
                    className={cn(
                      'flex items-center gap-1 text-[11px]',
                      subTone[tone]
                    )}
                  >
                    {SubIcon && <SubIcon className='size-3' />}
                    {k.sub}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  )
}

/** Translucent button that matches the banner (same look as "Export Report"). */
export function PageBannerButton({
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center gap-2 rounded-md border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none',
        className
      )}
      {...props}
    />
  )
}