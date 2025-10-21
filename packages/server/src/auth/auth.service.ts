import { pool, tokenService } from "../shared/index.js";
import type { ErrorResponse, SuccessResponse } from "../shared/types.js";
import { authRepository } from "./auth.repository.js";

type SignInResponse =
  | SuccessResponse<{
      accessToken: string;
      refreshToken: string;
      user: {
        id: string;
        login: string;
        name: string;
        avatar: string;
        email: string | null;
      };
    }>
  | ErrorResponse;

const signIn = async (data: {
  login: string;
  password: string;
}): Promise<SignInResponse> => {
  const { login, password } = data;

  const user = await authRepository.getUserByLogin(login);
  if (!user) {
    return {
      success: false,
      message: "Login or password is not correct",
    };
  }

  const isValidPassword = tokenService.comparePassword(
    password,
    user.password_hash
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
        avatar: user.name,
        email: user.email,
      },
    },
  };
};

type SignUpResponse =
  | SuccessResponse<{
      id: string;
      firstName: string;
      login: string;
      createdAt: string;
    }>
  | ErrorResponse;

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

    return {
      success: true,
      data: {
        id: newUser.id,
        firstName: newUser.first_name,
        login: newUser.login,
        createdAt: newUser.created_at,
      },
      message: "User registered successfully",
    };
  } catch (error: any) {
    // Код ошибки уникальности в PostgreSQL
    if (error.code === "23505") {
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
