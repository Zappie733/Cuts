import {
  ApiCallWithTokenProps,
  ApiOptions,
  ApiRequestProps,
} from "../../Types/MiddleWareTypes";
import { IResponseProps } from "../../Types/ResponseTypes";
import { GetServicesByStoreIdResponse } from "../../Types/ResponseTypes/StoreResponse";
import {
  AddServiceData,
  UpdateServiceData,
} from "../../Types/StoreTypes/ServiceTypes";
import { apiCallWithToken } from "../IndexMiddleware";

export const getServicesByStoreId = async ({
  auth,
  updateAccessToken,
  params, //storeId, limit, offset
}: ApiRequestProps): Promise<IResponseProps<GetServicesByStoreIdResponse>> => {
  // console.log("getServicesByStoreId Process");
  const apiOptions: ApiOptions = {
    method: "GET",
    queryParams: {
      limit: params?.limit,
      offset: params?.offset,
    },
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/store/service/getServicesByStoreId/${params?.storeId}`,
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken<GetServicesByStoreIdResponse>(
    apiCallWithTokenProps
  );
  // console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};

export const addService = async ({
  auth,
  updateAccessToken,
  data,
}: ApiRequestProps<AddServiceData>): Promise<IResponseProps> => {
  // console.log("addService Process");
  const apiOptions: ApiOptions = {
    method: "POST",
    data,
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/store/service/addService",
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

export const deleteService = async ({
  auth,
  updateAccessToken,
  params, //serviceId
}: ApiRequestProps): Promise<IResponseProps> => {
  // console.log("deleteService Process");
  const apiOptions: ApiOptions = {
    method: "DELETE",
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/store/service/deleteService/${params?.serviceId}`,
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

export const updateService = async ({
  auth,
  updateAccessToken,
  data,
}: ApiRequestProps<UpdateServiceData>) => {
  // console.log("updateService Process");
  const apiOptions: ApiOptions = {
    method: "PUT",
    data,
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/store/service/updateService",
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
