import { IconId } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { type Article } from "@/models/articles-model"

type Props = {
  open: boolean
  onClose: () => void
  article: Article | null
}

export function SeasonParkerModal({ open, onClose, article }: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <IconId className="size-5" />
            </div>
            {article?.title ?? "Season Parker"}
          </DialogTitle>
        </DialogHeader>

        {/* TODO: season parker content goes here */}
        <div className="py-6 text-center text-sm text-muted-foreground">
          Season parker content
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}