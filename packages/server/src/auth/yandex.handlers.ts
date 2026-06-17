import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { Context } from "hono";
import type { BlankEnv, BlankInput } from "hono/types";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { config } from "../shared/index.js";
import {
  exchangeYandexCode,
  fetchYandexProfile,
  loginWithYandex,
  linkYandexToUser,
} from "./yandex.service.js";
import type { AuthVariables } from "../shared/auth/auth.variables.js";

const OAUTH_STATE_COOKIE = "oauth_state";
const OAUTH_STATE_TTL_SEC = 60 * 10; // 10 minutes

// ── State cookie helpers ────────────────────────────────────────────────────

type OAuthStatePayload =
  | { intent: "login"; redirect: string; nonce: string }
  | { intent: "link"; userId: string; nonce: string };

const hmacSign = (data: string): string => {
  return createHmac("sha256", config.auth.accessToken.secret)
    .update(data)
    .digest("hex");
};

const encodeState = (payload: OAuthStatePayload): string => {
  const json = JSON.stringify(payload);
  const base64 = Buffer.from(json).toString("base64url");
  const signature = hmacSign(base64);
  return `${base64}.${signature}`;
};

const decodeState = (raw: string): OAuthStatePayload | null => {
  try {
    const dot = raw.lastIndexOf(".");
    if (dot === -1) return null;
    const base64 = raw.slice(0, dot);
    const signature = raw.slice(dot + 1);
    const expectedSignature = hmacSign(base64);
    if (
      !timingSafeEqual(
        Buffer.from(signature, "hex"),
        Buffer.from(expectedSignature, "hex"),
      )
    ) {
      return null;
    }
    return JSON.parse(
      Buffer.from(base64, "base64url").toString(),
    ) as OAuthStatePayload;
  } catch {
    return null;
  }
};

const safeRedirect = (path: string): string => {
  // Only allow relative paths starting with /
  if (path && /^\/[^/]/.test(path)) return path;
  if (path === "/") return "/";
  return "/";
};

// ── Handlers ────────────────────────────────────────────────────────────────

/** GET /auth/yandex — start login flow */
const startLogin = async (c: Context<BlankEnv, "/auth/yandex", BlankInput>) => {
  const redirect = safeRedirect(c.req.query("redirect") ?? "/");
  const nonce = randomBytes(16).toString("hex");

  const state = encodeState({ intent: "login", redirect, nonce });

  setCookie(c, OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "Lax",
    secure: config.app.isProduction,
    maxAge: OAUTH_STATE_TTL_SEC,
    path: "/",
  });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.yandex.clientId,
    redirect_uri: config.yandex.redirectUri,
    state: nonce,
  });

  return c.redirect(`https://oauth.yandex.ru/authorize?${params.toString()}`);
};

/** POST /auth/yandex/link — start link flow (protected, requires Bearer) */
const startLink = async (
  c: Context<{ Variables: AuthVariables }, "/auth/yandex/link", BlankInput>,
) => {
  const userId = c.get("user").id;
  const nonce = randomBytes(16).toString("hex");

  const state = encodeState({ intent: "link", userId, nonce });

  setCookie(c, OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "Lax",
    secure: config.app.isProduction,
    maxAge: OAUTH_STATE_TTL_SEC,
    path: "/",
  });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.yandex.clientId,
    redirect_uri: config.yandex.redirectUri,
    state: nonce,
  });

  return c.json({
    success: true,
    data: {
      redirectUrl: `https://oauth.yandex.ru/authorize?${params.toString()}`,
    },
  });
};

/** GET /auth/yandex/callback — OAuth callback from Yandex */
const callback = async (
  c: Context<BlankEnv, "/auth/yandex/callback", BlankInput>,
) => {
  const code = c.req.query("code");
  const stateParam = c.req.query("state");
  const rawState = getCookie(c, OAUTH_STATE_COOKIE);

  deleteCookie(c, OAUTH_STATE_COOKIE, { path: "/" });

  const clientUrl = config.clientUrl;

  if (!code || !rawState) {
    return c.redirect(`${clientUrl}/callback?error=missing_params`);
  }

  const statePayload = decodeState(rawState);
  if (!statePayload || statePayload.nonce !== stateParam) {
    return c.redirect(`${clientUrl}/callback?error=invalid_state`);
  }

  let profile;
  try {
    const yandexToken = await exchangeYandexCode(code);
    profile = await fetchYandexProfile(yandexToken);
  } catch (err) {
    console.error("Yandex OAuth error:", err);
    return c.redirect(`${clientUrl}/callback?error=yandex_error`);
  }

  // ── Link flow ──────────────────────────────────────────────────────────────
  if (statePayload.intent === "link") {
    const result = await linkYandexToUser(statePayload.userId, profile);
    if (!result.success) {
      const errCode =
        result.message === "YANDEX_ALREADY_LINKED"
          ? "yandex_already_linked"
          : result.message === "PROVIDER_ALREADY_CONNECTED"
            ? "provider_already_connected"
            : "link_error";
      return c.redirect(`${clientUrl}/settings/security?error=${errCode}`);
    }
    return c.redirect(`${clientUrl}/settings/security?linked=yandex`);
  }

  // ── Login flow ─────────────────────────────────────────────────────────────
  const result = await loginWithYandex(profile);
  if (!result.success) {
    if (result.message === "EMAIL_ALREADY_EXISTS") {
      return c.redirect(`${clientUrl}/callback?error=email_exists`);
    }
    return c.redirect(`${clientUrl}/callback?error=login_error`);
  }

  const { refreshToken, redirect } = {
    refreshToken: result.data.refreshToken,
    redirect: statePayload.redirect,
  };

  setCookie(c, config.auth.refreshToken.cookie, refreshToken, {
    httpOnly: true,
    sameSite: "Strict",
    secure: config.app.isProduction,
    maxAge: config.auth.refreshToken.expInSec,
    path: "/",
  });

  const redirectTo = encodeURIComponent(redirect);
  return c.redirect(`${clientUrl}/callback?redirect=${redirectTo}`);
};

export const yandexHandlers = {
  startLogin,
  startLink,
  callback,
};
