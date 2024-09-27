import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_PRIVATE_KEY, REFRESH_TOKEN_PRIVATE_KEY } from "../Config";
import { UserObj, RefreshTokenObj, PayloadObj } from "../dto";
import { USERTOKEN } from "../Models/UserTokenModel";
import { ResponseObj } from "../Response";

export const generateTokens = async (user: UserObj) => {
  try {
    const payload = <PayloadObj>{ _id: user._id, roles: user.role };

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_PRIVATE_KEY, {
      expiresIn: "30m",
    });

    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_PRIVATE_KEY, {
      expiresIn: "30d",
    });

    const userToken = await USERTOKEN.findOne({ userId: user._id });
    if (userToken) {
      await USERTOKEN.deleteOne({ _id: userToken._id });
    }

    const newUserToken = new USERTOKEN({
      userId: user._id,
      refreshToken,
    });

    await newUserToken.save();

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error("Token generation failed");
  }
};

export const verifyRefreshToken = async (
  data: RefreshTokenObj
): Promise<ResponseObj<PayloadObj>> => {
  try {
    // Check if the token exists in the database
    const userToken = await USERTOKEN.findOne({
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
    return {
      error: true,
      message: "Invalid Refresh Token",
    };
  }
};
