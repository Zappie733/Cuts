import { IAuthObj } from "../Types/AuthContextTypes";
import { GetAppSummaryResponse, IResponseProps } from "../Types/ResponseTypes";
import { apiCallWithToken } from "./AuthMiddleware";

export const getAppSummary = async (
  auth: IAuthObj,
  updateAccessToken: (accessToken: string) => void
): Promise<IResponseProps<GetAppSummaryResponse>> => {
  console.log("get App Summary Process");
  const apiOptions = {
    method: "GET",
  };

  const result = await apiCallWithToken<GetAppSummaryResponse>(
    "/app/getAppSummary",
    apiOptions,
    auth,
    updateAccessToken
  );
  // console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};
