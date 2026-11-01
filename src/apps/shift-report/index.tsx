import type { ComponentType } from 'react'
import {
  AlertTriangle,
  Clock,
  Download,
  Gauge,
  Landmark,
  Package,
  TrendingUp,
  type LucideProps,
} from 'lucide-react'
import { Main } from '@/components/layout/main'

type Icon = ComponentType<LucideProps>

type Kpi = {
  icon: Icon
  label: string
  value: string
  sub: string
  tone: 'up' | 'warn' | 'muted'
  subIcon?: Icon
}

// Replace with real data / props from your API
const KPIS: Kpi[] = [
  {
    icon: Package,
    label: 'TOTAL OUTPUT',
    value: '17,300',
    sub: '+5.2% vs prior',
    tone: 'up',
    subIcon: TrendingUp,
  },
  {
    icon: Gauge,
    label: 'EFFICIENCY',
    value: '92.4%',
    sub: '+8.7% vs prior',
    tone: 'up',
    subIcon: TrendingUp,
  },
  {
    icon: AlertTriangle,
    label: 'OPEN INCIDENTS',
    value: '34',
    sub: '34 need review',
    tone: 'warn',
    subIcon: AlertTriangle,
  },
  {
    icon: Clock,
    label: 'SHIFT PROGRESS',
    value: '62%',
    sub: 'Hour 5 of 8 · ends 22:00',
    tone: 'muted',
  },
]

const subTone = {
  up: 'text-emerald-400',
  warn: 'text-amber-400',
  muted: 'text-white/55',
} as const

function ControlCenterBanner({
  title = 'Shift Operations Control Center',
  kpis = KPIS,
  actionLabel = 'Export Report',
  onAction,
}: {
  title?: string
  kpis?: Kpi[]
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <section className='relative overflow-hidden rounded-xl bg-gradient-to-br from-[#06302a] via-[#04221d] to-[#03130f] p-6 text-white lg:px-8 lg:py-7'>
      {/* dot texture */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 opacity-[0.07]'
        style={{
          backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />
      {/* blue glow, top right */}
      <div
        aria-hidden
        className='pointer-events-none absolute -top-20 -right-10 size-72 rounded-full bg-blue-500/15 blur-3xl'
      />
      {/* green glow, bottom centre */}
      <div
        aria-hidden
        className='pointer-events-none absolute -bottom-24 left-1/2 size-72 rounded-full bg-emerald-500/15 blur-3xl'
      />

      <div className='relative'>
        {/* Header: icon + title, button */}
        <div className='flex items-center justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <span className='flex size-12 shrink-0 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-500/20 text-emerald-300'>
              <Landmark className='size-5' />
            </span>
            <h1 className='text-xl font-bold tracking-tight lg:text-2xl'>
              {title}
            </h1>
          </div>
          <button
            type='button'
            onClick={onAction}
            className='inline-flex shrink-0 items-center gap-2 rounded-md border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none'
          >
            <Download className='size-4' />
            {actionLabel}
          </button>
        </div>

        {/* KPIs */}
        <div className='mt-5 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/10 pt-5 lg:grid-cols-4'>
          {kpis.map(({ icon: KpiIcon, subIcon: SubIcon, ...k }) => (
            <div key={k.label} className='space-y-1'>
              <div className='flex items-center gap-1.5 text-[11px] tracking-wide text-white/55'>
                <KpiIcon className='size-3' />
                {k.label}
              </div>
              <div className='text-2xl font-bold lg:text-[28px]'>{k.value}</div>
              <div
                className={`flex items-center gap-1 text-[11px] ${subTone[k.tone]}`}
              >
                {SubIcon && <SubIcon className='size-3' />}
                {k.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ShiftReport() {
  return (
    <Main>
      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
        <ControlCenterBanner />
      </div>
    </Main>
  )
}