import nodemailer from "nodemailer";
import { config } from "../config/index.js";
import type { EmailService, SendVerificationCodeParams } from "./email.types.js";

export const createSmtpEmailService = (): EmailService => {
  const { host, port, user, password, secure } = config.email.smtp;

  if (!host || !user || !password) {
    throw new Error("SMTP configuration is incomplete");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass: password },
  });

  return {
    async sendVerificationCode({ to, code }: SendVerificationCodeParams) {
      await transporter.sendMail({
        from: config.email.from,
        to,
        subject: "Your verification code",
        text: `Your verification code is: ${code}`,
        html: `<p>Your verification code is: <strong>${code}</strong></p>`,
      });
    },
  };
};
