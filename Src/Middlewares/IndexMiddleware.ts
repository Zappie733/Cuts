import axios from "axios";
import {
  GetNewAccessTokenResponse,
  IResponseProps,
} from "../Types/ResponseTypes";
import { API_HOST, API_PORT } from "../Config/Api";
import { ApiCallWithTokenProps } from "../Types/MiddleWareTypes";

export const handleAxiosError = (error: any): IResponseProps<any> => {
  if (axios.isAxiosError(error)) {
    console.log("Axios Error:", error.message);
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Unexpected Error Occurred",
    };
  }

  console.log("Unexpected Error:", error);
  return {
    status: 500,
    message: "Unexpected Error Occurred",
  };
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

    return {
      status: result.status,
      data: result.data.data,
      message: result.data.message,
    };
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const apiCallWithToken = async <T>({
  endpoint,
  auth,
  updateAccessToken,
  options = { method: "GET" },
}: ApiCallWithTokenProps): Promise<IResponseProps<T>> => {
  let accessToken = auth.accessToken;

  const queryParams = new URLSearchParams();
  if (options.queryParams) {
    Object.entries(options.queryParams).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
  }

  const url = `http://${API_HOST}:${API_PORT}${endpoint}${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const makeRequest = async (token: string) => {
    return axios({
      url,
      method: options.method || "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        ...options.headers, // Spread any additional headers passed
      },
      data: options.data, // Include the data for POST, PUT, etc.
    });
  };

  try {
    const response = await makeRequest(accessToken);
    return {
      status: response.status,
      data: response.data.data as T,
      message: response.data.message,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.status === 401) {
      console.log("Access token expired. Attempting refresh.");

      const result = await getNewAccessToken(auth.refreshToken);
      if (result.status === 402) {
        console.log("Refresh token also expired.");
        return {
          status: result.status,
          message: "Your session has expired, please relogin.",
        };
      }

      console.log("New access token retrieved.");
      if (result.data) {
        accessToken = result.data.accessToken;
        await updateAccessToken(accessToken);
      }

      try {
        const retryResponse = await makeRequest(accessToken);
        return {
          status: retryResponse.status,
          data: retryResponse.data.data as T,
          message: retryResponse.data.message,
        };
      } catch (retryError) {
        return handleAxiosError(retryError);
      }
    }

    return handleAxiosError(error);

    // if (axios.isAxiosError(error)) {
    //   console.log("Axios Error message:", error.message);

    //   if (error.status === 401) {
    //     console.log("access token expired");
    //     const result = await getNewAccessToken(auth.refreshToken);

    //     if (result.status === 402) {
    //       console.log("refresh token also expired");
    //       return {
    //         status: result.status,
    //         message: "Your session has expired, please relogin.",
    //       };
    //     }

    //     console.log("new access token");
    //     if (result.data) accessToken = result.data?.accessToken;
    //     updateAccessToken(accessToken);

    //     try {
    //       const retryResponse = await axios({
    //         url: `http://${API_HOST}:${API_PORT}${endpoint}`,
    //         method: options.method,
    //         headers: {
    //           Authorization: `Bearer ${accessToken}`,
    //           ...options.headers,
    //         },
    //         data: options.data,
    //       });
    //       const { status, data } = retryResponse;

    //       return {
    //         status: status,
    //         data: data.data as T,
    //         message: data.message,
    //       };
    //     } catch (error) {
    //       if (axios.isAxiosError(error)) {
    //         console.log("Axios Error message:", error.message);
    //         return {
    //           status: error.status ? error.status : 500,
    //           message: error.response?.data.message,
    //         };
    //       } else {
    //         console.log("Unexpected error:", error);
    //         return {
    //           status: 500,
    //           message: "Unexpected Error Occurred",
    //         };
    //       }
    //     }
    //   }

    //   return {
    //     status: error.status ? error.status : 500,
    //     message: error.response?.data.message,
    //   };
    // } else {
    //   console.log("Unexpected error:", error);
    //   return {
    //     status: 500,
    //     message: "Unexpected Error Occurred",
    //   };
    // }
  }
};
