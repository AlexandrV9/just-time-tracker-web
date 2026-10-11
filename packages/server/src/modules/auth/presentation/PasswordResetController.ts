import {
  confirmPasswordResetSchema,
  startPasswordResetSchema,
  verifyPasswordResetSchema,
} from "@time-tracker/shared";
import { Hono } from "hono";
import type { Context } from "hono";
import { resolveEmailLang } from "shared/index.js";
import {
  respondInternalError,
  respondValidationError,
} from "shared/utils/request.js";
import type {
  ConfirmPasswordResetUseCase,
  GetPasswordResetStatusUseCase,
  ResendPasswordResetUseCase,
  StartPasswordResetUseCase,
  VerifyPasswordResetUseCase,
} from "../application/index.js";
import {
  EmailDeliveryException,
  InvalidResetCodeException,
  PasswordResetNotRequestedException,
  RateLimitedException,
  ResendTooEarlyException,
  ResetCodeNotFoundException,
  ResetTokenInvalidException,
  SamePasswordException,
  TooManyAttemptsException,
  UserNofFoundException,
} from "../domain/index.js";

/**
 * HTTP-адаптер password-reset flow.
 */
export class PasswordResetController {
  constructor(
    private readonly getStatusUseCase: GetPasswordResetStatusUseCase,
    private readonly startUseCase: StartPasswordResetUseCase,
    private readonly verifyUseCase: VerifyPasswordResetUseCase,
    private readonly resendUseCase: ResendPasswordResetUseCase,
    private readonly confirmUseCase: ConfirmPasswordResetUseCase,
  ) {}

  register(router: Hono): void {
    router.post("/status", this.handleStatus);
    router.post("/start", this.handleStart);
    router.post("/verify", this.handleVerify);
    router.post("/resend", this.handleResend);
    router.post("/confirm", this.handleConfirm);
  }

  private handleStatus = async (c: Context) => {
    const parsed = startPasswordResetSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return respondValidationError(c, parsed.error.message);
    }

    try {
      const data = await this.getStatusUseCase.execute({
        email: parsed.data.email,
      });
      return c.json({ success: true, data });
    } catch (error) {
      return this.mapError(c, error, "Password reset status error:");
    }
  };

  private handleStart = async (c: Context) => {
    const parsed = startPasswordResetSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return respondValidationError(c, parsed.error.message);
    }

    try {
      const data = await this.startUseCase.execute({
        email: parsed.data.email,
        lang: resolveEmailLang(c.req.header("accept-language")),
      });
      return c.json({ success: true, data });
    } catch (error) {
      return this.mapError(c, error, "Password reset start error:");
    }
  };

  private handleVerify = async (c: Context) => {
    const parsed = verifyPasswordResetSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return respondValidationError(c, parsed.error.message);
    }

    try {
      const data = await this.verifyUseCase.execute(parsed.data);
      return c.json({ success: true, data });
    } catch (error) {
      return this.mapError(c, error, "Password reset verify error:");
    }
  };

  private handleResend = async (c: Context) => {
    const parsed = startPasswordResetSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return respondValidationError(c, parsed.error.message);
    }

    try {
      const data = await this.resendUseCase.execute({
        email: parsed.data.email,
        lang: resolveEmailLang(c.req.header("accept-language")),
      });
      return c.json({ success: true, data });
    } catch (error) {
      return this.mapError(c, error, "Password reset resend error:");
    }
  };

  private handleConfirm = async (c: Context) => {
    const parsed = confirmPasswordResetSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return respondValidationError(c, parsed.error.message);
    }

    try {
      const data = await this.confirmUseCase.execute(parsed.data);
      return c.json({ success: true, data });
    } catch (error) {
      return this.mapError(c, error, "Password reset confirm error:");
    }
  };

  private mapError(c: Context, error: unknown, logPrefix: string) {
    if (error instanceof UserNofFoundException) {
      return c.json({ success: false, message: error.message }, 400);
    }

    if (error instanceof PasswordResetNotRequestedException) {
      return c.json({ success: false, message: error.message }, 404);
    }

    if (error instanceof RateLimitedException) {
      return c.json(
        {
          success: false,
          message: error.message,
          data: { retryAfter: error.retryAfter },
        },
        429,
      );
    }

    if (error instanceof TooManyAttemptsException) {
      return c.json(
        {
          success: false,
          message: error.message,
          data: {
            retryAfter: error.retryAfter,
            resendAvailableAt: error.retryAfter,
          },
        },
        429,
      );
    }

    if (error instanceof ResendTooEarlyException) {
      return c.json(
        {
          success: false,
          message: error.message,
          data: { resendAvailableAt: error.resendAvailableAt },
        },
        400,
      );
    }

    if (error instanceof EmailDeliveryException) {
      return c.json({ success: false, message: error.message }, 400);
    }

    if (
      error instanceof InvalidResetCodeException ||
      error instanceof ResetCodeNotFoundException ||
      error instanceof ResetTokenInvalidException ||
      error instanceof SamePasswordException
    ) {
      return c.json({ success: false, message: error.message }, 400);
    }

    console.error(logPrefix, error);
    return respondInternalError(c);
  }
}
