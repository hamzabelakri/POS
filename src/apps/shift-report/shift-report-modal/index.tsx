import { ShiftReportDialogEnum } from "@/models/shift-report-model";
import { useShiftReportStore } from "@/stores/shift-report-store";
import { EvaluationModal } from "./evaluation-modal";

export function ShiftReportModals() {
  const { open, setOpen } = useShiftReportStore();

  const handleCloseModal = () => setOpen(null);

  return (
    <>
      <EvaluationModal
        open={open === ShiftReportDialogEnum.EVALUATION}
        onClose={handleCloseModal}
      />
    </>
  );
}