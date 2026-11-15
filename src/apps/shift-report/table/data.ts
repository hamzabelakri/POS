import { useCallback } from 'react'
import { ApiSearchParams } from '@/models/api'
import { useTranslation } from 'react-i18next'
import { useShiftReportStore } from '@/stores/shift-report-store'

export const useShiftReportToolbarProps = () => {
  const { t } = useTranslation()
  const { setQueryParams } = useShiftReportStore()

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
  }
}