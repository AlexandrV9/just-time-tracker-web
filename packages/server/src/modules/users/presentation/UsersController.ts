import {
  loginSchema,
  passwordSchema,
  updateProfileSchema,
} from "@time-tracker/shared";
import { Hono } from "hono";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import type { BlankSchema } from "hono/types";
import { z } from "zod";
import type { AuthVariables } from "shared/auth/auth.variables.js";
import { getAuthenticatedUserId } from "shared/auth/with-created-by-id.js";
import { config } from "shared/index.js";
import {
  respondInternalError,
  respondValidationError,
} from "shared/utils/request.js";
import type {
  AuthorizUserUseCase,
  RegisterUserUseCase,
  UpdateUserUseCase,
} from "../application/index.js";
import {
  InvalidCredentialsException,
  UserAlreadyExistsException,
  UserNotFoundException,
  WeakPasswordException,
} from "../domain/index.js";

type Router = Hono<
  {
    Variables: AuthVariables;
  },
  BlankSchema,
  "/"
>;

const registerUserSchema = z.object({
  firstName: z.string().trim().min(1),
  login: loginSchema,
  password: passwordSchema,
});

const authorizeUserSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
});

/**
 * Контроллер пользователей.
 * Отвечает за приём HTTP-запросов, валидацию
 * и делегирование выполнения сценарию использования.
 */
export class UsersController {
  constructor(
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly authorizUserUseCase: AuthorizUserUseCase,
  ) {}

  /**
   * Публичные маршруты (без auth middleware).
   */
  registerPublic(router: Hono): void {
    router.post("/register", this.handleRegister);
    router.post("/sign-in", this.handleAuthorizeUser);
  }

  /**
   * Защищённые маршруты контроллера.
   */
  register(router: Router): void {
    router.patch("/me", this.handleUpdateUser);
  }

  /**
   * Обрабатывает POST-запрос регистрации пользователя.
   */
  private handleRegister = async (c: Context<{ Variables: AuthVariables }>) => {
    const parsed = registerUserSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return respondValidationError(c, parsed.error.message);
    }

    try {
      const result = await this.registerUseCase.execute(parsed.data);
      return c.json(
        {
          success: true,
          data: result,
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

      console.error("Registration error:", error);
      return respondInternalError(c);
    }
  };

  /**
   * Обрабатывает POST-запрос авторизации пользователя.
   */
  private handleAuthorizeUser = async (
    c: Context<{ Variables: AuthVariables }>,
  ) => {
    const parsed = authorizeUserSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return respondValidationError(c, parsed.error.message);
    }

    try {
      const result = await this.authorizUserUseCase.execute(parsed.data);

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
      if (error instanceof InvalidCredentialsException) {
        return c.json(
          {
            success: false,
            message: error.message,
          },
          401,
        );
      }

      console.error("Authorization error:", error);
      return respondInternalError(c);
    }
  };

  /**
   * Обрабатывает PATCH-запрос обновления данных пользователя.
   */
  private handleUpdateUser = async (
    c: Context<{ Variables: AuthVariables }>,
  ) => {
    const parsed = updateProfileSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return respondValidationError(c, parsed.error.message);
    }

    try {
      const result = await this.updateUserUseCase.execute({
        userId: getAuthenticatedUserId(c),
        name: parsed.data.name,
        login: parsed.data.login,
      });

      return c.json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof UserAlreadyExistsException) {
        return c.json(
          {
            success: false,
            message: error.message,
          },
          409,
        );
      }

      if (error instanceof UserNotFoundException) {
        return c.json(
          {
            success: false,
            message: error.message,
          },
          404,
        );
      }

      console.error("Update user error:", error);
      return respondInternalError(c);
    }
  };
}
