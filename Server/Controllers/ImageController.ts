import { Request, Response } from "express";
import ImageKit from "imagekit";
import { ResponseObj } from "../Response";
import {
  IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_BASEURL,
} from "../Config";
import { ImageRequestObj } from "../dto/Image";
import { PayloadObj } from "../dto";
import { verifyAccessToken } from "../Utils/UserTokenUtil";
import { UpdateImageValidate } from "../Validation/UploadImageValidate";
import { USERS } from "../Models/UserModel";
import { UploadImageResponse } from "../Response/ImageResponse";

export const uploadImageController = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json(<ResponseObj>{
        error: true,
        message: "Access Token is required",
      });
    }
    const accessToken = authHeader.split(" ")[1]; // Extract the accessToken from Bearer token

    // Verify the access token
    const response: ResponseObj<PayloadObj> = await verifyAccessToken({
      accessToken,
    });

    if (!response.error) {
      const payload = <PayloadObj>{
        _id: response.data?._id,
        role: response.data?.role,
      };
      //Validate Inputs
      const { error } = UpdateImageValidate(<ImageRequestObj>req.body);

      if (error)
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: error.details[0].message,
        });

      const user = await USERS.findOne({ _id: payload._id });

      const { file, path } = <ImageRequestObj>req.body;

      const imagekit = new ImageKit({
        publicKey: IMAGEKIT_PUBLIC_KEY,
        privateKey: IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: IMAGEKIT_BASEURL,
      });

      //delete user profile in imagekit
      if (user?.image?.imageId) await imagekit.deleteFile(user?.image?.imageId);

      //upload new user profile to imagekit
      const result = await imagekit.upload({
        file: file, // base64 encoded string
        fileName: `${user?.id}_Profile`,
        folder: path,
      });
      //update user database with the newest profile
      await user?.updateOne({
        image: { imageId: result.fileId, file: result.url, path: path },
      });

      const updatedUser = await USERS.findById(user?.id);
      console.log(updatedUser?.image);

      return res.status(200).json(<ResponseObj<UploadImageResponse>>{
        error: false,
        data: { image: updatedUser?.image },
        message: "Photo profile updated successfully",
      });
    }

    return res
      .status(401)
      .json(<ResponseObj>{ error: true, message: response.message });
  } catch (error) {
    let errorMessage = "An unknown error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json(<ResponseObj>{ error: true, message: errorMessage });
  }
};
