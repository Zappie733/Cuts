import { IAuthObj } from "../Types/AuthContextTypes";
import { IRegistrationStoreProps } from "../Types/RegisterStoreScreenTypes";
import { IResponseProps, StoreResponse } from "../Types/ResponseTypes";
import {
  ApproveStoreParams,
  DeleteStoreParams,
  HoldStoreParams,
  RejectStoreParams,
  UnHoldStoreParams,
} from "../Types/StoreTypes";
import { apiCallWithToken } from "./AuthMiddleware";

export const deleteStore = async (
  auth: IAuthObj,
  updateAccessToken: (accessToken: string) => void,
  data: DeleteStoreParams
): Promise<IResponseProps<{}>> => {
  console.log("deleteStore Process");
  const apiOptions = {
    method: "DELETE",
    data,
  };

  const result = await apiCallWithToken<{}>(
    "/store/deleteStore",
    apiOptions,
    auth,
    updateAccessToken
  );
  console.log(result);

  return {
    status: result.status,
    message: result.message,
  };
};

export const registerStore = async (
  auth: IAuthObj,
  updateAccessToken: (accessToken: string) => void,
  data: IRegistrationStoreProps
): Promise<IResponseProps<IRegistrationStoreProps>> => {
  console.log("registerStore Process");
  const uploadedData: IRegistrationStoreProps = {
    ...data,
    email: data.email.toLowerCase(),
    storeType: data.storeType.toLowerCase() as "salon" | "barbershop",
  };

  const apiOptions = {
    method: "POST",
    data: uploadedData,
  };

  const result = await apiCallWithToken<IRegistrationStoreProps>(
    "/store/registerStore",
    apiOptions,
    auth,
    updateAccessToken
  );
  console.log(result);

  return {
    status: result.status,
    message: result.message,
  };
};

export const getWaitingForApprovalStores = async (
  auth: IAuthObj,
  updateAccessToken: (accessToken: string) => void
): Promise<IResponseProps<StoreResponse[]>> => {
  console.log("getWaitingForApprovalStores Process");
  const apiOptions = {
    method: "GET",
    limit: 10,
    offset: 0,
  };

  const result = await apiCallWithToken<StoreResponse[]>(
    "/store/getWaitingForApprovalStores",
    apiOptions,
    auth,
    updateAccessToken
  );
  console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};

export const getRejectedStores = async (
  auth: IAuthObj,
  updateAccessToken: (accessToken: string) => void
): Promise<IResponseProps<StoreResponse[]>> => {
  console.log("getRejectedStores Process");
  const apiOptions = {
    method: "GET",
  };

  const result = await apiCallWithToken<StoreResponse[]>(
    "/store/getRejectedStores",
    apiOptions,
    auth,
    updateAccessToken
  );
  console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};

export const getApprovedStores = async (
  auth: IAuthObj,
  updateAccessToken: (accessToken: string) => void
): Promise<IResponseProps<StoreResponse[]>> => {
  console.log("getApprovedStores Process");
  const apiOptions = {
    method: "GET",
  };

  const result = await apiCallWithToken<StoreResponse[]>(
    "/store/getApprovedStores",
    apiOptions,
    auth,
    updateAccessToken
  );
  console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};

export const getHoldStores = async (
  auth: IAuthObj,
  updateAccessToken: (accessToken: string) => void
): Promise<IResponseProps<StoreResponse[]>> => {
  console.log("getHoldStores Process");
  const apiOptions = {
    method: "GET",
  };

  const result = await apiCallWithToken<StoreResponse[]>(
    "/store/getHoldStores",
    apiOptions,
    auth,
    updateAccessToken
  );
  console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};

export const rejectStore = async (
  auth: IAuthObj,
  updateAccessToken: (accessToken: string) => void,
  data: RejectStoreParams
): Promise<IResponseProps<{}>> => {
  console.log("rejectStore Process");
  const apiOptions = {
    method: "POST",
    data,
  };

  const result = await apiCallWithToken<{}>(
    "/store/rejectStore",
    apiOptions,
    auth,
    updateAccessToken
  );
  console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    message: result.message,
  };
};

export const holdStore = async (
  auth: IAuthObj,
  updateAccessToken: (accessToken: string) => void,
  data: HoldStoreParams
): Promise<IResponseProps<{}>> => {
  console.log("onHoldStore Process");
  const apiOptions = {
    method: "POST",
    data,
  };

  const result = await apiCallWithToken<{}>(
    "/store/holdStore",
    apiOptions,
    auth,
    updateAccessToken
  );
  console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    message: result.message,
  };
};

export const unHoldStore = async (
  auth: IAuthObj,
  updateAccessToken: (accessToken: string) => void,
  data: UnHoldStoreParams
): Promise<IResponseProps<{}>> => {
  console.log("unHoldStore Process");
  const apiOptions = {
    method: "POST",
  };

  const result = await apiCallWithToken<{}>(
    `/store/unHoldStore/${data.storeId}`,
    apiOptions,
    auth,
    updateAccessToken
  );
  console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    message: result.message,
  };
};

export const approveStore = async (
  auth: IAuthObj,
  updateAccessToken: (accessToken: string) => void,
  data: ApproveStoreParams
): Promise<IResponseProps<{}>> => {
  console.log("approveStore Process");
  const apiOptions = {
    method: "POST",
  };

  const result = await apiCallWithToken<{}>(
    `/store/approveStore/${data.storeId}`,
    apiOptions,
    auth,
    updateAccessToken
  );
  console.log(JSON.stringify(result, null, 2));

  return {
    status: result.status,
    message: result.message,
  };
};
