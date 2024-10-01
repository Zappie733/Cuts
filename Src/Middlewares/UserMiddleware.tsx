import axios from "axios";
import { API_HOST, API_PORT } from "../Config/Api";
import { IResponseProps, UserProfileResponse } from "../Types/ResponseTypes";
import { apiCallWithToken } from "./AuthMiddleware";
import { IAuthObj } from "../Types/AuthContextTypes";

export const getUserProfile = async (
  auth: IAuthObj,
  updateAccessToken: (accessToken: string) => void
): Promise<IResponseProps<UserProfileResponse>> => {
  console.log("getUserProfile Process");
  const apiOptions = {
    method: "GET",
  };

  const result = await apiCallWithToken<UserProfileResponse>(
    "/user/getUserProfile",
    apiOptions,
    auth,
    updateAccessToken
  );
  console.log(result);

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};
