import { tokenService } from "../shared/index.js";
import { authQueries } from "./auth.queries.js";

type User = {
  id: string;
  name: string;
  login: string;
  email: string | null;
  avatar: string | null;
  password: string;
};

const getUserById = async (userId: User["id"]) => {
  return authQueries.findUserById(userId);
};

const getUserByLogin = async (userLogin: string) => {
  return authQueries.findUserByLogin(userLogin);
};

const createUser = async (data: {
  firstName: string;
  login: string;
  passwordHash: string;
}) => {
  return authQueries.createUser(data);
};

export const authRepository = {
  getUserById,
  getUserByLogin,
  createUser,
};
