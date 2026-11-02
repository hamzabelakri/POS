import { useEffect, useMemo } from 'react'
import {
  IconCash,
  IconInfoCircle,
  IconListDetails,
  IconReceipt2,
  IconReportMoney,
} from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { useShiftReportStore } from '@/stores/shift-report-store'
import { useShiftReport } from '@/hooks/use-shift-report'
import { Card } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Main } from '@/components/layout/main'
import { DataTable } from '@/components/shared/data-table'
import { useShiftReportToolbarProps } from './table/data'
import {
  formatAmount,
  useShiftReportColumns,
} from './table/report-columns'
import { ShiftReportModals } from './shift-report-modal'

export function ShiftReport() {
  const { t } = useTranslation()
  const shiftId = useAuthStore((state) => state.shift?.id)
  const { queryParams, setQueryParams, isAmountsUnlocked, setAmountsUnlocked } =
    useShiftReportStore()
  // lock the amounts again when leaving the page
  useEffect(() => () => setAmountsUnlocked(false), [setAmountsUnlocked])

  const { data: reportResponse, isLoading } = useShiftReport(
    shiftId,
    queryParams
  )
  const report = reportResponse?.data
  const data = useMemo(() => report?.shift_report_rows ?? [], [report])
  const toolbarProps = useShiftReportToolbarProps()
  const columns = useShiftReportColumns()

  return (
    <>
      <Main>
        <div className='mb-2 flex flex-wrap items-center space-x-2'>
          <div className='bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
            <IconReceipt2 className='size-5' />
          </div>

          <h2 className='text-2xl font-bold tracking-tight'>
            {t('shift_report')}
            {shiftId ? ` #${shiftId}` : ''}
          </h2>
        </div>

        <div className='mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <Card className='bg-card text-card-foreground gap-0 rounded-xl border p-0 shadow-sm'>
            <div className='flex flex-row items-center justify-between space-y-0 p-6 pt-4 pb-2'>
              <div className='flex items-center gap-2 text-sm font-medium tracking-tight'>
                <IconReportMoney className='size-5' />
                {t('total_turnover')}
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <IconInfoCircle
                    size={24}
                    strokeWidth={1.25}
                    className='text-muted-foreground'
                  />
                </TooltipTrigger>

                <TooltipContent>{t('total_turnover_tooltip')}</TooltipContent>
              </Tooltip>
            </div>
            <div className='p-6 pt-0 pb-4'>
              <div className='text-2xl font-bold'>
                {isAmountsUnlocked ? formatAmount(report?.total_turnover ?? 0) : '••••••'}
              </div>
            </div>
          </Card>
          <Card className='bg-card text-card-foreground gap-0 rounded-xl border p-0 shadow-sm'>
            <div className='flex flex-row items-center justify-between space-y-0 p-6 pt-4 pb-2'>
              <div className='flex items-center gap-2 text-sm font-medium tracking-tight'>
                <IconCash className='size-5' />
                {t('total_cash')}
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <IconInfoCircle
                    size={24}
                    strokeWidth={1.25}
                    className='text-muted-foreground'
                  />
                </TooltipTrigger>

                <TooltipContent>{t('total_cash_tooltip')}</TooltipContent>
              </Tooltip>
            </div>
            <div className='p-6 pt-0 pb-4'>
              <div className='text-2xl font-bold'>
                {isAmountsUnlocked ? formatAmount(report?.total_cash ?? 0) : '••••••'}
              </div>
            </div>
          </Card>
          <Card className='bg-card text-card-foreground gap-0 rounded-xl border p-0 shadow-sm'>
            <div className='flex flex-row items-center justify-between space-y-0 p-6 pt-4 pb-2'>
              <div className='flex items-center gap-2 text-sm font-medium tracking-tight'>
                <IconListDetails className='size-5' />
                {t('total_payments')}
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <IconInfoCircle
                    size={24}
                    strokeWidth={1.25}
                    className='text-muted-foreground'
                  />
                </TooltipTrigger>

                <TooltipContent>{t('total_payments_tooltip')}</TooltipContent>
              </Tooltip>
            </div>
            <div className='p-6 pt-0 pb-4'>
              <div className='text-2xl font-bold'>{report?.total_rows ?? 0}</div>
            </div>
          </Card>
        </div>

        <div className='-mx-4 mt-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <DataTable
            data={data}
            columns={columns}
            toolbarProps={toolbarProps}
            isLoading={isLoading}
            queryParams={queryParams}
            setQueryParams={setQueryParams}
            pagination={report}
          />
        </div>
      </Main>
      <ShiftReportModals />
    </>
  )
}