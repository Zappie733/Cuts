import { IAuthObj } from "./ContextTypes/AuthContextTypes";

export interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  data?: any; // Payload for POST, PUT, etc.
  headers?: Record<string, string>; // Custom headers
  queryParams?: Record<string, any>; // Query parameters
}

export interface ApiRequestProps<T = void> {
  auth: IAuthObj;
  updateAccessToken: (accessToken: string) => void;
  data?: T;
  params?: Record<string, any>;
}

export interface ApiCallWithTokenProps {
  endpoint: string;
  options: ApiOptions;
  auth: IAuthObj;
  updateAccessToken: (accessToken: string) => void;
}
