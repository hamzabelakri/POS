import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { consult } from "@/service/consult";
import { ConsultResponse, SearchCar } from "@/models/consult-model";
import { ApiError } from "@/models/api";
import { AlertEnum } from "@/models/alert-model";
import { useAlertStore } from "@/stores/alert-store";

// The variable is the car picked in the search results.
export function useConsult() {
  const { showAlert } = useAlertStore();

  return useMutation<ConsultResponse, AxiosError<ApiError>, SearchCar>({
    mutationFn: consult,
    onError: (error) => {
      console.error("Consult failed: ", error?.response?.data?.error);
      showAlert({
        message:
          error?.response?.data?.error || "Unable to proceed. Please try again.",
        type: AlertEnum.ERROR,
      });
    },
  });
}