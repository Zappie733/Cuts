import { Request, Response } from "express";
import { USERS } from "../Models/UserModel";
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
  GetAdminRecentActivityResponse,
  GetNewAccessTokenResponse,
  LoginDataResponse,
  ResponseObj,
  UpdateUserImageResponse,
  UserProfileResponse,
} from "../Response";
import { USERTOKENS } from "../Models/UserTokenModel";

import { sendEmail } from "../Utils/UserUtil";
import { ChangePasswordValidate } from "../Validation/UserValidation/ChangePasswordValidate";
import { STORES } from "../Models/StoreModel";
import ImageKit from "imagekit";
import { RegisterValidate } from "../Validation/UserValidation/RegisterValidate";
import { LoginValidate } from "../Validation/UserValidation/LoginValidate";
import { RefreshTokenValidate } from "../Validation/UserValidation/RefreshTokenValidate";
import { UpdateUserImageValidate } from "../Validation/UserValidation/UploadImageValidate";
import { UpdateUserValidate } from "../Validation/UserValidation/UpdateUserValidate";

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

      if (user.role === "user" || user.role === "admin") {
        await user.updateOne({ id: _id, verified: verified });

        return res.render("verification", {
          isError: false,
          message: "Your account has been verified successfully!",
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

    const store = await STORES.findOne({ userId: user._id });
    //verify account
    if (!user.verified) {
      //check token expired
      const verifiedToken = await generateVerifyTokens({
        _id: user.id,
        verified: true,
      });

      if (user.role === "user") {
        const url = `${BASE_URL}/user/${user._id}/verifyUser/${verifiedToken}`;
        await sendEmail("account", user.email, "Verify Email", url);
      } else if (user.role === "store") {
        const url = `${BASE_URL}/store/${user._id}/verifyStore/${verifiedToken}`;
        await sendEmail(
          "account",
          user.email,
          "Verify Email",
          url,
          `owner of ${store?.name}`
        );
      }

      return res.status(400).json(<ResponseObj>{
        error: true,
        message: "You have not verified your account, please check your email",
      });
    }

    //check if user is a store, store can only login if they are in active or in active or hold state
    if (user.role === "store") {
      if (store?.status === "Waiting for Approval") {
        return res.status(401).json(<ResponseObj>{
          error: true,
          message:
            "You are not allowed to login, you store is still in validate state. Please wait for approval",
        });
      } else if (store?.status === "Rejected") {
        return res.status(401).json(<ResponseObj>{
          error: true,
          message:
            "You are not allowed to login, your store has been rejected. Please review your registration and try again",
        });
      }
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
        message: `Profile retrieved successfully (${payload.role})`,
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

export const updateUserImage = async (req: Request, res: Response) => {
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
      const { error } = UpdateUserImageValidate(<ImageRequestObj>req.body);
      if (error)
        return res.status(400).json(<ResponseObj>{
          error: true,
          message: error.details[0].message,
        });

      const user = await USERS.findOne({ _id: payload._id });

      const { file } = <ImageRequestObj>req.body;

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
        fileName: `ProfileImage`,
        folder: `/Profiles/${user?.id}`,
      });

      //update user database with the newest profile
      await user?.updateOne({
        image: {
          imageId: result.fileId,
          file: result.url,
          path: `/Profiles/${user?.id}`,
        },
      });

      const updatedUser = await USERS.findById(user?.id);
      console.log(updatedUser?.image);

      return res.status(200).json(<ResponseObj<UpdateUserImageResponse>>{
        error: false,
        data: { image: updatedUser?.image },
        message: "Photo profile updated successfully",
      });
    }
    console.log("berhasil");
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

export const getAdminRecentActivity = async (req: Request, res: Response) => {
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

      const { activity } = req.query;
      // console.log(activity);
      let query: any = {};
      let sort: any = {};

      if (activity) {
        if (
          activity !== "Approve" &&
          activity !== "Reject" &&
          activity !== "Hold" &&
          activity !== "UnHold"
        ) {
          return res.status(400).json(<ResponseObj>{
            error: true,
            message: "Invalid status",
          });
        } else {
          if (activity === "Approve") {
            query.approvedBy = payload._id;
            sort.approvedDate = -1; // Sorting criteria for Approve
          } else if (activity === "Reject") {
            query.rejectedBy = payload._id;
            sort.rejectedDate = -1; // Sorting criteria for Reject
          } else if (activity === "Hold") {
            query.onHoldBy = payload._id;
            sort.onHoldDate = -1; // Sorting criteria for Hold
          } else if (activity === "UnHold") {
            query.unHoldBy = payload._id;
            sort.unHoldDate = -1; // Sorting criteria for UnHold
          }
        }
      }

      const recentActivities = await STORES.find(query)
        .select("email name approvedDate rejectedDate onHoldDate unHoldDate")
        .sort(sort)
        .limit(3);

      const responseData: GetAdminRecentActivityResponse = {
        activities: [],
      };

      for (const recentActivity of recentActivities) {
        responseData.activities.push(recentActivity);
      }

      return res.status(200).json(<ResponseObj<GetAdminRecentActivityResponse>>{
        error: false,
        data: responseData,
        message: `Admin recent ${activity} activities retrieved successfully`,
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
