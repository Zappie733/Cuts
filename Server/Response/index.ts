//genderal api response
export interface ResponseObj<T = {}> {
  error: boolean;
  data?: T;
  message: string;
}

export * from "./UserResponse";
export * from "./StoreResponse";
export * from "./OrderResponse";
export * from "./RatingResponse";
export * from "./AppResponse";
