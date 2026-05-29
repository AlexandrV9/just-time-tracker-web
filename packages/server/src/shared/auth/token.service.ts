import { sign, decode, verify } from "hono/jwt";
import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import type { AuthJWTPayload } from "./auth.types.js";
import { config } from "../config/index.js";

/**
 * Get expiration time token in seconds from generateToken function
 * @param {number} expiresInSeconds time in seconds
 */
const getTokenExpiration = (expiresInSeconds: number) => {
  return Math.floor(Date.now() / 1000) + expiresInSeconds;
};

const generateToken = <TData extends Record<string, unknown>>(
  payload: TData,
  expInSec: number,
  secret: string,
) => {
  return sign(
    {
      data: payload,
      jti: randomUUID(),
      exp: getTokenExpiration(expInSec),
    },
    secret,
  );
};

const extractTokenFromAuthHeader = (authHeader: string) => {
  if (!authHeader) return null;

  const parts = authHeader.split(" ");

  if (parts.length === 2 && parts[0] === "Bearer") {
    return parts[1];
  }

  return null;
};

const generateAccessToken = <TData extends Record<string, unknown>>(
  payload: TData,
) => {
  const { expInSec, secret } = config.auth.accessToken;
  return generateToken(payload, expInSec, secret);
};

const generateRefreshToken = <TData extends Record<string, unknown>>(
  payload: TData,
) => {
  const { expInSec, secret } = config.auth.refreshToken;
  return generateToken(payload, expInSec, secret);
};

const decodeToken = (token: string) => {
  return decode(token);
};

const comparePassword = (password: string, hash: string) => {
  return bcrypt.compareSync(password, hash);
};

const generatePasswordHash = (password: string) => {
  return bcrypt.hash(password, 12);
};

type VerifyAccessTokenResponse =
  | {
      success: true;
      payload: AuthJWTPayload;
    }
  | {
      success: false;
      payload: null;
    };

export const verifyAccessToken = async (
  token?: string,
): Promise<VerifyAccessTokenResponse> => {
  try {
    if (!token) {
      throw new Error();
    }

    const data = (await verify(
      token,
      config.auth.accessToken.secret,
    )) as AuthJWTPayload;

    return {
      success: true,
      payload: data,
    };
  } catch (e) {
    return {
      success: false,
      payload: null,
    };
  }
};

type VerifyRefreshTokenResponse =
  | {
      success: true;
      payload: AuthJWTPayload;
    }
  | {
      success: false;
      payload: null;
    };

export const verifyRefreshToken = async (
  token?: string,
): Promise<VerifyRefreshTokenResponse> => {
  try {
    if (!token) {
      throw new Error();
    }

    const data = (await verify(
      token,
      config.auth.refreshToken.secret,
    )) as AuthJWTPayload;

    return {
      success: true,
      payload: data,
    };
  } catch (e) {
    console.warn(e);
    return {
      success: false,
      payload: null,
    };
  }
};

export const tokenService = {
  decodeToken,
  extractToken: extractTokenFromAuthHeader,

  // access token
  generateAccessToken,
  verifyAccessToken,

  // refresh token
  generateRefreshToken,
  verifyRefreshToken,

  // password
  comparePassword,
  generatePasswordHash,
};
