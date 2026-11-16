import axiosApi from "@/lib/axios";
import { BarrierResponse } from "@/models/barrier-model";

export const BARRIERS_ENDPOINT = `/barriers`;
export const PAYMENTS_ENDPOINT = `/payments`;

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

export const retryOpenBarrier = async (): Promise<BarrierResponse> => {
  const response = await axiosApi.post(
    `${PAYMENTS_ENDPOINT}/retry-open-barrier`
  );
  return response.data;
};