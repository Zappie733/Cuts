import {
  ApiCallWithTokenProps,
  ApiOptions,
  ApiRequestProps,
} from "../../Types/MiddleWareTypes";
import { IResponseProps } from "../../Types/ResponseTypes";
import { GetSalesProductsByStoreIdResponse } from "../../Types/ResponseTypes/StoreResponse";
import {
  AddSalesProductData,
  UpdateSalesProductData,
} from "../../Types/StoreTypes/SalesProductTypes";
import { apiCallWithToken } from "../IndexMiddleware";

export const getSalesProductsByStoreId = async ({
  auth,
  updateAccessToken,
  params, //storeId, limit, offset
}: ApiRequestProps): Promise<
  IResponseProps<GetSalesProductsByStoreIdResponse>
> => {
  // console.log("getSalesProductsByStoreId Process");
  const apiOptions: ApiOptions = {
    method: "GET",
    queryParams: {
      limit: params?.limit,
      offset: params?.offset,
    },
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/store/salesProduct/getSalesProductsByStoreId/${params?.storeId}`,
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken<GetSalesProductsByStoreIdResponse>(
    apiCallWithTokenProps
  );
  // console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};

export const addSalesProduct = async ({
  auth,
  updateAccessToken,
  data,
}: ApiRequestProps<AddSalesProductData>): Promise<IResponseProps> => {
  // console.log("addSalesProduct Process");
  const apiOptions: ApiOptions = {
    method: "POST",
    data,
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/store/salesProduct/addSalesProduct",
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

export const deleteSalesProductById = async ({
  auth,
  updateAccessToken,
  params, //salesProductId
}: ApiRequestProps): Promise<IResponseProps> => {
  // console.log("deleteSalesProductById Process");
  const apiOptions: ApiOptions = {
    method: "DELETE",
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/store/salesProduct/deleteSalesProductById/${params?.salesProductId}`,
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

export const updateSalesProduct = async ({
  auth,
  updateAccessToken,
  data,
}: ApiRequestProps<UpdateSalesProductData>): Promise<IResponseProps> => {
  // console.log("updateSalesProduct Process");
  const apiOptions: ApiOptions = {
    method: "PUT",
    data,
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/store/salesProduct/updateSalesProduct",
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
