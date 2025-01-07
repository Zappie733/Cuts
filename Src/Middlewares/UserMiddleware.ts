import axios from "axios";
import { API_URL } from "../Config/Api";
import { IAuthObj } from "../Types/ContextTypes/AuthContextTypes";
import { apiCallWithToken, handleAxiosError } from "./IndexMiddleware";
import {
  GetAdminRecentActivityResponse,
  GetUserInfoForOrderByIdResponse,
  GetUserProfileResponse,
  IResponseProps,
  LoginResponse,
  UpdateUserProfileImageResponse,
} from "../Types/ResponseTypes";
import { IImageProps } from "../Types/ComponentTypes/ImageTypes";
import {
  ChangePasswordData,
  LoginData,
  ProfileData,
  RegistrationData,
} from "../Types/UserTypes";
import {
  ApiCallWithTokenProps,
  ApiOptions,
  ApiRequestProps,
} from "../Types/MiddleWareTypes";

export const registerUser = async ({
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  phone,
  role,
}: RegistrationData) => {
  try {
    const registerData: RegistrationData = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      confirmPassword,
      phone,
      role,
    };

    const result = await axios.post(
      `${API_URL}/user/registerUser`,
      registerData
    );
    //console.log(JSON.stringify(result, null, 2));

    return <IResponseProps>{
      status: result.status,
      message: result.data.message,
    };
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const loginUser = async ({
  email,
  password,
}: LoginData): Promise<IResponseProps<LoginResponse>> => {
  try {
    const loginData: LoginData = {
      email: email.toLowerCase(),
      password,
    };

    const result = await axios.post(`${API_URL}/user/loginUser`, loginData);

    return {
      status: result.status,
      data: result.data.data,
      message: result.data.message,
    };
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const changeUserPassword = async ({
  email,
  password,
}: ChangePasswordData) => {
  try {
    const changePasswordData: ChangePasswordData = {
      email,
      password,
    };

    const result = await axios.post(
      `${API_URL}/user/changeUserPassword`,
      changePasswordData
    );
    //console.log(JSON.stringify(result, null, 2));

    return <IResponseProps>{
      status: result.status,
      message: result.data.message,
    };
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const logoutUser = async (refreshToken: string) => {
  try {
    const refreshTokenObj = {
      refreshToken,
    };

    const result = await axios.post(
      `${API_URL}/user/logoutUser`,
      refreshTokenObj
    );
    //console.log(JSON.stringify(result, null, 2));

    return <IResponseProps>{
      status: result.status,
      message: result.data.message,
    };
  } catch (error) {
    return handleAxiosError(error);
  }
};

//-----------------------------------------------------
//-----------------------------------------------------

export const getUserProfile = async ({
  auth,
  updateAccessToken,
}: ApiRequestProps): Promise<IResponseProps<GetUserProfileResponse>> => {
  // console.log("getUserProfile Process");
  const apiOptions: ApiOptions = {
    method: "GET",
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/user/getUserProfile",
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken<GetUserProfileResponse>(
    apiCallWithTokenProps
  );
  // console.log(result);

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};

export const updateUserProfileImage = async ({
  auth,
  updateAccessToken,
  data,
}: ApiRequestProps<IImageProps>): Promise<
  IResponseProps<UpdateUserProfileImageResponse>
> => {
  // console.log("updateUserProfile Process");
  const apiOptions: ApiOptions = {
    method: "POST",
    data,
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/user/updateUserImage",
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken<UpdateUserProfileImageResponse>(
    apiCallWithTokenProps
  );

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};

export const updateUserProfile = async ({
  auth,
  updateAccessToken,
  data,
}: ApiRequestProps<ProfileData>): Promise<IResponseProps> => {
  // console.log("updateUserProfile Process");
  const apiOptions: ApiOptions = {
    method: "POST",
    data,
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/user/updateUserProfile",
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken(apiCallWithTokenProps);
  // console.log(result);

  return {
    status: result.status,
    message: result.message,
  };
};

export const getAdminRecentActivity = async ({
  auth,
  updateAccessToken,
  params,
}: ApiRequestProps): Promise<
  IResponseProps<GetAdminRecentActivityResponse>
> => {
  //console.log(`getAdminRecentActivity ${data} Process`);

  const apiOptions: ApiOptions = {
    method: "GET",
    queryParams: {
      activity: params?.activity,
    },
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/user/getAdminRecentActivity",
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken<GetAdminRecentActivityResponse>(
    apiCallWithTokenProps
  );
  // console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};

export const getUserInfoForOrderById = async ({
  auth,
  updateAccessToken,
  params, //userId
}: ApiRequestProps): Promise<
  IResponseProps<GetUserInfoForOrderByIdResponse>
> => {
  //console.log(`getUserInfoForOrderById Process`);

  const apiOptions: ApiOptions = {
    method: "GET",
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/user/getUserInfoForOrderById/${params?.userId}`,
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken<GetUserInfoForOrderByIdResponse>(
    apiCallWithTokenProps
  );
  // console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};
