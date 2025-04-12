import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS } from "../config/env";

export const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});
