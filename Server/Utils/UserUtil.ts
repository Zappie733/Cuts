import nodemailer from "nodemailer";
// import crypto from "crypto";
import { SERVICE, USER, PASS } from "../Config";

// export const getRandomToken = () => {
//   return crypto.randomBytes(32).toString("hex");
// };

export const sendEmail = async (
  type:
    | "account"
    | "password"
    | "updateProfile"
    | "rejectStore"
    | "holdStore"
    | "unHoldStore",
  email: string,
  subject: string,
  text: string,
  name?: string
) => {
  try {
    const transporter = nodemailer.createTransport({
      // host: EMAILHOST,
      service: SERVICE,
      // port: EMAIL_PORT,
      // secure: SECURE,
      auth: {
        user: USER,
        pass: PASS,
      },
    });

    await transporter.sendMail({
      from: USER,
      to: email,
      subject: subject,
      // text: text,
      html:
        type === "account"
          ? `
        <p>Hi ${name},</p>
        <p>Thank you for registering! Please verify your email address by clicking the link below:</p>
        <a href="${text}">Verify Email</a>
        <p>If the link doesn't work, copy and paste this URL into your browser: <br>${text}</p>
        <p>Thank you!</p>
        `
          : type === "password"
          ? `
        <p>Hi ${name},</p>
        <p>You had a request to change your password! Please verify that it is you by clicking the link below:</p>
        <a href="${text}">Verify Password</a>
        <p>If the link doesn't work, copy and paste this URL into your browser: <br>${text}</p>
        <p>Thank you!</p>
        `
          : type === "updateProfile"
          ? `
        <p>Hi ${name},</p>
        <p>You had a request to update your profile. If you made this change, please verify your account by clicking the link below:</p>
        <a href="${text}">Verify Account</a>
        <p>If the link doesn't work, copy and paste this URL into your browser: <br>${text}</p>
        <p>If you have any concerns, please contact support immediately.</p>
        <p>Thank you!</p>
        `
          : type === "rejectStore"
          ? `
        <p>Hi ${name},</p>
        <p>Your store registration was rejected by our admin.</p>
        <p>Here are the reasons:</p>
        <ul>
          ${text
            .split("\n")
            .map((reason) => `<li>${reason}</li>`)
            .join("")}
        </ul>
        <p>You can also review your rejected store in the app.</p>
        <p>Thank you!</p>
        `
          : type === "holdStore"
          ? `
        <p>Hi ${name},</p>
        <p>Your store is on hold by our admin.</p>
        <p>Here are the reasons:</p>
        <ul>
          ${text
            .split("\n")
            .map((reason) => `<li>${reason}</li>`)
            .join("")}
        </ul>
        <p>Fix the problem and reply this email to unHold your store.</p>
        <p>Thank you!</p>
        `
          : type === "unHoldStore"
          ? `
        <p>Hi ${name},</p>
        <p>Your store is being un-hold by our admin.</p>
        <p>You can now Actived back your store in the app.</p>
        <p>Thank you!</p>
        `
          : "",
    });
    console.log("Email send successfully");
  } catch (error) {
    console.log("Email not send");
    console.log(error);
  }
};
