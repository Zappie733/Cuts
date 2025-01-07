import {
  ApiCallWithTokenProps,
  ApiOptions,
  ApiRequestProps,
} from "../../Types/MiddleWareTypes";
import { IResponseProps } from "../../Types/ResponseTypes";
import {
  GetServiceProductsByStoreIdResponse,
  GetServiceProductsInfoForOrderByIdResponse,
} from "../../Types/ResponseTypes/StoreResponse";
import {
  AddServiceProductData,
  UpdateServiceProductData,
} from "../../Types/StoreTypes/ServiceProductTypes";
import { apiCallWithToken } from "../IndexMiddleware";

export const getServiceProductsByStoreId = async ({
  auth,
  updateAccessToken,
  params, //limit, offset
}: ApiRequestProps): Promise<
  IResponseProps<GetServiceProductsByStoreIdResponse>
> => {
  // console.log("getServiceProductsByStoreId Process");
  const apiOptions: ApiOptions = {
    method: "GET",
    queryParams: {
      limit: params?.limit,
      offset: params?.offset,
    },
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/store/serviceProduct/getServiceProductsByStoreId`,
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken<GetServiceProductsByStoreIdResponse>(
    apiCallWithTokenProps
  );
  // console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};

export const addServiceProduct = async ({
  auth,
  updateAccessToken,
  data,
}: ApiRequestProps<AddServiceProductData>): Promise<IResponseProps> => {
  // console.log("addServiceProduct Process");
  const apiOptions: ApiOptions = {
    method: "POST",
    data,
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/store/serviceProduct/addServiceProduct",
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

export const deleteServiceProductById = async ({
  auth,
  updateAccessToken,
  params, //serviceProductId
}: ApiRequestProps): Promise<IResponseProps> => {
  // console.log("deleteServiceProductById Process");
  const apiOptions: ApiOptions = {
    method: "DELETE",
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/store/serviceProduct/deleteServiceProductById/${params?.serviceProductId}`,
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

export const updateServiceProduct = async ({
  auth,
  updateAccessToken,
  data,
}: ApiRequestProps<UpdateServiceProductData>): Promise<IResponseProps> => {
  // console.log("updateServiceProduct Process");
  const apiOptions: ApiOptions = {
    method: "PUT",
    data,
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/store/serviceProduct/updateServiceProduct",
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

export const getServiceProductsInfoForOrderById = async ({
  auth,
  updateAccessToken,
  params, //storeId, serviceProductId
}: ApiRequestProps): Promise<
  IResponseProps<GetServiceProductsInfoForOrderByIdResponse>
> => {
  // console.log("getServiceProductsInfoForOrderById Process");
  const apiOptions: ApiOptions = {
    method: "GET",
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/store/serviceProduct/getServiceProductsInfoForOrderById/${params?.storeId}/${params?.serviceProductId}`,
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result =
    await apiCallWithToken<GetServiceProductsInfoForOrderByIdResponse>(
      apiCallWithTokenProps
    );
  // console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};
