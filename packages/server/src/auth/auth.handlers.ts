import { zValidator } from "@hono/zod-validator";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { authService } from "./auth.service.js";
import { authQueries } from "./auth.queries.js";
import type { Context } from "hono";
import type { BlankEnv, BlankInput } from "hono/types";
import { signInSchema, signUpSchema } from "./auth.schema.js";
import { config, isUuid, tokenService, validationUtils } from "../shared/index.js";
import { mapAuthUserResponse } from "../shared/auth/mapAuthUserResponse.js";

const nameRefreshTokenInCookie = config.auth.refreshToken.cookie;

const findUserByTokenId = async (userId: string) => {
  if (!isUuid(userId)) {
    return null;
  }

  return authQueries.findUserById(userId);
};

const init = async (c: Context<BlankEnv, "/auth", BlankInput>) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    return c.json({ success: false, data: { user: null }, error: null }, 401);
  }

  const accessToken = tokenService.extractToken(authHeader);

  if (accessToken) {
    const accessTokenResult = await tokenService.verifyAccessToken(accessToken);

    if (accessTokenResult.success) {
      const userId = String(accessTokenResult.payload.data.id);
      const user = await findUserByTokenId(userId);

      if (!user) {
        return c.json({ success: false, data: { user: null }, error: null }, 401);
      }

      return c.json(
        {
          success: true,
          data: {
            user: mapAuthUserResponse(user),
          },
        },
        200
      );
    }
  }

  const refreshToken = getCookie(c, "refresh_token");

  if (refreshToken) {
    const refreshTokenResult = await tokenService.verifyRefreshToken(
      refreshToken
    );

    if (refreshTokenResult.success) {
      const userId = String(refreshTokenResult.payload.data.id);
      const user = await findUserByTokenId(userId);

      if (!user) {
        deleteCookie(c, nameRefreshTokenInCookie);
        return c.json({ success: false, data: { user: null }, error: null }, 401);
      }

      const newAccessToken = await tokenService.generateAccessToken(user);

      return c.json(
        {
          success: true,
          data: {
            user: mapAuthUserResponse(user),
            accessToken: newAccessToken,
          },
        },
        200
      );
    }
  }

  deleteCookie(c, nameRefreshTokenInCookie);
  return c.json(
    {
      success: false,
      message: "Tokens not found",
    },
    401
  );
};

const signIn = zValidator("json", signInSchema, async (result, c) => {
  if (!result.success) {
    return c.json({ success: false, message: result.error.message }, 400);
  }

  const responseData = await authService.signIn(result.data);
  if (!responseData.success) {
    return c.json(responseData, 401);
  }

  setCookie(c, nameRefreshTokenInCookie, responseData.data.refreshToken, {
    secure: config.app.isProduction,
    httpOnly: true,
    sameSite: "strict",
    maxAge: config.auth.refreshToken.expInSec,
  });

  return c.json(responseData);
});

const signUp = zValidator("json", signUpSchema, async (result, c) => {
  if (!result.success) {
    return c.json(
      {
        success: false,
        data: validationUtils.formatZodErrors(result.error.message),
        message: "Some fields are filled in incorrectly",
      },
      400
    );
  }

  const responseData = await authService.signUp(result.data);
  if (!responseData.success) {
    return c.json(responseData, 401);
  }

  setCookie(c, nameRefreshTokenInCookie, responseData.data.refreshToken, {
    secure: config.app.isProduction,
    httpOnly: true,
    sameSite: "strict",
    maxAge: config.auth.refreshToken.expInSec,
  });

  return c.json({
    success: true,
    data: {
      accessToken: responseData.data.accessToken,
      user: responseData.data.user,
    },
    message: responseData.message,
  });
});

const signOut = (c: Context<BlankEnv, "/sign-out", BlankInput>) => {
  deleteCookie(c, config.auth.refreshToken.cookie);
  return c.json({ success: true });
};

const refresh = async (c: Context<BlankEnv, "/refresh", BlankInput>) => {
  const refreshToken = getCookie(c, config.auth.refreshToken.cookie);
  const refreshTokenResult = await tokenService.verifyRefreshToken(
    refreshToken
  );

  if (!refreshTokenResult.success) {
    return c.json(refreshTokenResult);
  }

  const authUser = refreshTokenResult.payload.data;

  if (!isUuid(String(authUser.id))) {
    deleteCookie(c, nameRefreshTokenInCookie);
    return c.json({ success: false, message: "Invalid token" }, 401);
  }

  try {
    const accessToken = await tokenService.generateAccessToken(authUser);
    const user = await findUserByTokenId(String(authUser.id));

    if (!user) {
      deleteCookie(c, nameRefreshTokenInCookie);
      return c.json({ success: false, message: "Invalid token" }, 401);
    }

    return c.json({
      data: { accessToken, user: mapAuthUserResponse(user) },
      success: true,
    });
  } catch (error) {
    return c.json({ message: "Unexpected error", error }, 401);
  }
};

const checkRefresh = async (
  c: Context<BlankEnv, "/check-refresh", BlankInput>
) => {
  const refreshToken = getCookie(c, config.auth.refreshToken.cookie);

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
};

export const authHandlers = {
  init,
  signIn,
  signUp,
  signOut,
  refresh,
  checkRefresh,
};
