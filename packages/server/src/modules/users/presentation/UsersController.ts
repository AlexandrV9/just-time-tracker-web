import {
  setPasswordSchema,
  updatePasswordSchema,
  updateProfileSchema,
  updatePushNotificationsSchema,
  updateUserLocaleSchema,
} from "@time-tracker/shared";
import { Hono } from "hono";
import type { Context } from "hono";
import type { BlankSchema } from "hono/types";
import type { AuthVariables } from "shared/auth/auth.variables.js";
import { getAuthenticatedUserId } from "shared/auth/with-created-by-id.js";
import {
  respondInternalError,
  respondValidationError,
} from "shared/utils/request.js";
import type {
  GetAuthProvidersUseCase,
  SetPasswordUseCase,
  UnlinkProviderUseCase,
  UpdateLocaleUseCase,
  UpdatePasswordUseCase,
  UpdatePushNotificationsUseCase,
  UpdateUserUseCase,
} from "../application/index.js";
import {
  InvalidCurrentPasswordException,
  NeedPasswordBeforeUnlinkException,
  PasswordAlreadySetException,
  PasswordNotSetException,
  ProviderNotLinkedException,
  ProviderNotSupportedException,
  SamePasswordException,
  UserAlreadyExistsException,
  UserNotFoundException,
  WeakPasswordException,
} from "../domain/index.js";

type AuthData = {
  Variables: AuthVariables;
};

type Router = Hono<AuthData, BlankSchema, "/">;

/**
 * Контроллер пользователей (профиль / пароль / providers).
 */
export class UsersController {
  constructor(
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly updateLocaleUseCase: UpdateLocaleUseCase,
    private readonly updatePushNotificationsUseCase: UpdatePushNotificationsUseCase,
    private readonly setPasswordUseCase: SetPasswordUseCase,
    private readonly updatePasswordUseCase: UpdatePasswordUseCase,
    private readonly getAuthProvidersUseCase: GetAuthProvidersUseCase,
    private readonly unlinkProviderUseCase: UnlinkProviderUseCase,
  ) {}

  register(router: Router): void {
    router.patch("/me", this.handleUpdateUser);
    router.patch("/me/locale", this.handleUpdateLocale);
    router.patch(
      "/me/push-notifications",
      this.handleUpdatePushNotifications,
    );
    router.post("/me/password", this.handleSetPassword);
    router.patch("/me/password", this.handleUpdatePassword);
    router.get("/me/auth-providers", this.handleGetAuthProviders);
    router.delete(
      "/me/auth-providers/:provider",
      this.handleUnlinkProvider,
    );
  }

  private handleUpdateUser = async (c: Context<AuthData>) => {
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

      return c.json({ success: true, data: result });
    } catch (error) {
      if (error instanceof UserAlreadyExistsException) {
        return c.json({ success: false, message: error.message }, 409);
      }
      if (error instanceof UserNotFoundException) {
        return c.json({ success: false, message: error.message }, 404);
      }
      console.error("Update user error:", error);
      return respondInternalError(c);
    }
  };

  private handleUpdateLocale = async (c: Context<AuthData>) => {
    const parsed = updateUserLocaleSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return respondValidationError(c, parsed.error.message);
    }

    try {
      const result = await this.updateLocaleUseCase.execute({
        userId: getAuthenticatedUserId(c),
        locale: parsed.data.locale,
      });
      return c.json({ success: true, data: result });
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        return c.json({ success: false, message: error.message }, 404);
      }
      console.error("Update locale error:", error);
      return respondInternalError(c);
    }
  };

  private handleUpdatePushNotifications = async (c: Context<AuthData>) => {
    const parsed = updatePushNotificationsSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return respondValidationError(c, parsed.error.message);
    }

    try {
      const result = await this.updatePushNotificationsUseCase.execute({
        userId: getAuthenticatedUserId(c),
        enabled: parsed.data.enabled,
      });
      return c.json({ success: true, data: result });
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        return c.json({ success: false, message: error.message }, 404);
      }
      console.error("Update push notifications error:", error);
      return respondInternalError(c);
    }
  };

  private handleSetPassword = async (c: Context<AuthData>) => {
    const parsed = setPasswordSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return respondValidationError(c, parsed.error.message);
    }

    try {
      await this.setPasswordUseCase.execute({
        userId: getAuthenticatedUserId(c),
        newPassword: parsed.data.newPassword,
      });
      return c.json({ success: true, data: null });
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
      if (error instanceof PasswordAlreadySetException) {
        return c.json({ success: false, message: error.message }, 409);
      }
      if (error instanceof UserNotFoundException) {
        return c.json({ success: false, message: error.message }, 404);
      }
      console.error("Set password error:", error);
      return respondInternalError(c);
    }
  };

  private handleUpdatePassword = async (c: Context<AuthData>) => {
    const parsed = updatePasswordSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return respondValidationError(c, parsed.error.message);
    }

    try {
      await this.updatePasswordUseCase.execute({
        userId: getAuthenticatedUserId(c),
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
      });
      return c.json({ success: true, data: null });
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
      if (
        error instanceof PasswordNotSetException ||
        error instanceof InvalidCurrentPasswordException ||
        error instanceof SamePasswordException
      ) {
        return c.json({ success: false, message: error.message }, 400);
      }
      if (error instanceof UserNotFoundException) {
        return c.json({ success: false, message: error.message }, 404);
      }
      console.error("Update password error:", error);
      return respondInternalError(c);
    }
  };

  private handleGetAuthProviders = async (c: Context<AuthData>) => {
    try {
      const providers = await this.getAuthProvidersUseCase.execute(
        getAuthenticatedUserId(c),
      );
      return c.json({ success: true, data: providers });
    } catch (error) {
      console.error("Get auth providers error:", error);
      return respondInternalError(c);
    }
  };

  private handleUnlinkProvider = async (c: Context<AuthData>) => {
    try {
      await this.unlinkProviderUseCase.execute({
        userId: getAuthenticatedUserId(c),
        provider: c.req.param("provider"),
      });
      return c.json({ success: true, data: null });
    } catch (error) {
      if (
        error instanceof ProviderNotSupportedException ||
        error instanceof ProviderNotLinkedException ||
        error instanceof NeedPasswordBeforeUnlinkException
      ) {
        return c.json({ success: false, message: error.message }, 400);
      }
      console.error("Unlink provider error:", error);
      return respondInternalError(c);
    }
  };
}
