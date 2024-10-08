import { IAuthObj } from "../Types/AuthContextTypes";
import { IImageProps } from "../Types/ImageTypes";
import { IResponseProps } from "../Types/ResponseTypes";
import { UploadImageResponse } from "../Types/ResponseTypes/ImageResponse";
import { apiCallWithToken } from "./AuthMiddleware";

export const uploadImage = async (
  auth: IAuthObj,
  updateAccessToken: (accessToken: string) => void,
  data: IImageProps
): Promise<IResponseProps<UploadImageResponse>> => {
  console.log("updateUserProfile Process");
  const apiOptions = {
    method: "POST",
    data,
  };

  const result = await apiCallWithToken<UploadImageResponse>(
    "/image/uploadImage",
    apiOptions,
    auth,
    updateAccessToken
  );
  console.log(result);

  return {
    status: result.status,
    data: result.data,
    message: result.message,
  };
};
