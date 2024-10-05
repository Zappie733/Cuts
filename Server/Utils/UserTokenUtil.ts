import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_PRIVATE_KEY, REFRESH_TOKEN_PRIVATE_KEY } from "../Config";
import {
  UserObj,
  RefreshToken,
  PayloadObj,
  PayloadVerifyTokenObj,
  VerifyToken,
  AccessToken,
} from "../dto";
import { USERTOKENS } from "../Models/UserTokenModel";
import { ResponseObj } from "../Response";
import { VERIFIEDTOKENS } from "../Models/VerifiedTokenModel";

export const generateTokens = async (payloadObj: PayloadObj) => {
  try {
    const payload = <PayloadObj>{ _id: payloadObj._id, role: payloadObj.role };

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_PRIVATE_KEY, {
      expiresIn: "30m",
    });

    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_PRIVATE_KEY, {
      expiresIn: "30d",
    });

    //dicomment karena kayaknya kalau tiap login di delete maka nanti tidak bisa login di 2 tempat dengan akun yang sama dalam satu waktu
    //nantinya refresh token yang sesuai dengan device yang digunakan akan didelete ketika log out
    // const userToken = await USERTOKENS.findOne({ userId: payloadObj._id });
    // if (userToken) {
    //   await USERTOKENS.deleteOne({ _id: userToken._id });
    // }

    const newUserToken = new USERTOKENS({
      userId: payloadObj._id,
      refreshToken,
    });

    await newUserToken.save();

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error("Token generation failed");
  }
};

export const verifyRefreshToken = async (
  data: RefreshToken
): Promise<ResponseObj<PayloadObj>> => {
  try {
    // Check if the token exists in the database
    const userToken = await USERTOKENS.findOne({
      refreshToken: data.refreshToken,
    });
    if (!userToken) {
      return {
        error: true,
        message: "Invalid Refresh Token",
      };
    }

    // Verify the refresh token
    const tokenDetails = jwt.verify(
      data.refreshToken,
      REFRESH_TOKEN_PRIVATE_KEY
    ) as PayloadObj;

    // If token is verified, return success message with token details
    return {
      error: false,
      message: "Token is valid",
      data: tokenDetails, // Return token details if needed
    };
  } catch (error) {
    console.log(error);
    return {
      error: true,
      message: "Invalid Refresh Token",
    };
  }
};

export const generateVerifyTokens = async (
  payloadVerifyTokenObj: PayloadVerifyTokenObj
) => {
  try {
    const payload = <PayloadVerifyTokenObj>{
      _id: payloadVerifyTokenObj._id,
      password: payloadVerifyTokenObj.password,
      verified: payloadVerifyTokenObj.verified,
      updateUserParams: payloadVerifyTokenObj.updateUserParams,
    };

    const token = jwt.sign(payload, REFRESH_TOKEN_PRIVATE_KEY, {
      expiresIn: "10m",
    });

    const verifyToken = await VERIFIEDTOKENS.findOne({
      userId: payloadVerifyTokenObj._id,
    });
    if (verifyToken) {
      await VERIFIEDTOKENS.deleteOne({ _id: verifyToken._id });
    }

    const newVerifyToken = new VERIFIEDTOKENS({
      userId: payloadVerifyTokenObj._id,
      token,
    });

    await newVerifyToken.save();

    return token;
  } catch (error) {
    throw new Error("Token generation failed");
  }
};

export const verifyVerifyToken = async (
  data: VerifyToken
): Promise<ResponseObj<PayloadVerifyTokenObj>> => {
  try {
    // Check if the token exists in the database
    const verifiedToken = await VERIFIEDTOKENS.findOne({
      token: data?.verifyToken,
    });
    if (!verifiedToken) {
      return {
        error: true,
        message: "Invalid Verification Token",
      };
    }

    // Verify the refresh token
    const tokenDetails = jwt.verify(
      data.verifyToken,
      REFRESH_TOKEN_PRIVATE_KEY
    ) as PayloadVerifyTokenObj;

    //delete token (one use only)
    await verifiedToken.deleteOne({ _id: verifiedToken._id });

    console.log(tokenDetails);
    // If token is verified, return success message with token details
    return {
      error: false,
      message: "Token is valid",
      data: tokenDetails, // Return token details if needed
    };
  } catch (error) {
    console.log(error);
    return {
      error: true,
      message: "Invalid Verification Token",
    };
  }
};

export const verifyAccessToken = async (
  data: AccessToken
): Promise<ResponseObj<PayloadObj>> => {
  try {
    // Verify the refresh token
    const tokenDetails = jwt.verify(
      data.accessToken,
      ACCESS_TOKEN_PRIVATE_KEY
    ) as PayloadObj;

    // If token is verified, return success message with token details
    return {
      error: false,
      message: "Access Token is valid",
      data: tokenDetails,
    };
  } catch (error) {
    console.log(error);
    return {
      error: true,
      message: "Invalid Access Token",
    };
  }
};
