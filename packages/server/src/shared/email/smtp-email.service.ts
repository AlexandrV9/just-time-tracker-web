import nodemailer from "nodemailer";
import { config } from "../config/index.js";
import type { EmailService, SendVerificationCodeParams } from "./email.types.js";
import {
  LOGO_CID,
  buildVerificationEmail,
  logoPath,
} from "./verification-email.template.js";

export const createSmtpEmailService = (): EmailService => {
  const { host, port, user, password } = config.email.smtp;

  if (!host || !user || !password) {
    throw new Error("SMTP configuration is incomplete");
  }

  // Port 465 uses implicit TLS; 587/25 start plaintext then upgrade via STARTTLS.
  // Deriving from the port avoids the "wrong version number" handshake mismatch.
  const secure = port === 465;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    auth: { user, pass: password },
  });

  // EMAIL_FROM may already be a full "Name <email>"; only attach fromName when
  // it's a bare address, and let nodemailer format/encode the header itself.
  const from = config.email.from.includes("<")
    ? config.email.from
    : { name: config.email.fromName, address: config.email.from };

  return {
    async sendVerificationCode({ to, code, lang }: SendVerificationCodeParams) {
      const { subject, text, html } = buildVerificationEmail(code, lang);
      await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
        attachments: [
          {
            filename: "logo.png",
            path: logoPath,
            cid: LOGO_CID,
            contentType: "image/png",
          },
        ],
      });
    },
  };
};
