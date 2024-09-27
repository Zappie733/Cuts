import axios from "axios";
import { API_HOST, API_PORT } from "../Config/Api";

import { IRegistrationProps } from "../Types/RegisterScreenTypes";
import { ILoginProps } from "../Types/LoginScreenTypes";
import { IResponseProps } from "../Types/ResponseTypes";
import { LoginDataResponse } from "../Types/ResponseTypes/AuthResponse";

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
      email,
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
