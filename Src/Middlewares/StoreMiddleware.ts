import { IAuthObj } from "../Types/AuthContextTypes";
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
