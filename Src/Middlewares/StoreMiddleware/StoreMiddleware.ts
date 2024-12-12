import { IAuthObj } from "../../Types/ContextTypes/AuthContextTypes";
import { IResponseProps } from "../../Types/ResponseTypes";
import {
  DeleteStoreData,
  GetStoresByStatusParam,
  HoldStoreData,
  RegistrationStoreData,
  RejectStoreData,
  StoreObj,
  UpdateStoreGeneralInformationData,
} from "../../Types/StoreTypes/StoreTypes";
import { apiCallWithToken } from "../IndexMiddleware";
import {
  ApiCallWithTokenProps,
  ApiOptions,
  ApiRequestProps,
} from "../../Types/MiddleWareTypes";
import {
  GetStoresByUserIdResponse,
  StoresByStatusResponse,
} from "../../Types/ResponseTypes/StoreResponse";

export const registerStore = async ({
  auth,
  updateAccessToken,
  data,
}: ApiRequestProps<RegistrationStoreData>): Promise<IResponseProps> => {
  // console.log("registerStore Process");
  if (!data) return { status: 400, message: "No data provided" };

  const uploadedData: RegistrationStoreData = {
    ...data,
    email: data.email.toLowerCase(),
    storeType: data.storeType.toLowerCase() as "salon" | "barbershop",
  };

  const apiOptions: ApiOptions = {
    method: "POST",
    data: uploadedData,
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/store/registerStore",
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken<RegistrationStoreData>(
    apiCallWithTokenProps
  );
  // console.log(result);

  return {
    status: result.status,
    message: result.message,
  };
};

export const getStoresByUserId = async ({
  auth,
  updateAccessToken,
}: ApiRequestProps): Promise<IResponseProps<GetStoresByUserIdResponse>> => {
  // console.log("get Stores By Status Process");
  const apiOptions: ApiOptions = {
    method: "GET",
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/store/getStoresByUserId",
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken<GetStoresByUserIdResponse>(
    apiCallWithTokenProps
  );
  // console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};

export const deleteStore = async ({
  auth,
  updateAccessToken,
  data,
}: ApiRequestProps<DeleteStoreData>): Promise<IResponseProps> => {
  // console.log("deleteStore Process");
  const apiOptions: ApiOptions = {
    method: "DELETE",
    data,
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/store/deleteStore",
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken(apiCallWithTokenProps);
  // console.log(result);

  return {
    status: result.status,
    message: result.message,
  };
};

export const getStoresByStatus = async ({
  auth,
  updateAccessToken,
  params,
}: ApiRequestProps<GetStoresByStatusParam>): Promise<
  IResponseProps<StoresByStatusResponse>
> => {
  // console.log("get Stores By Status Process");

  const apiOptions: ApiOptions = {
    method: "GET",
    queryParams: {
      limit: params?.limit,
      offset: params?.offset,
      status: params?.status,
      search: params?.search,
    },
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/store/getStoresByStatus",
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken<StoresByStatusResponse>(
    apiCallWithTokenProps
  );
  // console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};

export const rejectStore = async ({
  auth,
  updateAccessToken,
  data,
}: ApiRequestProps<RejectStoreData>): Promise<IResponseProps> => {
  // console.log("rejectStore Process");
  const apiOptions: ApiOptions = {
    method: "PATCH",
    data,
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/store/rejectStore",
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

export const holdStore = async ({
  auth,
  updateAccessToken,
  data,
}: ApiRequestProps<HoldStoreData>): Promise<IResponseProps> => {
  // console.log("onHoldStore Process");
  const apiOptions: ApiOptions = {
    method: "PATCH",
    data,
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/store/holdStore",
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

export const unHoldStore = async ({
  auth,
  updateAccessToken,
  params,
}: ApiRequestProps): Promise<IResponseProps> => {
  // console.log("unHoldStore Process");
  const apiOptions: ApiOptions = {
    method: "PATCH",
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/store/unHoldStore/${params?.storeId}`,
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

export const approveStore = async ({
  auth,
  updateAccessToken,
  params,
}: ApiRequestProps): Promise<IResponseProps> => {
  // console.log("approveStore Process");
  const apiOptions: ApiOptions = {
    method: "PATCH",
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: `/store/approveStore/${params?.storeId}`,
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

export const activeStore = async ({
  auth,
  updateAccessToken,
}: ApiRequestProps): Promise<IResponseProps> => {
  // console.log("activeStore Process");
  const apiOptions: ApiOptions = {
    method: "PATCH",
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/store/activeStore",
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken(apiCallWithTokenProps);
  console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    message: result.message,
  };
};

export const inActiveStore = async ({
  auth,
  updateAccessToken,
}: ApiRequestProps): Promise<IResponseProps> => {
  // console.log("inActiceStore Process");
  const apiOptions: ApiOptions = {
    method: "PATCH",
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/store/inActiveStore",
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken(apiCallWithTokenProps);
  console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    message: result.message,
  };
};

export const updateStoreGeneralInformation = async ({
  auth,
  updateAccessToken,
  data,
}: ApiRequestProps<UpdateStoreGeneralInformationData>): Promise<IResponseProps> => {
  // console.log("updateStoreGeneralInformation Process");
  const apiOptions: ApiOptions = {
    method: "PATCH",
    data,
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/store/updateStoreGeneralInformation",
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

export const updateStoreOpenCloseStatus = async ({
  auth,
  updateAccessToken,
}: ApiRequestProps): Promise<IResponseProps> => {
  // console.log("updateStoreOpenCloseStatus Process");
  const apiOptions: ApiOptions = {
    method: "PATCH",
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/store/updateStoreOpenCloseStatus",
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

export const getStoreByUserId = async ({
  auth,
  updateAccessToken,
}: ApiRequestProps): Promise<IResponseProps<StoreObj>> => {
  console.log("getStoreByUserId Process");
  const apiOptions: ApiOptions = {
    method: "GET",
  };

  const apiCallWithTokenProps: ApiCallWithTokenProps = {
    endpoint: "/store/getStoreByUserId",
    options: apiOptions,
    auth,
    updateAccessToken,
  };

  const result = await apiCallWithToken<StoreObj>(apiCallWithTokenProps);

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};
