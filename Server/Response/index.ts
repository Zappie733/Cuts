//genderal api response
export interface ResponseObj<T = {}> {
  error: boolean;
  data?: T;
  message: string;
}

export * from "./UserResponse";
