import { Request, Response } from "express";
import { USERS } from "../Models/UserModel";
import { STORES } from "../Models/StoreModel";
import { ResponseObj } from "../Response";
import {
  IDocumentProps,
  ImageRequestObj,
  OnHoldStoreRequestObj,
  PayloadObj,
  PayloadVerifyTokenObj,
  RejectStoreRequestObj,
  DeleteStoreRequestObj,
  StoreObj,
  UpdateStoreGeneralInformationRequestObj,
  RegisterStoreRequestObj
} from "../dto";
import bcrypt from "bcrypt";
import {
  IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_BASEURL,
} from "../Config";
import {
  verifyAccessToken,
  verifyVerifyToken,
} from "../Utils/UserTokenUtil";
import { sendEmail } from "../Utils/UserUtil";
import ImageKit from "imagekit";
import {
  GetStoresByStatusResponse,
  GetStoresByUserIdResponse,
} from "../Response/StoreResponse";
import { USERTOKENS } from "../Models/UserTokenModel";
import {
  DeleteStoreValidate,
  RejectStoreValidate,
  RegisterStoreValidate
} from "../Validation/StoreValidation";
import mongoose from "mongoose";
import { OnHoldStoreValidate } from "../Validation/StoreValidation/OnHoldStoreValidate";
import { UpdateStoreGeneralInformationValidate } from "../Validation/StoreValidation/UpdateStoreGeneralInformationValidate";

import { sendErrorResponse } from "../Utils/Responses";
import { getAccessTokenFromHeader } from "../Utils/Auth"

import { createUserWithStore } from "../Services/StoreServices";
import { sendVerificationEmail } from "../Services/EmailService";
import { validateUniqueConstraints } from "../Services/StoreServices";

function validateStoreRegistration(body: RegisterStoreRequestObj) {
  const { error } = RegisterStoreValidate(body);
  return error ? error.details[0].message : null;
}

export const registerStore = async (req: Request, res: Response) => {
  try {
    // Verify access token
    const accessToken = getAccessTokenFromHeader(req);
    if (!accessToken) {
      return sendErrorResponse(res, 400, "Access Token is required");
    }

    const tokenResponse = await verifyAccessToken({ accessToken });
    if (tokenResponse.error) {
      return sendErrorResponse(res, 401, tokenResponse.message);
    }

    // Validate request body
    const validationError = validateStoreRegistration(req.body);
    if (validationError) {
      return sendErrorResponse(res, 400, validationError);
    }

    const storeData = req.body as RegisterStoreRequestObj;
    
    // Check existing email and store name
    await validateUniqueConstraints(storeData.email, storeData.storeName);

    // Create new user with store data
    const user = await createUserWithStore(storeData);

    // Send verification email
    await sendVerificationEmail(user, storeData.storeName);

    return res.status(201).json(<ResponseObj>{
      error: false,
      message: "An email has been sent to your account, please verify your account to continue the registration of your store",
    });

  } catch (error) {
    console.error(error);
    return sendErrorResponse(res, 500, "Internal Server error");
  }
};

export const verifyStore = async (req: Request, res: Response) => {
  try {
    const user = await USERS.findOne({ _id: req.params.id });
    if (!user) {
      return res.render("verification", {
        isError: true,
        message: "Invalid verification link",
      });
    }
    const response: ResponseObj<PayloadVerifyTokenObj> =
      await verifyVerifyToken({ verifyToken: req.params.token });

    if (!response.error && response.data) {
      const { _id, verified } = response.data;

      await user.updateOne({ id: _id, verified: verified });

      const { pendingStoreData, email } = user;

      const imagekit = new ImageKit({
        publicKey: IMAGEKIT_PUBLIC_KEY,
        privateKey: IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: IMAGEKIT_BASEURL,
      });

      // Array to store the uploaded image URLs
      const uploadedImages: ImageRequestObj[] = [];
      const uploadedDocuments: IDocumentProps[] = [];

      if (pendingStoreData) {
        const {
          storeImages,
          storeName,
          storeDistrict,
          storeSubDistrict,
          storeLocation,
          storeType,
          storeDocuments,
        } = pendingStoreData;

        //Create new Store
        const store = new STORES({
          userId: _id,
          email,
          images: uploadedImages,
          name: storeName,
          type: storeType,
          district: storeDistrict,
          subDistrict: storeSubDistrict,
          location: storeLocation,
          documents: uploadedDocuments,
          openHour: 9,
          openMinute: 0,
          closeHour: 18,
          closeMinute: 0,
        });

        await store.save();

        // Upload each image in storeImages
        for (const [index, imageObj] of storeImages.entries()) {
          const result = await imagekit.upload({
            file: imageObj.file, // base64 encoded string
            fileName: `Image_${index}`, // Unique filename for each image
            folder: `/Stores/${store.id}/Images`, // Folder to upload to in ImageKit
          });
          console.log(result);
          // Add the uploaded image URL to the array
          uploadedImages.push({
            imageId: result.fileId,
            file: result.url,
            path: `/Stores/${store.id}/Images`,
          });
        }

        // Upload each document in storeDocuments
        for (const [index, document] of storeDocuments.entries()) {
          const result = await imagekit.upload({
            file: document.file, // base64 encoded string
            fileName: `Document_${index}`, // Unique filename for each image
            folder: `/Stores/${store.id}/Documents`, // Folder to upload to in ImageKit
          });
          console.log(result);
          // Add the uploaded image URL to the array
          uploadedDocuments.push({
            documentId: result.fileId,
            name: document.name,
            file: result.url,
            path: `/Stores/${store.id}/Documents`,
          });
        }

        await store.updateOne({
          images: uploadedImages,
          documents: uploadedDocuments,
        });
      }

      user.pendingStoreData = undefined;
      await user.save();

      return res.render("verification", {
        isError: false,
        message: `Your account has been verified successfully!
          
        Please wait for our admin to approve your store data, you can check your store status in the account setting where you register your store. 
          
        Thank You for joining.`,
      });
    }

    return res.render("verification", {
      isError: true,
      message: response.message,
    });
  } catch (error) {
    console.log(error);
    return res.render("verification", {
      isError: true,
      message: "An internal error occurred. Please try again later.",
    });
  }
};

export const getStoresByUserId = async (req: Request, res: Response) => {
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
      //get user type stores that has userId the id from the access token
      const users = await USERS.find({ userId: payload._id });
      // console.log(users);

      if (users) {
        const responseData: GetStoresByUserIdResponse = {
          stores: [],
        };

        for (const user of users) {
          const store = await STORES.findOne({
            userId: user.id,
          }).select("-workers -services -serviceProducts");

          if (store) {
            responseData.stores.push(store);
          }
        }
        // console.log(responseData);
        if (responseData) {
          // console.log(responseData);
          return res.status(200).json(<ResponseObj<GetStoresByUserIdResponse>>{
            error: false,
            data: responseData,
            message: "Stores retrieved successfully",
          });
        }
      }

      return res.status(404).json(<ResponseObj>{
        error: true,
        message: "No stores found",
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

export const deleteStore = async (req: Request, res: Response) => {
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
      //Validate Inputs
      const { error } = DeleteStoreValidate(<DeleteStoreRequestObj>req.body);

      if (error)
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: error.details[0].message,
        });

      const { email, password } = <DeleteStoreRequestObj>req.body;

      const userStore = await USERS.findOne({ email: email.toLowerCase() });

      if (userStore) {
        //Validate Password
        const validPassword = await bcrypt.compare(
          password,
          userStore.password
        );
        if (!validPassword) {
          return res.status(401).json(<ResponseObj>{
            error: true,
            message: "Invalid Password Or Password",
          });
        }

        const store = await STORES.findOne({ userId: userStore.id });

        if (store) {
          if (store.status === "Rejected") {
            store.isDeletedFromRejectedStatus = true;
            await store.save();
          } else {
            const imagekit = new ImageKit({
              publicKey: IMAGEKIT_PUBLIC_KEY,
              privateKey: IMAGEKIT_PRIVATE_KEY,
              urlEndpoint: IMAGEKIT_BASEURL,
            });

            await imagekit.deleteFolder("Stores/" + store.id);

            //delete store
            // await STORES.findOneAndDelete({ userId: userStore.id });
            await store.deleteOne();
          }

          //delete userTokens
          const userTokens = await USERTOKENS.find({ userId: userStore.id });

          for (const userToken of userTokens) {
            await userToken.deleteOne();
          }

          //delete userStore
          await userStore.deleteOne();

          return res.status(200).json(<ResponseObj>{
            error: false,
            message: "Delete Store successfully",
          });
        }

        return res.status(401).json(<ResponseObj>{
          error: true,
          message: "Store not found, deletion process failed",
        });
      }

      return res.status(401).json(<ResponseObj>{
        error: true,
        message: "User Store not found, deletion process failed",
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

export const getStoresByStatus = async (req: Request, res: Response) => {
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
      const { limit, offset, status, search, type } = req.query;

      let query: any = {};

      if (status) {
        if (
          status !== "Active" &&
          status !== "InActive" &&
          status !== "Rejected" &&
          status !== "Hold" &&
          status !== "Waiting for Approval"
        ) {
          return res.status(400).json(<ResponseObj>{
            error: true,
            message: "Invalid status",
          });
        } else {
          query.status = status;
        }
      }
      // console.log(search);
      // if (search) {
      //   query.name = { $regex: search, $options: "i" };
      // }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { district: { $regex: search, $options: "i" } },
          { subDistrict: { $regex: search, $options: "i" } },
        ];
      }

      if (type !== undefined) {
        query.type = type;
      }

      console.log(JSON.stringify(query, null, 2));

      const stores = await STORES.find(query)
        .select(
          "-workers -services -serviceProducts -salesProducts -storePromotions -gallery -toleranceTime -canChooseWorker -approvedBy -rejectedBy -onHoldBy -unHoldBy -approvedDate -rejectedDate -onHoldDate -unHoldDate"
        )
        .limit(Number(limit))
        .skip(Number(offset));

      const responseData: GetStoresByStatusResponse = { stores: [], total: 0 };

      responseData.stores = stores;
      responseData.total = await STORES.countDocuments(query);

      return res.status(200).json(<ResponseObj<GetStoresByStatusResponse>>{
        error: false,
        message: "Stores retrieved successfully",
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

export const rejectStore = async (req: Request, res: Response) => {
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

      if (payload.role !== "admin") {
        return res.status(401).json(<ResponseObj>{
          error: true,
          message: "Unauthorized, you are not an admin",
        });
      }

      const { error } = RejectStoreValidate(<RejectStoreRequestObj>req.body);
      console.log(error);
      if (error)
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: error.details[0].message,
        });

      const { storeId, rejectedReason }: RejectStoreRequestObj = req.body;

      if (!mongoose.Types.ObjectId.isValid(storeId)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid Store ID",
        });
      }

      const store = await STORES.findOne({ _id: storeId });

      if (!store) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Store not found",
        });
      }

      await store.updateOne({
        status: "Rejected",
        rejectedReason,
        rejectedBy: payload._id,
        rejectedDate: new Date(Date.now() + 7 * 60 * 60 * 1000),
      });

      const user = await USERS.findOne({ _id: store.userId });

      if (user) {
        await sendEmail(
          "rejectStore",
          user.email,
          "Store Rejected",
          rejectedReason,
          `owner of ${store.name}`
        );

        let userEmail = user.email;
        // await user.deleteOne(); //tidak jadi didelete

        return res.status(200).json(<ResponseObj>{
          error: false,
          message: `Store rejected successfully, Email sent to ${userEmail}`,
        });
      }

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: "Store rejected successfully",
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

export const holdStore = async (req: Request, res: Response) => {
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

      if (payload.role !== "admin") {
        return res.status(401).json(<ResponseObj>{
          error: true,
          message: "Unauthorized, you are not an admin",
        });
      }

      const { error } = OnHoldStoreValidate(<OnHoldStoreRequestObj>req.body);
      console.log(error);
      if (error)
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: error.details[0].message,
        });

      const { storeId, onHoldReason }: OnHoldStoreRequestObj = req.body;

      if (!mongoose.Types.ObjectId.isValid(storeId)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid Store ID",
        });
      }

      const store = await STORES.findOne({ _id: storeId });

      if (!store) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Store not found",
        });
      }

      await store.updateOne({
        status: "Hold",
        onHoldBy: payload._id,
        onHoldReason,
        onHoldDate: new Date(Date.now() + 7 * 60 * 60 * 1000),
      });

      const user = await USERS.findOne({ _id: store.userId });

      if (user) {
        await sendEmail(
          "holdStore",
          user.email,
          `${store.name} is on hold`,
          onHoldReason,
          `owner of ${store.name}`
        );

        let userEmail = user.email;

        return res.status(200).json(<ResponseObj>{
          error: false,
          message: `Store held successfully, Email sent to ${userEmail}`,
        });
      }

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: "Store held successfully",
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

export const unHoldStore = async (req: Request, res: Response) => {
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

      if (payload.role !== "admin") {
        return res.status(401).json(<ResponseObj>{
          error: true,
          message: "Unauthorized, you are not an admin",
        });
      }

      const { id: storeId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(storeId)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid Store ID",
        });
      }

      const store = await STORES.findOne({ _id: storeId });

      if (!store) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Store not found",
        });
      }

      await store.updateOne({
        status: "InActive",
        unHoldBy: payload._id,
        unHoldDate: new Date(Date.now() + 7 * 60 * 60 * 1000),
      });

      const user = await USERS.findOne({ _id: store.userId });

      if (user) {
        await sendEmail(
          "unHoldStore",
          user.email,
          `${store.name} is being unHold`,
          "",
          `owner of ${store.name}`
        );

        let userEmail = user.email;

        return res.status(200).json(<ResponseObj>{
          error: false,
          message: `Store un-hold successfully, Email sent to ${userEmail}`,
        });
      }

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: "Store un-hold successfully",
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

export const approveStore = async (req: Request, res: Response) => {
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

      if (payload.role !== "admin") {
        return res.status(401).json(<ResponseObj>{
          error: true,
          message: "Unauthorized, you are not an admin",
        });
      }

      const { id: storeId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(storeId)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid Store ID",
        });
      }

      const store = await STORES.findOne({ _id: storeId });

      if (!store) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Store not found",
        });
      }

      await store.updateOne({
        status: "InActive",
        approvedBy: payload._id,
        approvedDate: new Date(Date.now() + 7 * 60 * 60 * 1000),
      });

      const user = await USERS.findOne({ _id: store.userId });

      if (user) {
        await sendEmail(
          "approveStore",
          user.email,
          `${store.name} is approved`,
          "",
          `owner of ${store.name}`
        );

        let userEmail = user.email;

        return res.status(200).json(<ResponseObj>{
          error: false,
          message: `Store approved successfully, Email sent to ${userEmail}`,
        });
      }

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: "Store approved successfully",
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

export const activeStore = async (req: Request, res: Response) => {
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

      if (payload.role !== "store") {
        return res.status(401).json(<ResponseObj>{
          error: true,
          message: "Unauthorized, you are not a store",
        });
      }

      const store = await STORES.findOne({
        userId: payload._id,
        status: "InActive",
      });

      if (!store) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Store not found or not InActive",
        });
      }

      await store.updateOne({
        status: "Active",
      });

      const user = await USERS.findOne({ _id: store.userId });

      if (user) {
        await sendEmail(
          "activeStore",
          user.email,
          `${store.name} is set to Active`,
          "",
          `owner of ${store.name}`
        );

        let userEmail = user.email;

        return res.status(200).json(<ResponseObj>{
          error: false,
          message: `Store activated successfully, Email sent to ${userEmail}`,
        });
      }

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: "Store activated successfully",
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

export const inActiveStore = async (req: Request, res: Response) => {
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

      if (payload.role !== "store") {
        return res.status(401).json(<ResponseObj>{
          error: true,
          message: "Unauthorized, you are not a store",
        });
      }

      const store = await STORES.findOne({
        userId: payload._id,
        status: "Active",
      });

      if (!store) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Store not found or not Active",
        });
      }

      await store.updateOne({
        status: "InActive",
      });

      const user = await USERS.findOne({ _id: store.userId });

      if (user) {
        await sendEmail(
          "inActiveStore",
          user.email,
          `${store.name} is set to InActive`,
          "",
          `owner of ${store.name}`
        );

        let userEmail = user.email;

        return res.status(200).json(<ResponseObj>{
          error: false,
          message: `Store inactived successfully, Email sent to ${userEmail}`,
        });
      }

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: "Store inactived successfully",
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

export const updateStoreGeneralInformation = async (
  req: Request,
  res: Response
) => {
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
      const store = await STORES.findOne({ userId: payload._id });

      if (!store) {
        return res
          .status(404)
          .json(<ResponseObj>{ error: true, message: "Store not found" });
      }
      // console.log(req.body);
      const { error } = UpdateStoreGeneralInformationValidate(
        <UpdateStoreGeneralInformationRequestObj>req.body
      );
      // console.log(error);
      if (error)
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: error.details[0].message,
        });

      const {
        name,
        images,
        district,
        subDistrict,
        location,
        openHour,
        openMinute,
        closeHour,
        closeMinute,
        canChooseWorker,
        toleranceTime,
      } = <UpdateStoreGeneralInformationRequestObj>req.body;

      const storeNameExist = await STORES.findOne({
        name: name,
        isDeletedFromRejectedStatus: false,
      });

      if (
        storeNameExist &&
        storeNameExist._id.toString() !== store._id.toString()
      ) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Store name already exist",
        });
      }

      if (openHour >= closeHour) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Open hour must be less than close hour",
        });
      }

      if (toleranceTime < 10) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Tolerance time must be greater than or equal to 10 minutes",
        });
      }

      store.name = name;
      store.district = district;
      store.subDistrict = subDistrict;
      store.location = location;
      store.openHour = openHour;
      store.openMinute = openMinute;
      store.closeHour = closeHour;
      store.closeMinute = closeMinute;
      store.canChooseWorker = canChooseWorker;
      store.toleranceTime = toleranceTime;

      const imagekit = new ImageKit({
        publicKey: IMAGEKIT_PUBLIC_KEY,
        privateKey: IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: IMAGEKIT_BASEURL,
      });

      const imageIdsToKeep: any = [];

      for (const imageObj of images) {
        if (imageObj.imageId === undefined) {
          console.log("skipping keeping filter because imageId is undefined");
          continue;
        }

        const image = store.images.find(
          (imageData) => imageData.imageId === imageObj.imageId
        );

        if (image) {
          console.log("push imageId to imageIdsToKeep " + imageObj.imageId);
          imageIdsToKeep.push(imageObj.imageId);
        }
      }

      console.log(imageIdsToKeep);

      //delete images in imagekit that is not in imageIdsToKeep
      for (const imageObj of store.images) {
        if (imageObj.imageId) {
          if (!imageIdsToKeep.includes(imageObj.imageId)) {
            console.log("deleting image " + imageObj.imageId);
            await imagekit.deleteFile(imageObj.imageId);
          }
        }
      }

      //remove images from store that is not in imageIdsToKeep
      store.images = store.images.filter((imageData) =>
        imageIdsToKeep.includes(imageData.imageId)
      );

      console.log(store.images);
      await store.save();

      // Upload each new image
      for (const [index, imageObj] of images.entries()) {
        if (imageObj.imageId !== undefined) {
          console.log(`skipping upload for ${imageObj.imageId}`);
          continue;
        }

        const result = await imagekit.upload({
          file: imageObj.file, // base64 encoded string
          fileName: `Image_${index}`, // Unique filename for each image
          folder: `Stores/${store.id}/Images`, // Folder to upload to in ImageKit
        });
        console.log(result);
        // Add the uploaded image URL to the array
        store.images.push({
          imageId: result.fileId,
          file: result.url,
          path: `Stores/${store.id}/Images`,
        });
      }

      await store.save();

      //notify store via email
      await sendEmail(
        "notifyUpdateStore",
        store.email,
        `Update Store Success`,
        `We just want to inform you that your store ${store.name} has been updated successfully.`,
        `owner of ${store.name}`
      );

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: `Store has been updated successfully`,
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

export const updateStoreOpenCloseStatus = async (
  req: Request,
  res: Response
) => {
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
      const store = await STORES.findOne({ userId: payload._id });

      if (!store) {
        return res
          .status(404)
          .json(<ResponseObj>{ error: true, message: "Store not found" });
      }

      store.isOpen = !store.isOpen;

      await store.save();

      //notify store via email
      await sendEmail(
        "notifyUpdateStore",
        store.email,
        `Update Store Success`,
        `We just want to inform you that you just set your store ${
          store.name
        } to ${store.isOpen ? "Open" : "Close"}`,
        `owner of ${store.name}`
      );

      return res.status(200).json(<ResponseObj>{
        error: false,
        message: `Store has been set to ${
          store.isOpen ? "Open" : "Close"
        } successfully`,
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

export const getStoreByUserId = async (req: Request, res: Response) => {
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

      const store = await STORES.findOne({ userId: payload._id });

      if (!store) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "No store found",
        });
      }

      return res.status(200).json(<ResponseObj<StoreObj>>{
        error: false,
        message: "Store found",
        data: store,
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

export const getStoreById = async (req: Request, res: Response) => {
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
      const { id: storeId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(storeId)) {
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: "Invalid Store ID",
        });
      }

      const store = await STORES.findOne({ _id: storeId });

      if (!store) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "Store not found",
        });
      }

      return res.status(200).json(<ResponseObj<StoreObj>>{
        error: false,
        message: `Retrieved store(${store.name}) successfully`,
        data: store,
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
