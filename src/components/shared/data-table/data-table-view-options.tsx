import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const { t } = useTranslation()
  return (
    <div className='flex gap-2'>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            className='hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary/90 ml-auto hidden h-9 lg:flex'
          >
            <MixerHorizontalIcon className='mr-2 h-4 w-4' />
            {t('view')}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[175px]'>
          <DropdownMenuLabel>{t('toggle_columns')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== 'undefined' && column.getCanHide()
            )
            .map((column) => {
              const labelKey = column.columnDef.meta?.label ?? column.id
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className='cursor-pointer capitalize'
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {labelKey}
                </DropdownMenuCheckboxItem>
              )
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
