import axiosApi from "@/lib/axios";
import { ConsultResponse, SearchCar } from "@/models/consult-model";

export const CONSULT_ENDPOINT = `/consult`;

// Proceeds with the car picked from the search results.
export const consult = async (car: SearchCar): Promise<ConsultResponse> => {
  const response = await axiosApi.post(CONSULT_ENDPOINT, car, {
    params: { search: true },
  });
  return response.data;
};