import { Request, Response } from "express";
import { USERS } from "../Models/UserModel";
import {
  RegisterValidate,
  LoginValidate,
  RefreshTokenValidate,
} from "../Validation";
import {
  UserObj,
  AuthUser,
  RefreshToken,
  PayloadObj,
  PayloadVerifyTokenObj,
  UpdateUserParams,
  ImageRequestObj,
} from "../dto";
import bcrypt from "bcrypt";
import {
  generateTokens,
  generateVerifyTokens,
  verifyAccessToken,
  verifyRefreshToken,
  verifyVerifyToken,
} from "../Utils/UserTokenUtil";
import {
  ACCESS_TOKEN_PRIVATE_KEY,
  SALT,
  BASE_URL,
  IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_BASEURL,
} from "../Config";
import jwt from "jsonwebtoken";
import {
  GetNewAccessTokenResponse,
  LoginDataResponse,
  ResponseObj,
  UserProfileResponse,
} from "../Response";
import { USERTOKENS } from "../Models/UserTokenModel";

import { sendEmail } from "../Utils/UserUtil";
import { ChangePasswordValidate } from "../Validation/ChangePasswordValidate";
import { UpdateUserValidate } from "../Validation/UpdateUserValidate";
import { STORES } from "../Models/StoreModel";
import ImageKit from "imagekit";

export const registerUser = async (req: Request, res: Response) => {
  try {
    //Validate Inputs
    const { error } = RegisterValidate(<UserObj>req.body);
    //console.log(error);
    if (error)
      return res
        .status(400)
        .json(<ResponseObj>{ error: true, message: error.details[0].message });

    const { firstName, lastName, email, password, phone, role } = <UserObj>(
      req.body
    );

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

    //Create New User
    const user = new USERS({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role,
    });
    console.log(user);
    //Save User
    await user.save();

    const verifiedToken = await generateVerifyTokens({
      _id: user.id,
      verified: true,
    });

    const url = `${BASE_URL}/user/${user._id}/verifyUser/${verifiedToken}`;
    await sendEmail("account", user.email, "Verify Email", url, user.firstName);

    return res.status(201).json(<ResponseObj>{
      error: false,
      message: "An Email sent to your account, please verify your account",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(<ResponseObj>{ error: true, message: "Internal Server error" });
  }
};

export const verifyUser = async (req: Request, res: Response) => {
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

      if (user.role === "user") {
        await user.updateOne({ id: _id, verified: verified });

        return res.render("verification", {
          isError: false,
          message: "Your account has been verified successfully!",
        });
      } else if (user.role === "store") {
        await user.updateOne({ id: _id, verified: verified });

        const { pendingStoreData } = user;

        const imagekit = new ImageKit({
          publicKey: IMAGEKIT_PUBLIC_KEY,
          privateKey: IMAGEKIT_PRIVATE_KEY,
          urlEndpoint: IMAGEKIT_BASEURL,
        });

        // Array to store the uploaded image URLs
        const uploadedImages: ImageRequestObj[] = [];

        if (pendingStoreData) {
          const { storeImages, storeName, storeLocation, storeType } =
            pendingStoreData;

          //Create new Store
          const store = new STORES({
            userId: _id,
            images: uploadedImages,
            name: storeName,
            type: storeType,
            location: storeLocation,
          });

          await store.save();

          // Upload each image in storeImages
          for (const [index, imageObj] of storeImages.entries()) {
            const result = await imagekit.upload({
              file: imageObj.file, // base64 encoded string
              fileName: `${store.id}_Store_${index}`, // Unique filename for each image
              folder: imageObj.path, // Folder to upload to in ImageKit
            });
            // Add the uploaded image URL to the array
            uploadedImages.push({
              imageId: result.fileId,
              file: result.url,
              path: imageObj.path,
            });
          }

          await store.updateOne({ images: uploadedImages });
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
    }

    return res.render("verification", {
      isError: true,
      message: response.message,
    });
  } catch (error) {
    return res.render("verification", {
      isError: true,
      message: "An internal error occurred. Please try again later.",
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    //Validate Inputs
    const { error } = LoginValidate(<AuthUser>req.body);
    if (error)
      return res
        .status(400)
        .json(<ResponseObj>{ error: true, message: error.details[0].message });

    const { email, password } = <AuthUser>req.body;

    //Check if user exist
    const user = await USERS.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json(<ResponseObj>{
        error: true,
        message: "Invalid Email Or Password",
      });
    }

    //Validate Password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json(<ResponseObj>{
        error: true,
        message: "Invalid Password Or Password",
      });
    }

    //verify account
    if (!user.verified) {
      //check token expired
      const verifiedToken = await generateVerifyTokens({
        _id: user.id,
        verified: true,
      });

      const url = `${BASE_URL}/user/${user._id}/verifyUser/${verifiedToken}`;
      await sendEmail("account", user.email, "Verify Email", url);

      return res.status(400).json(<ResponseObj>{
        error: true,
        message: "You have not verified your account, please check your email",
      });
    }
    //Generate Access Token And Refresh Token
    //const token = user.generateAuthToken();
    const { accessToken, refreshToken } = await generateTokens({
      _id: user.id,
      role: user.role,
    });

    return res.status(200).json(<ResponseObj<LoginDataResponse>>{
      error: false,
      data: { _id: user._id, accessToken, refreshToken },
      message: "Logged in successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json(<ResponseObj>{ error: true, message: "Internal Server error" });
  }
};

export const getAccessTokenByRefreshToken = async (
  req: Request,
  res: Response
) => {
  try {
    const { error } = RefreshTokenValidate(<RefreshToken>req.body);
    if (error)
      return res
        .status(400)
        .json(<ResponseObj>{ error: true, message: error.details[0].message });

    const { refreshToken } = <RefreshToken>req.body;

    // Verify the refresh token
    const response: ResponseObj<PayloadObj> = await verifyRefreshToken({
      refreshToken,
    });
    //console.log(response);
    if (!response.error) {
      const payload = <PayloadObj>{
        _id: response.data?._id,
        role: response.data?.role,
      };

      const accessToken = jwt.sign(payload, ACCESS_TOKEN_PRIVATE_KEY, {
        expiresIn: "30m",
      });

      return res.status(200).json(<ResponseObj<GetNewAccessTokenResponse>>{
        error: false,
        data: { accessToken },
        message: "Access token created successfully",
      });
    }

    return res
      .status(402)
      .json(<ResponseObj>{ error: true, message: response.message });
  } catch (error) {
    return res.status(500).json(<ResponseObj>{
      error: true,
      message: "Internal Server Error",
    });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    const { error } = RefreshTokenValidate(<RefreshToken>req.body);
    if (error)
      return res
        .status(400)
        .json(<ResponseObj>{ error: true, message: error.details[0].message });

    const { refreshToken } = <RefreshToken>req.body;
    const userToken = await USERTOKENS.findOne({ refreshToken });
    if (!userToken)
      return res.status(200).json(<ResponseObj>{
        error: false,
        message: "Logged Out Successfully",
      });

    await USERTOKENS.deleteOne({ _id: userToken._id });

    return res.status(200).json(<ResponseObj>{
      error: false,
      message: "Logged Out Successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json(<ResponseObj>{ error: true, message: "Internal Server error" });
  }
};

export const changeUserPassword = async (req: Request, res: Response) => {
  try {
    //Validate Inputs
    const { error } = ChangePasswordValidate(<AuthUser>req.body);
    if (error)
      return res
        .status(400)
        .json(<ResponseObj>{ error: true, message: error.details[0].message });

    const { email, password } = <AuthUser>req.body;

    //Check if user exist
    const user = await USERS.findOne({ email: email });

    if (!user) {
      return res.status(401).json(<ResponseObj>{
        error: true,
        message: "Invalid Email",
      });
    }

    const verifiedToken = await generateVerifyTokens({
      _id: user.id,
      password: password,
    });

    const url = `${BASE_URL}/user/${user._id}/verifyUserPassword/${verifiedToken}`;

    await sendEmail("password", user.email, "Verify", url, user.firstName);

    return res.status(201).json(<ResponseObj>{
      error: true,
      message: "Please check your email to verified the new password",
    });
  } catch (error) {
    return res
      .status(500)
      .json(<ResponseObj>{ error: true, message: "Internal Server error" });
  }
};

export const verifyUserPassword = async (req: Request, res: Response) => {
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
    //console.log(response);
    if (!response.error && response.data) {
      const { _id, password } = response.data;

      //Hash Password
      const salt = await bcrypt.genSalt(parseInt(SALT || "10"));
      const hashedPassword = await bcrypt.hash(password ? password : "", salt);

      await user.updateOne({ id: _id, password: hashedPassword });

      return res.render("verification", {
        isError: false,
        message: "Your password has been changed successfully!",
      });
    }

    return res.render("verification", {
      isError: true,
      message: response.message,
    });
  } catch (error) {
    return res.render("verification", {
      isError: true,
      message: "An internal error occurred. Please try again later.",
    });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
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
    // console.log(response.error);
    if (!response.error) {
      const payload = <PayloadObj>{
        _id: response.data?._id,
        role: response.data?.role,
      };

      // Fetch the user profile from the database
      const user = await USERS.findById(payload._id).select("-password"); // Exclude password from the response

      if (!user) {
        return res.status(404).json(<ResponseObj>{
          error: true,
          message: "User not found",
        });
      }

      return res.status(200).json(<ResponseObj<UserProfileResponse>>{
        error: false,
        data: user,
        message: "User profile retrieved successfully",
      });
    }

    return res
      .status(401)
      .json(<ResponseObj>{ error: true, message: response.message });
  } catch (error) {
    return res.status(500).json(<ResponseObj>{
      error: true,
      message: "Internal Server Error",
    });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
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

    // console.log(response.error);
    if (!response.error) {
      const payload = <PayloadObj>{
        _id: response.data?._id,
        role: response.data?.role,
      };

      //Validate Inputs
      const { error } = UpdateUserValidate(<UpdateUserParams>req.body);
      //console.log(error);
      if (error)
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: error.details[0].message,
        });

      const user = await USERS.findOne({ _id: payload._id });

      const { firstName, lastName, email, phone } = <UpdateUserParams>req.body;
      console.log(firstName, lastName, email, phone);
      //Check if user change email and if the new email exist
      if (email !== user?.email) {
        const isEmailExist = await USERS.findOne({ email: email });
        if (isEmailExist)
          return res.status(409).json(<ResponseObj>{
            error: true,
            message: "User with given email is already exist",
          });
      }

      const verifiedToken = await generateVerifyTokens({
        _id: payload._id,
        updateUserParams: {
          email,
          firstName,
          lastName,
          phone,
        },
      });

      const url = `${BASE_URL}/user/${payload._id}/verifyUpdateUser/${verifiedToken}`;

      await sendEmail("updateProfile", email, "Verify", url, user?.firstName);

      return res.status(201).json(<ResponseObj>{
        error: false,
        message: "Please check your email to verify",
      });
    }

    return res
      .status(401)
      .json(<ResponseObj>{ error: true, message: response.message });
  } catch (error) {
    return res.status(500).json(<ResponseObj>{
      error: true,
      message: "Internal Server Error",
    });
  }
};

export const verifyUpdateUser = async (req: Request, res: Response) => {
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
      console.log(response);
      const { updateUserParams } = response.data;

      if (updateUserParams) {
        const { firstName, lastName, email, phone }: UpdateUserParams =
          updateUserParams;

        await USERS.findByIdAndUpdate(
          req.params.id,
          { firstName, lastName, email, phone },
          { new: true }
        );

        return res.render("verification", {
          isError: false,
          message: "Your Account has been successfully updated!",
        });
      }
    }

    return res.render("verification", {
      isError: true,
      message: response.message,
    });
  } catch (error) {
    return res.render("verification", {
      isError: true,
      message: "An internal error occurred. Please try again later.",
    });
  }
};
