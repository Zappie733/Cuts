import { Request, Response } from "express";
import { ResponseObj } from "../Response";
import { PayloadObj } from "../dto";
import { verifyAccessToken } from "../Utils/UserTokenUtil";
import { USERS } from "../Models/UserModel";
import { STORES } from "../Models/StoreModel";
import { GetAppSummaryResponse } from "../Response/AppResponse";

export const getAppSummary = async (req: Request, res: Response) => {
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
      const responseData: GetAppSummaryResponse = {
        totalUser: 0,
        totalAdmin: 0,
        totalStores: 0,
        totalWaitingForApprovalStores: 0,
        totalRejectedStores: 0,
        totalActiveStores: 0,
        totalInActiveStores: 0,
        totalHoldStores: 0,
      };

      const totalUser = await USERS.countDocuments({ role: "user" });
      const totalAdmin = await USERS.countDocuments({ role: "admin" });
      const totalStores = await USERS.countDocuments({ role: "store" });
      const totalWaitingForApprovalStores = await STORES.countDocuments({
        status: "Waiting for Approval",
      });
      const totalRejectedStores = await STORES.countDocuments({
        status: "Rejected",
      });
      const totalActiveStores = await STORES.countDocuments({
        status: "Active",
      });
      const totalInActiveStores = await STORES.countDocuments({
        status: "InActive",
      });
      const totalHoldStores = await STORES.countDocuments({
        status: "Hold",
      });

      responseData.totalUser = totalUser;
      responseData.totalAdmin = totalAdmin;
      responseData.totalStores = totalStores;
      responseData.totalWaitingForApprovalStores =
        totalWaitingForApprovalStores;
      responseData.totalRejectedStores = totalRejectedStores;
      responseData.totalActiveStores = totalActiveStores;
      responseData.totalInActiveStores = totalInActiveStores;
      responseData.totalHoldStores = totalHoldStores;

      return res.status(200).json(<ResponseObj<GetAppSummaryResponse>>{
        error: false,
        message: "App summary retrieved successfully",
        data: responseData,
      });
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
