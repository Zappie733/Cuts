import axios from "axios";
import { API_HOST, API_PORT } from "../Config/Api";

import { IRegistrationProps } from "../Types/RegisterScreenTypes";
import { ILoginProps } from "../Types/LoginScreenTypes";
import { IResponseProps } from "../Types/ResponseTypes";

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
      email,
      password,
      confirmPassword,
      phone,
      role,
    };

    const response = await axios.post(
      `http://${API_HOST}:${API_PORT}/user/registerUser`,
      registerData
    );

    return <IResponseProps>{
      status: response.status,
      response: {
        data: response.data.data,
        message: response.data.message,
      },
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Axios Error message:", error.message);
      return <IResponseProps>{
        status: error.status,
        response: {
          data: {},
          message: error.response?.data.message,
        },
      };
    } else {
      console.log("Unexpected error:", error);
      return <IResponseProps>{
        status: 500,
        response: {
          data: {},
          message: "Unexpected Error Occurred",
        },
      };
    }
  }
};

export const loginUser = async ({ email, password }: ILoginProps) => {
  try {
    const loginData: ILoginProps = {
      email,
      password,
    };

    const response = await axios.post(
      `http://${API_HOST}:${API_PORT}/user/loginUser`,
      loginData
    );

    return <IResponseProps>{
      status: response.status,
      response: {
        data: response.data.data,
        message: response.data.message,
      },
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Axios Error message:", error.message);
      return <IResponseProps>{
        status: error.status,
        response: {
          data: {},
          message: error.response?.data.message,
        },
      };
    } else {
      console.log("Unexpected error:", error);
      return <IResponseProps>{
        status: 500,
        response: {
          data: {},
          message: "Unexpected Error Occurred",
        },
      };
    }
  }
};
