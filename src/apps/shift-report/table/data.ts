import { useCallback } from 'react'
import { IconEye, IconEyeOff } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { ApiSearchParams } from '@/models/api'
import { ShiftReportDialogEnum } from '@/models/shift-report-model'
import { useShiftReportStore } from '@/stores/shift-report-store'

export const useShiftReportToolbarProps = () => {
  const { t } = useTranslation()
  const {
    setQueryParams,
    isAmountsUnlocked,
    setAmountsUnlocked,
    setOpen,
  } = useShiftReportStore()

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
      label: isAmountsUnlocked ? t('hide_amounts') : t('show_amounts'),
      icon: isAmountsUnlocked ? IconEyeOff : IconEye,
      variant: 'outline' as const,
      onClick: () =>
        isAmountsUnlocked ? setAmountsUnlocked(false) : setOpen(ShiftReportDialogEnum.EVALUATION),
    },
  }
}