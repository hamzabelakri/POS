import { useMemo } from "react"
import { type ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { SearchCar } from "@/models/consult-model"

// "2026-09-01 08:22:04" -> "01/09/2026 08:22:04"
const formatEntryTime = (value?: string) => {
  const m = value?.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}:\d{2}:\d{2})/)
  return m ? `${m[3]}/${m[2]}/${m[1]} ${m[4]}` : value || "-"
}

export const useSearchColumns = ({
  onProceed,
  isProceeding,
}: {
  onProceed: (car: SearchCar) => void
  isProceeding: boolean
}) =>
  useMemo<ColumnDef<SearchCar>[]>(
    () => [
      {
        accessorKey: "license_plate",
        header: "License Plate",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.license_plate || "-"}</span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "external_unique_id",
        header: "EPAN",
        cell: ({ row }) => row.original.external_unique_id || "-",
        enableSorting: false,
      },
      {
        accessorKey: "card_type",
        header: "Card Type",
        cell: ({ row }) => row.original.card_type || "-",
        enableSorting: false,
      },
      {
        accessorKey: "entry_unit",
        header: "Entry Lane",
        enableSorting: false,
      },
      {
        accessorKey: "entry_time",
        header: "Entry Time",
        cell: ({ row }) => formatEntryTime(row.original.entry_time),
        enableSorting: false,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            size="sm"
            disabled={isProceeding}
            onClick={() => onProceed(row.original)}
          >
            Proceed
          </Button>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [onProceed, isProceeding]
  )