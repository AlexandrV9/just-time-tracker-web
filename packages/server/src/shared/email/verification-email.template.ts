import { fileURLToPath } from "node:url";
import { config } from "../config/index.js";

type VerificationEmailContent = {
  subject: string;
  text: string;
  html: string;
};

export type EmailLang = "en" | "ru" | "zh";

const SUPPORTED_LANGS: EmailLang[] = ["en", "ru", "zh"];
const DEFAULT_LANG: EmailLang = "en";

/** Picks a supported language from an `Accept-Language` header (e.g. "ru-RU,en;q=0.9"). */
export const resolveEmailLang = (header?: string | null): EmailLang => {
  if (!header) return DEFAULT_LANG;

  for (const part of header.split(",")) {
    const tag = part.split(";")[0]?.trim().split("-")[0]?.toLowerCase();
    const match = SUPPORTED_LANGS.find((lang) => lang === tag);
    if (match) return match;
  }

  return DEFAULT_LANG;
};

type EmailStrings = {
  subject: string;
  useCodeBelow: string;
  validityNote: (ttlMinutes: number) => string;
  yourCode: (code: string) => string;
  disclaimer: string;
};

const STRINGS: Record<EmailLang, EmailStrings> = {
  en: {
    subject: "verification code",
    useCodeBelow: "Use the code below to confirm:",
    validityNote: (m) => `The code is valid for ${m} min from the moment it was sent.`,
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

const APP_NAME = "Just Time Tracker";
const BRAND_START = "#4F46E5";
const BRAND_END = "#8B5CF6";

/**
 * Logo is embedded as an inline CID attachment instead of a remote URL: mail
 * clients can't reach localhost in dev, and the prod image proxy is flaky.
 */
export const LOGO_CID = "app-logo";
export const logoPath = fileURLToPath(new URL("./assets/logo.png", import.meta.url));

export const buildVerificationEmail = (
  code: string,
  lang: EmailLang = DEFAULT_LANG,
): VerificationEmailContent => {
  const t = STRINGS[lang] ?? STRINGS[DEFAULT_LANG];
  const ttlMinutes = Math.max(1, Math.round(config.email.verification.codeTtlSec / 60));
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
};
