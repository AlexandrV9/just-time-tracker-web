import type { ErrorResponse, SuccessResponse } from "../shared/types.js";
import { userQueries } from "./user.queries.js";

type UpdateProfileInput = {
  userId: string;
  name: string;
  email: string | null;
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
        message: "User with this email already exists",
      };
    }

    console.error("Update profile error:", error);
    return {
      success: false,
      message: "Internal server error",
    };
  }
};

export const userService = {
  updateProfile,
};
