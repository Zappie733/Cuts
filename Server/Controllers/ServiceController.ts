import { Request, Response } from "express";
import { GetServicesByStoreIdResponse, ResponseObj } from "../Response";
import { PayloadObj } from "../dto";
import { verifyAccessToken } from "../Utils/UserTokenUtil";
import { STORES } from "../Models/StoreModel";

export const getServicesByStoreId = async (req: Request, res: Response) => {
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
      // console.log(payload);
      const responseData: GetServicesByStoreIdResponse = {
        services: [],
      };

      const store = await STORES.findOne({ userId: payload._id });
      // console.log(store);
      if (store) {
        if (store.services.length === 0) {
          return res.status(200).json(<ResponseObj>{
            error: false,
            message: `${store.name} does not have any services`,
            data: responseData,
          });
        }

        responseData.services = store.services;

        return res.status(200).json(<ResponseObj<GetServicesByStoreIdResponse>>{
          error: false,
          message: `Services of ${store.name} retrieved successfully`,
          data: responseData,
        });
      }

      return res
        .status(404)
        .json(<ResponseObj>{ error: true, message: "Store not found" });
    }

    return res
      .status(401)
      .json(<ResponseObj>{ error: true, message: response.message });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(<ResponseObj>{ error: true, message: "Internal server error" });
  }
};
