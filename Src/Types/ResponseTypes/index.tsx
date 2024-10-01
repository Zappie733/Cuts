export interface IResponseProps<T = {}> {
  status: number;
  data?: T;
  message: string;
}

export * from "./AuthResponse";
export * from "./UserResponse";
