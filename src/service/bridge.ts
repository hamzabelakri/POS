import axiosApi from "@/lib/axios";
import type {
  CaptureResponse,
  UpdateImagePayload,
  UpdateImageResponse,
} from "@/models/bridge-model";

export const UPDATE_IMAGE_ENDPOINT = `/bridge/update-image`;
export const CAPTURE_ENDPOINT = `/bridge/capture`;

// PUT /bridge/update-image
export const updateImage = async (
  payload: UpdateImagePayload
): Promise<UpdateImageResponse> => {
  const response = await axiosApi.put(UPDATE_IMAGE_ENDPOINT, payload);
  return response.data;
};

// POST /bridge/capture (no body)
export const captureImage = async (): Promise<CaptureResponse> => {
  const response = await axiosApi.post(CAPTURE_ENDPOINT);
  return response.data;
};