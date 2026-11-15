import type { ComponentType } from 'react'
import { useMemo } from 'react'
import {
  ArrowLeftRight,
  Banknote,
  EyeClosed,
  Lock,
  Package,
  Unlock,
  Wallet,
  type LucideProps,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { useEvaluationStore } from '@/stores/evaluation-store'
import { useShiftReportStore } from '@/stores/shift-report-store'
import { useShiftReport } from '@/hooks/use-shift-report'
import { Main } from '@/components/layout/main'
import { DataTable } from '@/components/shared/data-table'
import { cn, formatAmount } from '@/lib/utils'
import { ShiftReportDialogEnum } from '@/models/shift-report-model'
import { ShiftReportModals } from './shift-report-modal'
import { useShiftReportToolbarProps } from './table/data'
import { useShiftReportColumns } from './table/report-columns'

type Icon = ComponentType<LucideProps>

type SubtitleTone = 'up' | 'warn' | 'muted'

type Kpi = {
  icon: Icon
  label: string
  value: string
  /** When true, the value is hidden while the report is locked */
  maskable?: boolean
  /** Optional line shown under the value; never masked */
  subtitle?: string
  /** Color of the subtitle; defaults to 'muted' */
  subtitleTone?: SubtitleTone
}

const subtitleToneClass: Record<SubtitleTone, string> = {
  up: 'text-emerald-400',
  warn: 'text-amber-400',
  muted: 'text-white/55',
}

function ControlCenterBanner({
  title = 'Transaction Details',
  kpis,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
  masked = false,
  embedded = false,
  className,
}: {
  title?: string
  kpis: Kpi[]
  actionLabel: string
  actionIcon?: Icon
  onAction?: () => void
  /** Hides every `maskable` KPI value */
  masked?: boolean
  /** Removes the banner's own rounding so a parent card can clip it */
  embedded?: boolean
  className?: string
}) {
  return (
    <section
      className={cn(
        'relative overflow-hidden bg-gradient-to-br from-[#0b2a4d] via-[#081f3b] to-[#040f20] p-6 text-white lg:px-8 lg:py-7',
        embedded ? 'rounded-none' : 'rounded-xl',
        className
      )}
    >
      {/* blue glow, top right */}
      <div
        aria-hidden
        className='pointer-events-none absolute -top-24 right-0 size-80 rounded-full bg-sky-500/15 blur-3xl'
      />
      {/* warm glow, bottom left */}
      <div
        aria-hidden
        className='pointer-events-none absolute -bottom-24 left-24 size-64 rounded-full bg-amber-500/10 blur-3xl'
      />

      <div className='relative'>
        {/* Header: title + action button */}
        <div className='flex items-center justify-between gap-4'>
          <h1 className='text-xl font-bold tracking-tight lg:text-2xl'>
            {title}
          </h1>
          <button
            type='button'
            onClick={onAction}
            className='inline-flex shrink-0 items-center gap-2 rounded-md border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none'
          >
            {ActionIcon && <ActionIcon className='size-4' />}
            {actionLabel}
          </button>
        </div>

        {/* KPIs */}
        <div className='mt-5 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/10 pt-5 lg:grid-cols-4'>
          {kpis.map(({ icon: KpiIcon, ...k }) => {
            const hidden = masked && k.maskable
            return (
              <div key={k.label} className='space-y-1.5'>
                <div className='flex items-center gap-2 text-sm font-medium tracking-wide text-white/70'>
                  <KpiIcon className='size-4' />
                  {k.label}
                </div>
                <div className='flex h-[28px] items-center text-2xl font-bold lg:text-[28px]'>
                  {hidden ? (
                    <EyeClosed className='size-6 text-white/40' />
                  ) : (
                    k.value
                  )}
                </div>
                {k.subtitle && (
                  <div
                    className={cn(
                      'text-xs',
                      subtitleToneClass[k.subtitleTone ?? 'muted']
                    )}
                  >
                    {k.subtitle}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function ShiftReport() {
  const { t } = useTranslation()
  const shiftId = useAuthStore((state) => state.shift?.id)
  const startAmount = useAuthStore((state) => state.shift?.start_amount)
  const { queryParams, setQueryParams, setOpen } = useShiftReportStore()
  const isEvaluated = useEvaluationStore((s) => s.isEvaluated)
  const setEvaluated = useEvaluationStore((s) => s.setEvaluated)

  const { data: reportResponse, isLoading } = useShiftReport(
    shiftId,
    queryParams
  )
  const report = reportResponse?.data
  const data = useMemo(() => report?.shift_report_rows ?? [], [report])
  const toolbarProps = useShiftReportToolbarProps()
  const columns = useShiftReportColumns()

  const kpis = useMemo<Kpi[]>(() => {
    const totalTransactions = report?.total_rows ?? 0
    const totalTurnover = report?.total_turnover ?? 0
    const totalCash = report?.total_cash ?? 0
    const start = startAmount ?? 0
    const shiftAmount = start + totalTurnover

    return [
      {
        icon: ArrowLeftRight,
        label: t('total_transactions'),
        value: String(totalTransactions),
      },
      {
        icon: Package,
        label: t('total_turnover'),
        value: formatAmount(totalTurnover),
        maskable: true,
      },
      {
        icon: Banknote,
        label: t('total_cash'),
        value: formatAmount(totalCash),
        maskable: true,
      },
      {
        icon: Wallet,
        label: t('shift_amount'),
        value: formatAmount(shiftAmount),
        subtitle: `${t('start_amount')}: ${formatAmount(start)}`,
        subtitleTone: 'up',
        maskable: true,
      },
    ]
  }, [
    report?.total_rows,
    report?.total_turnover,
    report?.total_cash,
    startAmount,
    t,
  ])

  return (
    <>
      <Main>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <DataTable
            data={data}
            columns={columns}
            toolbarProps={toolbarProps}
            isLoading={isLoading}
            queryParams={queryParams}
            setQueryParams={setQueryParams}
            pagination={report}
            header={
              <ControlCenterBanner
                embedded
                title={t('transaction_details')}
                kpis={kpis}
                masked={!isEvaluated}
                actionLabel={isEvaluated ? t('lock') : t('unlock')}
                actionIcon={isEvaluated ? Lock : Unlock}
                onAction={() =>
                  isEvaluated
                    ? setEvaluated(false)
                    : setOpen(ShiftReportDialogEnum.EVALUATION)
                }
              />
            }
          />
        </div>
      </Main>
      <ShiftReportModals />
    </>
  )
}