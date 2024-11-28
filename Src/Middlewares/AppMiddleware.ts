import { IAuthObj } from "../Types/ContextTypes/AuthContextTypes";
import {
  ApiCallWithTokenProps,
  ApiOptions,
  ApiRequestProps,
} from "../Types/MiddleWareTypes";
import { GetAppSummaryResponse, IResponseProps } from "../Types/ResponseTypes";
import { apiCallWithToken } from "./IndexMiddleware";

export const getAppSummary = async ({
  auth,
  updateAccessToken,
}: ApiRequestProps): Promise<IResponseProps<GetAppSummaryResponse>> => {
  // console.log("get App Summary Process");
  const apiOptions: ApiOptions = {
    method: "GET",
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/app/getAppSummary",
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken<GetAppSummaryResponse>(
    apiCallWithTokenProps
  );
  // console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};
