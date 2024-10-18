import { Request, Response } from "express";
import { USERS } from "../Models/UserModel";
import { STORES } from "../Models/StoreModel";
import { RegisterStoreValidate } from "../Validation/StoreValidation";
import { ResponseObj } from "../Response";
import {
  IDocumentProps,
  ImageRequestObj,
  PayloadObj,
  PayloadVerifyTokenObj,
  PendingStoreObj,
  RegisterStoreRequestObj,
  StoreId,
  StoreObj,
  UserObj,
} from "../dto";
import bcrypt from "bcrypt";
import {
  SALT,
  BASE_URL,
  IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_BASEURL,
} from "../Config";
import {
  generateVerifyTokens,
  verifyAccessToken,
  verifyVerifyToken,
} from "../Utils/UserTokenUtil";
import { sendEmail } from "../Utils/UserUtil";
import ImageKit from "imagekit";
import { GetStoreResponse } from "../Response/StoreResponse";
import { DeleteStoreValidate } from "../Validation/StoreValidation/DeleteStoreValidation";
import { USERTOKENS } from "../Models/UserTokenModel";

export const registerStore = async (req: Request, res: Response) => {
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
      const { error } = RegisterStoreValidate(
        <RegisterStoreRequestObj>req.body
      );
      console.log(error);
      if (error)
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: error.details[0].message,
        });

      const {
        userId,
        email,
        password,
        role,
        storeImages,
        storeLocation,
        storeName,
        storeType,
        storeDocuments,
      } = <RegisterStoreRequestObj>req.body;

      //Check if email exist
      const isEmailExist = await USERS.findOne({ email: email.toLowerCase() });
      if (isEmailExist)
        return res.status(409).json(<ResponseObj>{
          error: true,
          message: "User with given email is already exist",
        });

      //Hash Password
      const salt = await bcrypt.genSalt(parseInt(SALT || "10"));
      const hashedPassword = await bcrypt.hash(password, salt);

      const pendingStoreData: PendingStoreObj = {
        storeImages,
        storeName,
        storeLocation,
        storeType,
        storeDocuments,
      };
      console.log(pendingStoreData);
      //Create New User
      const user = new USERS({
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        userId,
        pendingStoreData,
      });
      //Save User
      await user.save();

      const verifiedToken = await generateVerifyTokens({
        _id: user.id,
        verified: true,
      });

      const url = `${BASE_URL}/store/${user._id}/verifyStore/${verifiedToken}`;
      await sendEmail(
        "account",
        user.email,
        "Verify Email",
        url,
        `owner of ${storeName}`
      );

      return res.status(201).json(<ResponseObj>{
        error: false,
        message:
          "An Email sent to your account, please verify your account to continue the registration of your store",
      });
    }

    return res
      .status(401)
      .json(<ResponseObj>{ error: true, message: response.message });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(<ResponseObj>{ error: true, message: "Internal Server error" });
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

      const { pendingStoreData } = user;

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
          storeLocation,
          storeType,
          storeDocuments,
        } = pendingStoreData;

        //Create new Store
        const store = new STORES({
          userId: _id,
          images: uploadedImages,
          name: storeName,
          type: storeType,
          location: storeLocation,
          documents: storeDocuments,
        });

        await store.save();

        // Upload each image in storeImages
        for (const [index, imageObj] of storeImages.entries()) {
          const result = await imagekit.upload({
            file: imageObj.file, // base64 encoded string
            fileName: `${store.id}_Image_${index}`, // Unique filename for each image
            folder: imageObj.path, // Folder to upload to in ImageKit
          });
          console.log(result);
          // Add the uploaded image URL to the array
          uploadedImages.push({
            imageId: result.fileId,
            file: result.url,
            path: imageObj.path,
          });
        }

        // Upload each document in storeDocuments
        for (const [index, document] of storeDocuments.entries()) {
          const result = await imagekit.upload({
            file: document.file, // base64 encoded string
            fileName: `${store.id}_Document_${index}`, // Unique filename for each image
            folder: document.path, // Folder to upload to in ImageKit
          });
          console.log(result);
          // Add the uploaded image URL to the array
          uploadedDocuments.push({
            documentId: result.fileId,
            name: document.name,
            file: result.url,
            path: document.path,
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
        const responseData: GetStoreResponse[] = [];

        for (const user of users) {
          const store = await STORES.findOne({ userId: user.id });

          if (store) {
            responseData.push({
              email: user.email,
              store: store,
            });
          }
        }
        // console.log(responseData);
        if (responseData) {
          // console.log(responseData);
          return res.status(200).json(<ResponseObj<GetStoreResponse[]>>{
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
      const { error } = DeleteStoreValidate(<StoreId>req.body);

      if (error)
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: error.details[0].message,
        });

      const { email, password } = <StoreId>req.body;

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
          const imagekit = new ImageKit({
            publicKey: IMAGEKIT_PUBLIC_KEY,
            privateKey: IMAGEKIT_PRIVATE_KEY,
            urlEndpoint: IMAGEKIT_BASEURL,
          });

          // Iterate through the store's images to delete them from ImageKit
          for (const imageObj of store.images) {
            if (imageObj.imageId) await imagekit.deleteFile(imageObj.imageId);
          }

          //Iterate through the store's documents to delete them from ImageKit
          for (const document of store.documents) {
            if (document.documentId)
              await imagekit.deleteFile(document.documentId);
          }

          //delete store
          await STORES.findOneAndDelete({ userId: userStore.id });

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
