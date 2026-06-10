import { tokenService } from "../shared/index.js";
import type { ErrorResponse, SuccessResponse } from "../shared/types.js";
import { authRepository } from "../auth/auth.repository.js";
import { userQueries } from "./user.queries.js";

type UpdateProfileInput = {
  userId: string;
  name: string;
  login: string;
};

type UpdateProfileResponse =
  | SuccessResponse<{
      id: string;
      name: string;
      login: string;
      email: string | null;
      avatar: string | null;
    }>
  | ErrorResponse;

const updateProfile = async (
  input: UpdateProfileInput,
): Promise<UpdateProfileResponse> => {
  try {
    const updatedUser = await userQueries.updateUserProfile(input);

    if (!updatedUser) {
      return {
        success: false,
        message: "User not found",
      };
    }

    return {
      success: true,
      data: updatedUser,
    };
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return {
        success: false,
        message: "User with this login already exists",
      };
    }

    console.error("Update profile error:", error);
    return {
      success: false,
      message: "Internal server error",
    };
  }
};

type UnlinkProviderInput = {
  userId: string;
  provider: string;
};

type UnlinkProviderResponse = SuccessResponse<null> | ErrorResponse;

const unlinkProvider = async (
  input: UnlinkProviderInput,
): Promise<UnlinkProviderResponse> => {
  const { userId, provider } = input;

  try {
    const providers = await authRepository.findAuthProvidersByUserId(userId);
    const hasThisProvider = providers.some((p) => p.provider === provider);

    if (!hasThisProvider) {
      return { success: false, message: "PROVIDER_NOT_LINKED" };
    }

    const passwordHash = await authRepository.getUserPasswordHash(userId);
    const hasPassword = Boolean(passwordHash);
    const hasOtherProviders = providers.some((p) => p.provider !== provider);

    if (!hasPassword && !hasOtherProviders) {
      return { success: false, message: "NEED_PASSWORD_BEFORE_UNLINK" };
    }

    await authRepository.disconnectAuthProvider(userId, provider);

    return { success: true, data: null };
  } catch (error) {
    console.error("Unlink provider error:", error);
    return { success: false, message: "Internal server error" };
  }
};

type SetPasswordInput = {
  userId: string;
  newPassword: string;
};

type SetPasswordResponse = SuccessResponse<null> | ErrorResponse;

const setPassword = async (
  input: SetPasswordInput,
): Promise<SetPasswordResponse> => {
  const { userId, newPassword } = input;

  try {
    const existingHash = await authRepository.getUserPasswordHash(userId);

    if (existingHash) {
      return { success: false, message: "PASSWORD_ALREADY_SET" };
    }

    const passwordHash = await tokenService.generatePasswordHash(newPassword);
    const updated = await authRepository.setUserPassword(userId, passwordHash);

    if (!updated) {
      return { success: false, message: "User not found" };
    }

    return { success: true, data: null };
  } catch (error) {
    console.error("Set password error:", error);
    return { success: false, message: "Internal server error" };
  }
};

export const userService = {
  updateProfile,
  unlinkProvider,
  setPassword,
};
