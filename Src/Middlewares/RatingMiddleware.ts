import {
  ApiCallWithTokenProps,
  ApiOptions,
  ApiRequestProps,
} from "../Types/MiddleWareTypes";
import { AddRatingData } from "../Types/RatingTypes";
import { IResponseProps } from "../Types/ResponseTypes";
import {
  GetAllRatingByStoreIdAndServiceIdResponse,
  GetAllRatingByStoreIdResponse,
  GetRatingByOrderIdResponse,
  GetRatingSummaryByStoreIdResponse,
} from "../Types/ResponseTypes/RatingResponse";
import { apiCallWithToken } from "./IndexMiddleware";

export const addRating = async ({
  auth,
  updateAccessToken,
  data,
}: ApiRequestProps<AddRatingData>): Promise<IResponseProps> => {
  // console.log("addRating Process");
  const apiOptions: ApiOptions = {
    method: "POST",
    data,
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/rating/addRating",
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

export const deleteRatingById = async ({
  auth,
  updateAccessToken,
  params, //ratingId
}: ApiRequestProps): Promise<IResponseProps> => {
  // console.log("deleteRatingById Process");
  const apiOptions: ApiOptions = {
    method: "DELETE",
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/rating/deleteRatingById/${params?.ratingId}`,
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

export const getAllRatingByStoreId = async ({
  auth,
  updateAccessToken,
  params, //storeId, limit, offset, rating
}: ApiRequestProps): Promise<IResponseProps<GetAllRatingByStoreIdResponse>> => {
  // console.log("getAllRatingByStoreId Process");
  const apiOptions: ApiOptions = {
    method: "GET",
    queryParams: {
      limit: params?.limit,
      offset: params?.offset,
      rating: params?.rating,
    },
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/rating/getAllRatingByStoreId/${params?.storeId}`,
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken<GetAllRatingByStoreIdResponse>(
    apiCallWithTokenProps
  );

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};

export const getAllRatingByStoreIdAndServiceId = async ({
  auth,
  updateAccessToken,
  params, //storeId, serviceId, limit, offset, rating
}: ApiRequestProps): Promise<
  IResponseProps<GetAllRatingByStoreIdAndServiceIdResponse>
> => {
  // console.log("getAllRatingByStoreIdAndServiceId Process");
  const apiOptions: ApiOptions = {
    method: "GET",
    queryParams: {
      limit: params?.limit,
      offset: params?.offset,
      rating: params?.rating,
    },
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/rating/getAllRatingByStoreIdAndServiceId/${params?.storeId}/${params?.serviceId}`,
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result =
    await apiCallWithToken<GetAllRatingByStoreIdAndServiceIdResponse>(
      apiCallWithTokenProps
    );

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};

export const getRatingByOrderId = async ({
  auth,
  updateAccessToken,
  params, //orderId
}: ApiRequestProps): Promise<IResponseProps<GetRatingByOrderIdResponse>> => {
  // console.log("getRatingByOrderId Process");
  const apiOptions: ApiOptions = {
    method: "GET",
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/rating/getRatingByOrderId/${params?.orderId}`,
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken<GetRatingByOrderIdResponse>(
    apiCallWithTokenProps
  );

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};

export const getRatingSummaryByStoreId = async ({
  auth,
  updateAccessToken,
  params, //storeId, serviceId
}: ApiRequestProps): Promise<
  IResponseProps<GetRatingSummaryByStoreIdResponse>
> => {
  // console.log("getRatingSummaryByStoreId Process");
  const apiOptions: ApiOptions = {
    method: "GET",
    queryParams: {
      serviceId: params?.serviceId,
    },
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/rating/getRatingSummaryByStoreId/${params?.storeId}`,
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken<GetRatingSummaryByStoreIdResponse>(
    apiCallWithTokenProps
  );
  // console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};
