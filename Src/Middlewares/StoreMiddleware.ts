import { IAuthObj } from "../Types/ContextTypes/AuthContextTypes";
import { IResponseProps } from "../Types/ResponseTypes";
import {
  ApproveStoreParam,
  DeleteStoreData,
  GetStoresByStatusParam,
  HoldStoreData,
  RegistrationStoreData,
  RejectStoreData,
  UnHoldStoreParam,
} from "../Types/StoreTypes";
import { apiCallWithToken } from "./IndexMiddleware";
import {
  ApiCallWithTokenProps,
  ApiOptions,
  ApiRequestProps,
} from "../Types/MiddleWareTypes";
import {
  GetStoresByUserIdResponse,
  StoresByStatusResponse,
} from "../Types/ResponseTypes/StoreResponse";

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
  if (!params) return { status: 400, message: "No params provided" };

  const apiOptions: ApiOptions = {
    method: "GET",
    params: {
      limit: params.limit,
      offset: params.offset,
      status: params.status,
      search: params.search,
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
    method: "POST",
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
    method: "POST",
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
}: ApiRequestProps<UnHoldStoreParam>): Promise<IResponseProps> => {
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
}: ApiRequestProps<ApproveStoreParam>): Promise<IResponseProps> => {
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
