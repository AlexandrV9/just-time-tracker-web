import { fileURLToPath } from "node:url";
import { createTransport, type Transporter } from "nodemailer";
import { config } from "shared/index.js";
import type {
  IVerificationCodeMailer,
  VerificationEmailLang,
} from "../../domain/index.js";

const LOGO_CID = "app-logo";
const logoPath = fileURLToPath(
  new URL("../../../../shared/assets/logo.png", import.meta.url),
);

const DEFAULT_LANG: VerificationEmailLang = "en";
const APP_NAME = "Just Time Tracker";
const BRAND_START = "#4F46E5";
const BRAND_END = "#8B5CF6";

type EmailStrings = {
  subject: string;
  useCodeBelow: string;
  validityNote: (ttlMinutes: number) => string;
  yourCode: (code: string) => string;
  disclaimer: string;
};

const STRINGS: Record<VerificationEmailLang, EmailStrings> = {
  en: {
    subject: "verification code",
    useCodeBelow: "Use the code below to confirm:",
    validityNote: (m) =>
      `The code is valid for ${m} min from the moment it was sent.`,
    yourCode: (code) => `Your verification code: ${code}`,
    disclaimer:
      "This email was sent automatically, please do not reply to it. " +
      "If you did not request this code, simply ignore this message.",
  },
  ru: {
    subject: "код подтверждения",
    useCodeBelow: "Используйте код ниже для подтверждения:",
    validityNote: (m) => `Код действует ${m} мин. с момента отправки.`,
    yourCode: (code) => `Ваш код подтверждения: ${code}`,
    disclaimer:
      "Это письмо было отправлено автоматически, пожалуйста, не отвечайте на него. " +
      "Если вы не запрашивали данный код, просто проигнорируйте это сообщение.",
  },
  zh: {
    subject: "验证码",
    useCodeBelow: "请使用以下验证码进行确认：",
    validityNote: (m) => `验证码自发送起 ${m} 分钟内有效。`,
    yourCode: (code) => `您的验证码：${code}`,
    disclaimer:
      "此邮件为系统自动发送，请勿回复。" +
      "如果您没有请求此验证码，请忽略此邮件。",
  },
};

/**
 * SMTP-транспорт для отправки verification/reset кода (nodemailer).
 */
export class SmtpVerificationCodeMailer implements IVerificationCodeMailer {
  private readonly transporter: Transporter;
  private readonly from: string | { name: string; address: string };

  constructor() {
    const { host, port, user, password } = config.email.smtp;

    if (!host || !user || !password) {
      throw new Error("SMTP configuration is incomplete");
    }

    // Порт 465 — implicit TLS; 587/25 — plaintext с апгрейдом через STARTTLS.
    // Выбор по порту избегает mismatch "wrong version number" при handshake.
    const secure = port === 465;

    this.transporter = createTransport({
      host,
      port,
      secure,
      requireTLS: !secure,
      auth: { user, pass: password },
    });

    // EMAIL_FROM может уже быть в формате "Name <email>"; fromName
    // добавляем только к голому адресу — форматирование/encoding делает nodemailer.
    this.from = config.email.from.includes("<")
      ? config.email.from
      : { name: config.email.fromName, address: config.email.from };
  }

  async sendVerificationCode(params: {
    to: string;
    code: string;
    lang?: VerificationEmailLang;
  }): Promise<void> {
    const { subject, text, html } = this.buildVerificationEmail(
      params.code,
      params.lang,
    );

    await this.transporter.sendMail({
      from: this.from,
      to: params.to,
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
  }

  private buildVerificationEmail(
    code: string,
    lang: VerificationEmailLang = DEFAULT_LANG,
  ): { subject: string; text: string; html: string } {
    const t = STRINGS[lang] ?? STRINGS[DEFAULT_LANG];

    // Вычисляем срок жизни кода в минутах
    const ttlMinutes = Math.max(
      1,
      Math.round(config.email.verification.codeTtlSec / 60),
    );

    const validityNote = t.validityNote(ttlMinutes);

    const text = [
      `${APP_NAME}`,
      "",
      t.yourCode(code),
      validityNote,
      "",
      t.disclaimer,
    ].join("\n");

    const html = `<!DOCTYPE html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background-color:#ffffff;border-radius:16px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
            <tr>
              <td align="center" style="padding:32px 32px 8px;">
                <img src="cid:${LOGO_CID}" width="56" height="56" alt="${APP_NAME}" style="display:block;border-radius:14px;" />
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:0 32px 24px;">
                <div style="font-size:18px;font-weight:600;color:#111827;">${APP_NAME}</div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:0 32px;">
                <div style="font-size:14px;color:#6b7280;margin-bottom:12px;">${t.useCodeBelow}</div>
                <div style="font-size:34px;font-weight:700;letter-spacing:8px;color:#111827;background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px 8px;">${code}</div>
                <div style="font-size:13px;color:#9ca3af;margin-top:12px;">${validityNote}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 0;">
                <div style="height:1px;background:linear-gradient(90deg,${BRAND_START},${BRAND_END});opacity:0.25;"></div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 32px;">
                <div style="font-size:12px;line-height:18px;color:#9ca3af;">${t.disclaimer}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

    return {
      subject: `${APP_NAME}: ${t.subject}`,
      text,
      html,
    };
  }
}
