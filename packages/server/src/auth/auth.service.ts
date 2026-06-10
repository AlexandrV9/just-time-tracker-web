import { tokenService } from "../shared/index.js";
import type { ErrorResponse, SuccessResponse } from "../shared/types.js";
import { authRepository } from "./auth.repository.js";

type AuthUserResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    login: string;
    name: string;
    avatar: string | null;
    email: string | null;
  };
};

type SignInResponse = SuccessResponse<AuthUserResponse> | ErrorResponse;

const signIn = async (data: {
  login: string;
  password: string;
}): Promise<SignInResponse> => {
  const { login, password } = data;

  const user = await authRepository.getUserByLogin(login);
  if (!user || !user.password_hash) {
    return {
      success: false,
      message: "Login or password is not correct",
    };
  }

  const isValidPassword = tokenService.comparePassword(
    password,
    user.password_hash,
  );
  if (!isValidPassword) {
    return {
      success: false,
      message: "Login or password is not correct",
    };
  }

  const accessToken = await tokenService.generateAccessToken(user);
  const refreshToken = await tokenService.generateRefreshToken(user);

  return {
    success: true,
    data: {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        login: user.login,
        name: user.name,
        avatar: user.avatar,
        email: user.email,
      },
    },
  };
};

type SignUpResponse = SuccessResponse<AuthUserResponse> | ErrorResponse;

const signUp = async (data: {
  firstName: string;
  login: string;
  password: string;
}): Promise<SignUpResponse> => {
  const { firstName, login, password } = data;

  try {
    const passwordHash = await tokenService.generatePasswordHash(password);
    const newUser = await authRepository.createUser({
      firstName,
      login,
      passwordHash,
    });

    const user = await authRepository.getUserById(newUser.id);

    if (!user) {
      return { success: false, message: "Internal server error" };
    }

    const accessToken = await tokenService.generateAccessToken(user);
    const refreshToken = await tokenService.generateRefreshToken(user);

    return {
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          login: user.login,
          name: user.name,
          avatar: user.avatar,
          email: user.email,
        },
      },
      message: "User registered successfully",
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
        data: null,
        message: "User with this login already exists",
      };
    }

    console.error("Registration error:", error);
    return {
      success: false,
      data: null,
      message: "Internal server error",
    };
  }
};

export const authService = {
  signIn,
  signUp,
};
