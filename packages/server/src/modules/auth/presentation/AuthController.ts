import { loginSchema, passwordSchema } from "@time-tracker/shared";
import { Hono } from "hono";
import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { z } from "zod";
import { config, getClientIp, respondRateLimited } from "shared/index.js";
import {
  respondInternalError,
  respondValidationError,
} from "shared/utils/request.js";
import type {
  RestoreSessionUseCase,
  SignInUseCase,
  SignOutUseCase,
  SignUpUseCase,
  UpdateRefreshTokenUseCase,
} from "../application/index.js";
import {
  InvalidCredentialsException,
  InvalidTokenException,
  RateLimitedException,
  type IJwtAuthTokenManager,
} from "../domain/index.js";
import {
  UserAlreadyExistsException,
  WeakPasswordException,
} from "../../users/domain/index.js";

const signUpSchema = z.object({
  firstName: z.string().trim().min(1),
  login: loginSchema,
  password: passwordSchema,
});

const signInSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
});

/**
 * HTTP-адаптер модуля auth.
 */
export class AuthController {
  constructor(
    private readonly signUpUseCase: SignUpUseCase,
    private readonly signInUseCase: SignInUseCase,
    private readonly signOutUseCase: SignOutUseCase,
    private readonly updateRefreshTokenUseCase: UpdateRefreshTokenUseCase,
    private readonly restoreSessionUseCase: RestoreSessionUseCase,
    private readonly jwtAuthTokenManager: IJwtAuthTokenManager,
  ) {}

  register(router: Hono): void {
    router.get("/", this.handleInit);
    router.post("/sign-in", this.handleSignIn);
    router.post("/sign-up", this.handleSignUp);
    router.post("/sign-out", this.handleSignOut);
    router.get("/refresh", this.handleRefresh);
    router.get("/check-refresh", this.handleCheckRefresh);
  }

  private handleInit = async (c: Context) => {
    const authHeader = c.req.header("Authorization");
    const accessToken = authHeader
      ? this.jwtAuthTokenManager.extractTokenFromAuthHeader(authHeader)
      : null;
    const refreshToken = getCookie(c, config.auth.refreshToken.cookie);

    if (!authHeader) {
      return c.json(
        { success: false, data: { user: null }, error: null },
        401,
      );
    }

    const result = await this.restoreSessionUseCase.execute({
      accessToken,
      refreshToken,
    });

    if (result.status === "unauthorized") {
      deleteCookie(c, config.auth.refreshToken.cookie);
      return c.json(
        {
          success: false,
          message: "Tokens not found",
        },
        401,
      );
    }

    return c.json({
      success: true,
      data: {
        user: result.user,
        ...(result.accessToken ? { accessToken: result.accessToken } : {}),
      },
    });
  };

  private handleSignUp = async (c: Context) => {
    const parsed = signUpSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return respondValidationError(c, parsed.error.message);
    }

    try {
      const result = await this.signUpUseCase.execute(parsed.data);

      setCookie(c, config.auth.refreshToken.cookie, result.refreshToken, {
        secure: config.app.isProduction,
        httpOnly: true,
        sameSite: "strict",
        maxAge: config.auth.refreshToken.expInSec,
      });

      return c.json(
        {
          success: true,
          data: {
            accessToken: result.accessToken,
            user: result.user,
          },
          message: "User registered successfully",
        },
        201,
      );
    } catch (error) {
      if (error instanceof WeakPasswordException) {
        return c.json(
          {
            success: false,
            message: error.message,
            data: error.violations,
          },
          400,
        );
      }

      if (error instanceof UserAlreadyExistsException) {
        return c.json(
          {
            success: false,
            message: error.message,
          },
          409,
        );
      }

      console.error("Sign-up error:", error);
      return respondInternalError(c);
    }
  };

  private handleSignIn = async (c: Context) => {
    const parsed = signInSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return respondValidationError(c, parsed.error.message);
    }

    try {
      const result = await this.signInUseCase.execute({
        ...parsed.data,
        clientIp: getClientIp(c),
      });

      setCookie(c, config.auth.refreshToken.cookie, result.refreshToken, {
        secure: config.app.isProduction,
        httpOnly: true,
        sameSite: "strict",
        maxAge: config.auth.refreshToken.expInSec,
      });

      return c.json({
        success: true,
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user,
        },
      });
    } catch (error) {
      if (error instanceof RateLimitedException) {
        return respondRateLimited(c, error.retryAfter);
      }

      if (error instanceof InvalidCredentialsException) {
        return c.json(
          {
            success: false,
            message: error.message,
          },
          401,
        );
      }

      console.error("Sign-in error:", error);
      return respondInternalError(c);
    }
  };

  private handleSignOut = async (c: Context) => {
    await this.signOutUseCase.execute();
    deleteCookie(c, config.auth.refreshToken.cookie);
    return c.json({ success: true });
  };

  private handleRefresh = async (c: Context) => {
    const refreshToken = getCookie(c, config.auth.refreshToken.cookie);

    try {
      const result = await this.updateRefreshTokenUseCase.execute({
        refreshToken,
      });

      return c.json({
        success: true,
        data: {
          accessToken: result.accessToken,
          user: result.user,
        },
      });
    } catch (error) {
      if (error instanceof InvalidTokenException) {
        deleteCookie(c, config.auth.refreshToken.cookie);
        return c.json({ success: false, message: error.message }, 401);
      }

      console.error("Refresh error:", error);
      return c.json({ message: "Unexpected error", error }, 401);
    }
  };

  private handleCheckRefresh = async (c: Context) => {
    const refreshToken = getCookie(c, config.auth.refreshToken.cookie);

    return c.json({
      success: true,
      data: {
        hasRefreshToken: Boolean(refreshToken),
      },
    });
  };
}
