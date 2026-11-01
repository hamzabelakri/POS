import axiosApi from "@/lib/axios";
import {
  ConfigurePosVariables,
  PosConfigResponse,
} from "@/models/pos-config-model";

export const POS_CONFIG_ENDPOINT = `/pos/config`;

// Same endpoint for both buttons: save=false tests the connection,
// save=true tests it and persists the configuration.
export const configurePos = async ({
  payload,
  save,
}: ConfigurePosVariables): Promise<PosConfigResponse> => {
  const response = await axiosApi.post(POS_CONFIG_ENDPOINT, payload, {
    params: { save },
  });
  return response.data;
};