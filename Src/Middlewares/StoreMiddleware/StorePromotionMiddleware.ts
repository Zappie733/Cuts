import {
  ApiCallWithTokenProps,
  ApiOptions,
  ApiRequestProps,
} from "../../Types/MiddleWareTypes";
import { IResponseProps } from "../../Types/ResponseTypes";
import {
  GetRecentStorePromotionsByStoreIdResponse,
  GetStorePromotionsByStoreIdResponse,
} from "../../Types/ResponseTypes/StoreResponse";
import {
  AddStorePromotionData,
  UpdateStorePromotionData,
} from "../../Types/StoreTypes/StorePromotionTypes";
import { apiCallWithToken } from "../IndexMiddleware";

export const getStorePromotionsByStoreId = async ({
  auth,
  updateAccessToken,
  params, //storeId, limit, offset
}: ApiRequestProps): Promise<
  IResponseProps<GetStorePromotionsByStoreIdResponse>
> => {
  // console.log("getStorePromotionsByStoreId Process");
  const apiOptions: ApiOptions = {
    method: "GET",
    queryParams: {
      limit: params?.limit,
      offset: params?.offset,
    },
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/store/storePromotion/getStorePromotionsByStoreId/${params?.storeId}`,
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken<GetStorePromotionsByStoreIdResponse>(
    apiCallWithTokenProps
  );

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};

export const getRecentStorePromotionsByStoreId = async ({
  auth,
  updateAccessToken,
  params, //storeId
}: ApiRequestProps): Promise<
  IResponseProps<GetRecentStorePromotionsByStoreIdResponse>
> => {
  // console.log("getRecentStorePromotionsByStoreId Process");
  const apiOptions: ApiOptions = {
    method: "GET",
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/store/storePromotion/getRecentStorePromotionsByStoreId/${params?.storeId}`,
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result =
    await apiCallWithToken<GetRecentStorePromotionsByStoreIdResponse>(
      apiCallWithTokenProps
    );

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};

export const addStorePromotion = async ({
  auth,
  updateAccessToken,
  data,
}: ApiRequestProps<AddStorePromotionData>): Promise<IResponseProps> => {
  // console.log("addStorePromotion Process");
  const apiOptions: ApiOptions = {
    method: "POST",
    data,
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/store/storePromotion/addStorePromotion",
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

export const deleteStorePromotionById = async ({
  auth,
  updateAccessToken,
  params, //storePromotionId
}: ApiRequestProps): Promise<IResponseProps> => {
  // console.log("deleteStorePromotionById Process");
  const apiOptions: ApiOptions = {
    method: "DELETE",
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/store/storePromotion/deleteStorePromotionById/${params?.storePromotionId}`,
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

export const updateStorePromotion = async ({
  auth,
  updateAccessToken,
  data,
}: ApiRequestProps<UpdateStorePromotionData>): Promise<IResponseProps> => {
  // console.log("updateStorePromotion Process");
  const apiOptions: ApiOptions = {
    method: "PUT",
    data,
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/store/storePromotion/updateStorePromotion",
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
