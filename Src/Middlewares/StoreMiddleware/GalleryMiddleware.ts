import {
  ApiCallWithTokenProps,
  ApiOptions,
  ApiRequestProps,
} from "../../Types/MiddleWareTypes";
import { IResponseProps } from "../../Types/ResponseTypes";
import {
  GetGalleryByStoreIdResponse,
  GetMostLikesGalleryByStoreIdResponse,
} from "../../Types/ResponseTypes/StoreResponse";
import {
  AddGalleryData,
  UpdateGalleryData,
} from "../../Types/StoreTypes/GalleryTypes";
import { apiCallWithToken } from "../IndexMiddleware";

export const getGalleryByStoreId = async ({
  auth,
  updateAccessToken,
  params, //storeId, limit, offset
}: ApiRequestProps): Promise<IResponseProps<GetGalleryByStoreIdResponse>> => {
  // console.log("getGalleryByStoreId Process");
  const apiOptions: ApiOptions = {
    method: "GET",
    queryParams: {
      limit: params?.limit,
      offset: params?.offset,
    },
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/store/gallery/getGalleryByStoreId/${params?.storeId}`,
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken<GetGalleryByStoreIdResponse>(
    apiCallWithTokenProps
  );
  // console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};

export const getMostLikesGalleryByStoreId = async ({
  auth,
  updateAccessToken,
  params, //storeId
}: ApiRequestProps): Promise<
  IResponseProps<GetMostLikesGalleryByStoreIdResponse>
> => {
  // console.log("getMostLikesGalleryByStoreId Process");
  const apiOptions: ApiOptions = {
    method: "GET",
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/store/gallery/getMostLikesGalleryByStoreId/${params?.storeId}`,
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken<GetMostLikesGalleryByStoreIdResponse>(
    apiCallWithTokenProps
  );
  // console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};

export const addGallery = async ({
  auth,
  updateAccessToken,
  data,
}: ApiRequestProps<AddGalleryData>): Promise<IResponseProps> => {
  // console.log("addGallery Process");
  const apiOptions: ApiOptions = {
    method: "POST",
    data,
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/store/gallery/addGallery",
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

export const deleteGalleryById = async ({
  auth,
  updateAccessToken,
  params, //galleryId
}: ApiRequestProps): Promise<IResponseProps> => {
  // console.log("deleteGalleryById Process");
  const apiOptions: ApiOptions = {
    method: "DELETE",
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/store/gallery/deleteGalleryById/${params?.galleryId}`,
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

export const updateGallery = async ({
  auth,
  updateAccessToken,
  data,
}: ApiRequestProps<UpdateGalleryData>): Promise<IResponseProps> => {
  // console.log("updateGalleryById Process");
  const apiOptions: ApiOptions = {
    method: "PUT",
    data,
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/store/gallery/updateGallery",
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

export const likeGalleryById = async ({
  auth,
  updateAccessToken,
  params, //storeId, galleryId
}: ApiRequestProps): Promise<IResponseProps> => {
  // console.log("likeGalleryById Process");
  const apiOptions: ApiOptions = {
    method: "PATCH",
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/store/gallery/likeGalleryById/${params?.storeId}/${params?.galleryId}`,
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
