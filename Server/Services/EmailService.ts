import { BASE_URL } from "../Config";
import { sendEmail } from "../Utils/UserUtil";
import { generateVerifyTokens } from "../Utils/UserTokenUtil";

export async function sendVerificationEmail(user: any, storeName: string) {
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
}