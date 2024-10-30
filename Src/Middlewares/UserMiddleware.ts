import {
  IResponseProps,
  StoreResponse,
  UpdateUserImageResponse,
  UserProfileResponse,
} from "../Types/ResponseTypes";
import { apiCallWithToken } from "./AuthMiddleware";
import { IAuthObj } from "../Types/AuthContextTypes";
import { IProfileProps } from "../Types/ProfileScreenTypes";
import { getAdminRecentActivityQueryParams } from "../Types/AdminHomeScreenTypes";
import { IImageProps } from "../Types/ImageTypes";

export const getUserProfile = async (
  auth: IAuthObj,
  updateAccessToken: (accessToken: string) => void
): Promise<IResponseProps<UserProfileResponse>> => {
  // console.log("getUserProfile Process");
  const apiOptions = {
    method: "GET",
  };

  const result = await apiCallWithToken<UserProfileResponse>(
    "/user/getUserProfile",
    apiOptions,
    auth,
    updateAccessToken
  );
  // console.log(result);

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};

export const updateUserProfileImage = async (
  auth: IAuthObj,
  updateAccessToken: (accessToken: string) => void,
  data: IImageProps
): Promise<IResponseProps<UpdateUserImageResponse>> => {
  console.log("updateUserProfile Process");
  const apiOptions = {
    method: "POST",
    data,
  };

  const result = await apiCallWithToken<UpdateUserImageResponse>(
    "/user/updateUserImage",
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

export const updateUserProfile = async (
  auth: IAuthObj,
  updateAccessToken: (accessToken: string) => void,
  data: IProfileProps
): Promise<IResponseProps<{}>> => {
  console.log("updateUserProfile Process");
  const apiOptions = {
    method: "POST",
    data,
  };

  const result = await apiCallWithToken<{}>(
    "/user/updateUserProfile",
    apiOptions,
    auth,
    updateAccessToken
  );
  console.log(result);

  return {
    status: result.status,
    message: result.message,
  };
};

export const fetchUserStores = async (
  auth: IAuthObj,
  updateAccessToken: (accessToken: string) => void
): Promise<IResponseProps<StoreResponse[]>> => {
  //console.log("getUserStores Process");

  const apiOptions = {
    method: "GET",
  };

  const result = await apiCallWithToken<StoreResponse[]>(
    "/store/getStoresByUserId",
    apiOptions,
    auth,
    updateAccessToken
  );
  //console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};

export const getAdminRecentActivity = async (
  auth: IAuthObj,
  updateAccessToken: (accessToken: string) => void,
  data: getAdminRecentActivityQueryParams
): Promise<IResponseProps<StoreResponse[]>> => {
  console.log(`getAdminRecentActivity ${data.activity} Process`);

  const apiOptions = {
    method: "GET",
    activity: data.activity,
  };

  const result = await apiCallWithToken<StoreResponse[]>(
    "/user/getAdminRecentActivity",
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
