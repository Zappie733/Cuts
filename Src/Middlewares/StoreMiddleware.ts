import { IAuthObj } from "../Types/AuthContextTypes";
import { IRegistrationStoreProps } from "../Types/RegisterStoreScreenTypes";
import { IResponseProps } from "../Types/ResponseTypes";
import { DeleteStoreParams } from "../Types/StoreTypes";
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
