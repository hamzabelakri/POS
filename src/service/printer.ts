import axiosApi from "@/lib/axios";
import { PrintReceiptResponse } from "@/models/printer-model";

export const PRINTER_ENDPOINT = `/printer`;

export const printLastReceipt = async (
  shiftId: number
): Promise<PrintReceiptResponse> => {
  const response = await axiosApi.post(
    `${PRINTER_ENDPOINT}/receipt/last/${shiftId}`
  );
  return response.data;
};