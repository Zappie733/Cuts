export interface IResponseProps<T = {}> {
  status: number;
  data?: T;
  message: string;
}

export * from "./UserResponse";
export * from "./AppResponse";
