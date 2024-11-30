import {
  ApiCallWithTokenProps,
  ApiOptions,
  ApiRequestProps,
} from "../../Types/MiddleWareTypes";
import { IResponseProps } from "../../Types/ResponseTypes";
import { GetWorkersByStoreIdResponse } from "../../Types/ResponseTypes/StoreResponse";
import {
  AbsenceWorkerData,
  RegisterWorkerData,
  UpdateWorkerData,
} from "../../Types/StoreTypes/WorkerTypes";
import { apiCallWithToken } from "../IndexMiddleware";

export const getWorkersByStoreId = async ({
  auth,
  updateAccessToken,
  params, //storeId limit offset
}: ApiRequestProps): Promise<IResponseProps<GetWorkersByStoreIdResponse>> => {
  // console.log("getWorkersByStoreId Process");
  const apiOptions: ApiOptions = {
    method: "GET",
    queryParams: {
      limit: params?.limit,
      offset: params?.offset,
    },
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/store/worker/getWorkersByStoreId/${params?.storeId}`,
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken<GetWorkersByStoreIdResponse>(
    apiCallWithTokenProps
  );
  // console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};

export const registerWorker = async ({
  auth,
  updateAccessToken,
  data,
}: ApiRequestProps<RegisterWorkerData>): Promise<IResponseProps> => {
  // console.log("registerWorker Process");
  const apiOptions: ApiOptions = {
    method: "POST",
    data,
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/store/worker/registerWorker",
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

export const deleteWorkerById = async ({
  auth,
  updateAccessToken,
  params, //workerId
}: ApiRequestProps): Promise<IResponseProps> => {
  // console.log("deleteWorkerById Process");
  const apiOptions: ApiOptions = {
    method: "DELETE",
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/store/worker/deleteWorkerById/${params?.workerId}`,
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

export const updateWorker = async ({
  auth,
  updateAccessToken,
  data,
}: ApiRequestProps<UpdateWorkerData>): Promise<IResponseProps> => {
  // console.log("updateWorker Process");
  const apiOptions: ApiOptions = {
    method: "PUT",
    data,
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/store/worker/updateWorker",
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

export const clockIn = async ({
  auth,
  updateAccessToken,
  params, //workerId
}: ApiRequestProps): Promise<IResponseProps> => {
  // console.log("clockIn Process");
  const apiOptions: ApiOptions = {
    method: "PATCH",
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/store/worker/clockIn/${params?.workerId}`,
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

export const clockOut = async ({
  auth,
  updateAccessToken,
  params, //workerId
}: ApiRequestProps): Promise<IResponseProps> => {
  // console.log("clockOut Process");
  const apiOptions: ApiOptions = {
    method: "PATCH",
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/store/worker/clockOut/${params?.workerId}`,
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

export const absence = async ({
  auth,
  updateAccessToken,
  data,
}: ApiRequestProps<AbsenceWorkerData>): Promise<IResponseProps> => {
  // console.log("absence Process");
  const apiOptions: ApiOptions = {
    method: "PATCH",
    data,
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/store/worker/absence",
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
