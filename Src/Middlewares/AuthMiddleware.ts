import axios from "axios";
import { API_HOST, API_PORT } from "../Config/Api";

import { IRegistrationProps } from "../Types/RegisterScreenTypes";
import { IChangePasswordProps, ILoginProps } from "../Types/LoginScreenTypes";
import {
  IResponseProps,
  LoginDataResponse,
  GetNewAccessTokenResponse,
} from "../Types/ResponseTypes";
import { IAuthObj } from "../Types/AuthContextTypes";

export const registerUser = async ({
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  phone,
  role,
}: IRegistrationProps) => {
  try {
    const registerData: IRegistrationProps = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      confirmPassword,
      phone,
      role,
    };

    const result = await axios.post(
      `http://${API_HOST}:${API_PORT}/user/registerUser`,
      registerData
    );
    console.log(JSON.stringify(result, null, 2));

    const { status, data } = result;

    return <IResponseProps>{
      status,
      message: data.message,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Axios Error message:", error.message);
      return <IResponseProps>{
        status: error.status,
        message: error.response?.data.message,
      };
    } else {
      console.log("Unexpected error:", error);
      return <IResponseProps>{
        status: 500,
        message: "Unexpected Error Occurred",
      };
    }
  }
};

export const loginUser = async ({
  email,
  password,
}: ILoginProps): Promise<IResponseProps<LoginDataResponse>> => {
  try {
    const loginData: ILoginProps = {
      email: email.toLowerCase(),
      password,
    };

    const result = await axios.post(
      `http://${API_HOST}:${API_PORT}/user/loginUser`,
      loginData
    );

    const { status, data } = result;

    return {
      status: status,
      data: data.data,
      message: data.message,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Axios Error message:", error.message);
      return {
        status: error.status ? error.status : 500,
        message: error.response?.data.message,
      };
    } else {
      console.log("Unexpected error:", error);
      return {
        status: 500,
        message: "Unexpected Error Occurred",
      };
    }
  }
};

export const changeUserPassword = async ({
  email,
  password,
}: IChangePasswordProps) => {
  try {
    const changePasswordData: IChangePasswordProps = {
      email,
      password,
    };

    const result = await axios.post(
      `http://${API_HOST}:${API_PORT}/user/changeUserPassword`,
      changePasswordData
    );
    console.log(JSON.stringify(result, null, 2));

    const { status, data } = result;

    return <IResponseProps>{
      status,
      message: data.message,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Axios Error message:", error.message);
      return {
        status: error.status ? error.status : 500,
        message: error.response?.data.message,
      };
    } else {
      console.log("Unexpected error:", error);
      return {
        status: 500,
        message: "Unexpected Error Occurred",
      };
    }
  }
};

export const logoutUser = async (refreshToken: string) => {
  try {
    const refreshTokenObj = {
      refreshToken,
    };
    const result = await axios.post(
      `http://${API_HOST}:${API_PORT}/user/logoutUser`,
      refreshTokenObj
    );
    console.log(JSON.stringify(result, null, 2));

    const { status, data } = result;

    return <IResponseProps>{
      status,
      message: data.message,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Axios Error message:", error.message);
      return {
        status: error.status ? error.status : 500,
        message: error.response?.data.message,
      };
    } else {
      console.log("Unexpected error:", error);
      return {
        status: 500,
        message: "Unexpected Error Occurred",
      };
    }
  }
};

export const getNewAccessToken = async (
  refreshToken: string
): Promise<IResponseProps<GetNewAccessTokenResponse>> => {
  try {
    const refreshTokenObj = {
      refreshToken,
    };
    const result = await axios.post(
      `http://${API_HOST}:${API_PORT}/user/getAccessToken`,
      refreshTokenObj
    );
    // console.log(JSON.stringify(result, null, 2));

    const { status, data } = result;

    return {
      status,
      data: data.data,
      message: data.message,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Axios Error message:", error.message);
      return {
        status: error.status ? error.status : 500,
        message: error.response?.data.message,
      };
    } else {
      console.log("Unexpected error:", error);
      return {
        status: 500,
        message: "Unexpected Error Occurred",
      };
    }
  }
};

export const apiCallWithToken = async <T>(
  endpoint: string,
  options: {
    method: string;
    data?: any; // For POST, PUT requests
    headers?: any;
    limit?: number;
    offset?: number;
  } = { method: "GET" }, // Default to GET if no method is provided
  auth: IAuthObj,
  updateAccessToken: (accessToken: string) => void
): Promise<IResponseProps<T>> => {
  let accessToken = auth.accessToken;

  // Construct query parameters for limit and offset if provided
  const params = new URLSearchParams();

  if (options.limit !== undefined) {
    params.append("limit", options.limit.toString());
  }

  if (options.offset !== undefined) {
    params.append("offset", options.offset.toString());
  }

  // Append query parameters to the endpoint URL if they exist
  const url = `http://${API_HOST}:${API_PORT}${endpoint}${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  try {
    const response = await axios({
      // url: `http://${API_HOST}:${API_PORT}${endpoint}`,
      url,
      method: options.method, // Use the method from options (GET, POST, etc.)
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...options.headers, // Spread any additional headers passed
      },
      data: options.data, // Include the data for POST, PUT, etc.
    });
    const { status, data } = response;

    return {
      status: status,
      data: data.data as T,
      message: data.message,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Axios Error message:", error.message);

      if (error.status === 401) {
        console.log("access token expired");
        const result = await getNewAccessToken(auth.refreshToken);

        if (result.status === 402) {
          console.log("refresh token also expired");
          return {
            status: result.status,
            message: "Your session has expired, please relogin.",
          };
        }

        console.log("new access token");
        if (result.data) accessToken = result.data?.accessToken;
        updateAccessToken(accessToken);

        try {
          const retryResponse = await axios({
            url: `http://${API_HOST}:${API_PORT}${endpoint}`,
            method: options.method,
            headers: {
              Authorization: `Bearer ${accessToken}`,
              ...options.headers,
            },
            data: options.data,
          });
          const { status, data } = retryResponse;

          return {
            status: status,
            data: data.data as T,
            message: data.message,
          };
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.log("Axios Error message:", error.message);
            return {
              status: error.status ? error.status : 500,
              message: error.response?.data.message,
            };
          } else {
            console.log("Unexpected error:", error);
            return {
              status: 500,
              message: "Unexpected Error Occurred",
            };
          }
        }
      }

      return {
        status: error.status ? error.status : 500,
        message: error.response?.data.message,
      };
    } else {
      console.log("Unexpected error:", error);
      return {
        status: 500,
        message: "Unexpected Error Occurred",
      };
    }
  }
};
