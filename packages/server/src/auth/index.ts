import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { sign, verify, decode } from "hono/jwt";
import {
  JwtTokenExpired,
  JwtTokenInvalid,
  type JWTPayload,
} from "hono/utils/jwt/types";
import { randomUUID } from "node:crypto";

import bcrypt from "bcrypt";
import { tokens } from "../constants/index.js";

export const auth = new Hono().basePath("/auth");

type User = {
  id: string;
  name: string;
  login: string;
  email: string | null;
  avatar: string | null;
  password: string;
};

type AuthJWTPayload = JWTPayload & {
  data: User;
};

const db: { users: User[] } = {
  users: [
    {
      id: "1",
      login: "admin",
      password: await generatePasswordHash("admin"),
      name: "Alexander",
      avatar: null,
      email: null,
    },
  ],
};

const getUserByLogin = (userLogin: User["login"]) => {
  return db.users.find((user) => user.login === userLogin);
};

const getUserById = (userId: User["id"]) => {
  return db.users.find((user) => user.id === userId);
};

auth.get("/", async (c) => {
  const accessTokenResult = await checkAccessToken(
    c.req.header("Authorization")
  );

  if (accessTokenResult.success) {
    return c.json(accessTokenResult);
  }

  const refreshToken = getCookie(c, tokens.refresh.cookie);
  const refreshTokenResult = await checkRefreshToken(refreshToken);

  if (!accessTokenResult.success && !refreshTokenResult.success) {
    deleteCookie(c, tokens.refresh.cookie);
    return c.json("Tokens not found", 401);
  }

  const newAccessToken = await generateAccessToken(
    refreshTokenResult.data.user!
  );

  return c.json({
    ...refreshTokenResult,
    data: {
      user: {
        id: refreshTokenResult.data.user!.id,
        login: refreshTokenResult.data.user!.login,
        name: refreshTokenResult.data.user!.name,
        avatar: refreshTokenResult.data.user?.avatar,
        email: refreshTokenResult.data.user?.email,
      },
      accessToken: newAccessToken,
    },
  });
});

auth.post(
  "/sign-in",
  zValidator(
    "json",
    z.object({
      login: z.string(),
      password: z.string(),
    }),
    async (result, c) => {
      if (!result.success) {
        return c.json({ success: false, message: result.error.message }, 400);
      }

      const { login, password } = result.data;

      const incorrectResponse = c.json(
        { message: "Login or password is not correct", success: false },
        401
      );

      const user = getUserByLogin(login);
      if (!user) {
        return c.json(
          {
            success: false,
            message: "User not found",
          },
          401
        );
      }

      const isPasswordMatch = comparePassword(password, user.password);
      if (!isPasswordMatch) {
        return incorrectResponse;
      }

      const accessToken = await generateAccessToken(user);
      const refreshToken = await generateRefreshToken(user);

      setCookie(c, tokens.refresh.cookie, refreshToken, {
        secure: true,
        httpOnly: true,
        sameSite: "strict",
        maxAge: tokens.refresh.expInSec,
      });

      return c.json({
        data: {
          accessToken,
          user: {
            id: user.id,
            login: user.login,
            name: user.name,
            avatar: user.avatar,
            email: user.email,
          },
        },
        success: true,
      });
    }
  )
);

auth.post("/sign-up", (c) => {
  return c.json({ message: "success" });
});

auth.get("/check-refresh", async (c) => {
  const refreshToken = getCookie(c, tokens.refresh.cookie);

  if (!refreshToken) {
    return c.json(
      {
        data: {
          hasRefreshToken: false,
        },
        success: true,
      },
      200
    );
  }

  return c.json({
    data: {
      hasRefreshToken: true,
    },
    success: true,
  });
});

auth.get("/refresh", async (c) => {
  const refreshToken = getCookie(c, tokens.refresh.cookie);
  const refreshTokenResult = await checkRefreshToken(refreshToken);

  if (!refreshTokenResult.success) {
    return c.json(refreshTokenResult);
  }

  try {
    const accessToken = await generateAccessToken(refreshTokenResult.data);
    return c.json({
      data: { accessToken, user: refreshTokenResult.data.user },
      success: true,
    });
  } catch (error) {
    return c.json({ message: "Unexpected error", error }, 401);
  }
});

auth.post("/sign-out", (c) => {
  deleteCookie(c, tokens.refresh.cookie);

  return c.json({ success: true });
});

async function checkAccessToken(authHeader: string | undefined): Promise<{
  data: { user: User | null };
  error: string | null;
  success: boolean;
}> {
  if (!authHeader) {
    return { success: false, data: { user: null }, error: null };
  }

  const accessToken = tokenUtils.extractToken(authHeader);
  if (!accessToken) {
    return {
      success: false,
      data: { user: null },
      error: "Invalid access token format",
    };
  }

  try {
    const payload = (await verify(
      accessToken,
      tokens.access.secret
    )) as AuthJWTPayload;

    const user = getUserById(payload.data.id);
    if (!user) {
      return { success: false, data: { user: null }, error: "User not found" };
    }

    return { success: true, data: { user: null }, error: null };
  } catch (error) {
    return {
      success: false,
      data: { user: null },
      error: "Invalid access token",
    };
  }
}

async function checkRefreshToken(refreshToken: string | undefined): Promise<{
  data: {
    user: User | null;
  };
  success: boolean;
  error: string | null;
}> {
  if (!refreshToken) {
    return {
      success: false,
      data: { user: null },
      error: "Refresh token not provided",
    };
  }

  try {
    const payload = (await verify(
      refreshToken,
      tokens.refresh.secret
    )) as AuthJWTPayload;

    const user = getUserById(payload.data.id);
    if (!user) {
      return {
        data: { user: null },
        success: false,
        error: "User not found",
      };
    }

    return { success: true, data: { user }, error: null };
  } catch (error) {
    let message;

    switch (true) {
      case error instanceof JwtTokenExpired:
        message = "Refresh token expired";
      case error instanceof JwtTokenInvalid:
        message = "Refresh token invalid";
      default:
        message = "Invalid refresh token";
    }

    return {
      data: { user: null },
      error: message,
      success: false,
    };
  }
}

export function generateAccessToken<TData extends Record<string, unknown>>(
  payload: TData
) {
  const { expInSec, secret } = tokens.access;
  return tokenUtils.generateToken(payload, expInSec, secret);
}

export function generateRefreshToken<TData extends Record<string, unknown>>(
  payload: TData
) {
  const { expInSec, secret } = tokens.refresh;
  return tokenUtils.generateToken(payload, expInSec, secret);
}

function generatePasswordHash(password: string) {
  return bcrypt.hash(password, 12);
}

function comparePassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}

const tokenUtils = {
  generateToken<TData extends Record<string, unknown>>(
    payload: TData,
    expInSec: number,
    secret: string
  ) {
    return sign(
      {
        data: payload,
        jti: randomUUID(),
        exp: this.getTokenExpiration(expInSec),
      },
      secret
    );
  },
  getTokenExpiration(expiresInSeconds: number) {
    return Math.floor(Date.now() / 1000) + expiresInSeconds;
  },
  decodeToken(token: string) {
    return decode(token);
  },
  extractToken(authHeader: string) {
    if (!authHeader) return null;

    const parts = authHeader.split(" ");

    if (parts.length === 2 && parts[0] === "Bearer") {
      return parts[1];
    }

    return null;
  },
};
