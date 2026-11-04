import { useCallback } from 'react'
import { ApiSearchParams } from '@/models/api'
import { ShiftReportDialogEnum } from '@/models/shift-report-model'
import { IconEye, IconEyeOff } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { useEvaluationStore } from '@/stores/evaluation-store'
import { useShiftReportStore } from '@/stores/shift-report-store'

export const useShiftReportToolbarProps = () => {
  const { t } = useTranslation()
  const { setQueryParams, setOpen } = useShiftReportStore()
  const isEvaluated = useEvaluationStore((s) => s.isEvaluated)
  const setEvaluated = useEvaluationStore((s) => s.setEvaluated)

  // DataTableSearch always sends { search, page: 1 }, but this API expects `lpn`.
  // useCallback keeps the reference stable: DataTableSearch re-runs its effect
  // whenever setQueryParams changes, so a new function on every render would loop.
  const setSearchQueryParams = useCallback(
    ({ search, ...rest }: ApiSearchParams) =>
      setQueryParams({ ...rest, lpn: search || undefined }),
    [setQueryParams]
  )

  return {
    tableSearchProps: {
      placeholder: t('search_lpn'),
      setQueryParams: setSearchQueryParams,
    },
    // Locked: opens the password modal. Unlocked: the same button hides amounts again.
    extraAction: {
      label: isEvaluated ? t('hide_amounts') : t('show_amounts'),
      icon: isEvaluated ? IconEyeOff : IconEye,
      variant: 'outline' as const,
      onClick: () =>
        isEvaluated
          ? setEvaluated(false)
          : setOpen(ShiftReportDialogEnum.EVALUATION),
    },
  }
}
