import {
  ApiCallWithTokenProps,
  ApiOptions,
  ApiRequestProps,
} from "../Types/MiddleWareTypes";
import { AddOrderData, RejectOrderData } from "../Types/OrderTypes";
import { IResponseProps } from "../Types/ResponseTypes";
import {
  GetOrderforScheduleResponse,
  GetOrdersByStatusResponse,
  GetStoreOrderHistoryResponse,
} from "../Types/ResponseTypes/OrderResponse";
import { apiCallWithToken } from "./IndexMiddleware";

export const addOrder = async ({
  auth,
  updateAccessToken,
  data,
}: ApiRequestProps<AddOrderData>): Promise<IResponseProps> => {
  // console.log("addOrder Process");
  const apiOptions: ApiOptions = {
    method: "POST",
    data,
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/order/addOrder",
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken(apiCallWithTokenProps);

  return {
    status: result.status,
    message: result.message,
  };
};

//dipake oleh user dan store
export const getOrdersByStatus = async ({
  auth,
  updateAccessToken,
  params, //limit, offset, status
}: ApiRequestProps): Promise<IResponseProps<GetOrdersByStatusResponse>> => {
  // console.log("getOrdersByStatus Process");
  const apiOptions: ApiOptions = {
    method: "GET",
    queryParams: {
      limit: params?.limit,
      offset: params?.offset,
      status: params?.status,
    },
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/order/getOrdersByStatus",
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken<GetOrdersByStatusResponse>(
    apiCallWithTokenProps
  );

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};

export const getStoreOrderHistory = async ({
  auth,
  updateAccessToken,
  params, //limit, offset, month, year
}: ApiRequestProps): Promise<IResponseProps<GetStoreOrderHistoryResponse>> => {
  // console.log("getStoreOrderHistory Process");
  const apiOptions: ApiOptions = {
    method: "GET",
    queryParams: {
      limit: params?.limit,
      offset: params?.offset,
      month: params?.month,
      year: params?.year,
    },
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/order/getStoreOrderHistory",
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken<GetStoreOrderHistoryResponse>(
    apiCallWithTokenProps
  );

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};

//dipake oleh user dan store
export const getOrderforSchedule = async ({
  auth,
  updateAccessToken,
  params, // storeid, limit, offset
}: ApiRequestProps): Promise<IResponseProps<GetOrderforScheduleResponse>> => {
  // console.log("getOrderforSchedule Process");
  const apiOptions: ApiOptions = {
    method: "GET",
    queryParams: {
      limit: params?.limit,
      offset: params?.offset,
    },
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/order/getOrderforSchedule/${params?.storeId}`,
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken<GetOrderforScheduleResponse>(
    apiCallWithTokenProps
  );
  // console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};

export const confirmOrder = async ({
  auth,
  updateAccessToken,
  params, //orderId
}: ApiRequestProps): Promise<IResponseProps> => {
  // console.log("confirmOrder Process");
  const apiOptions: ApiOptions = {
    method: "PATCH",
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/order/confirmOrder/${params?.orderId}`,
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken(apiCallWithTokenProps);
  // console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    message: result.message,
  };
};

export const rejectOrder = async ({
  auth,
  updateAccessToken,
  data,
}: ApiRequestProps<RejectOrderData>): Promise<IResponseProps> => {
  // console.log("rejectOrder Process");
  const apiOptions: ApiOptions = {
    method: "PATCH",
    data,
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/order/rejectOrder",
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken(apiCallWithTokenProps);

  return {
    status: result.status,
    message: result.message,
  };
};

export const payOrder = async ({
  auth,
  updateAccessToken,
  params, //orderId
}: ApiRequestProps): Promise<IResponseProps> => {
  // console.log("payOrder Process");
  const apiOptions: ApiOptions = {
    method: "PATCH",
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/order/payOrder/${params?.orderId}`,
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken(apiCallWithTokenProps);
  // console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    message: result.message,
  };
};

export const completeOrder = async ({
  auth,
  updateAccessToken,
  params, //orderId
}: ApiRequestProps): Promise<IResponseProps> => {
  // console.log("completeOrder Process");
  const apiOptions: ApiOptions = {
    method: "PATCH",
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/order/completeOrder/${params?.orderId}`,
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken(apiCallWithTokenProps);
  // console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    message: result.message,
  };
};
