import axiosApi from "@/lib/axios";
import { BarrierResponse } from "@/models/barrier-model";

export const BARRIERS_ENDPOINT = `/barriers`;

export const openBarrier = async (): Promise<BarrierResponse> => {
  const response = await axiosApi.post(`${BARRIERS_ENDPOINT}/open`);
  return response.data;
};

export const closeBarrier = async (): Promise<BarrierResponse> => {
  const response = await axiosApi.post(`${BARRIERS_ENDPOINT}/close`);
  return response.data;
};

export const lockBarrier = async (): Promise<BarrierResponse> => {
  const response = await axiosApi.post(`${BARRIERS_ENDPOINT}/lock`);
  return response.data;
};

export const unlockBarrier = async (): Promise<BarrierResponse> => {
  const response = await axiosApi.post(`${BARRIERS_ENDPOINT}/unlock`);
  return response.data;
};