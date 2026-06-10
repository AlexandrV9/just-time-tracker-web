import { authQueries } from "./auth.queries.js";

const getUserById = async (userId: string) => {
  return authQueries.findUserById(userId);
};

const getUserByLogin = async (userLogin: string) => {
  return authQueries.findUserByLogin(userLogin);
};

const getUserByEmail = async (email: string) => {
  return authQueries.findUserByEmail(email);
};

const createUser = async (data: {
  firstName: string;
  login: string;
  passwordHash: string;
}) => {
  return authQueries.createUser(data);
};

const createOAuthUser = async (data: {
  firstName: string;
  login: string;
  email: string | null;
  avatar: string | null;
}) => {
  return authQueries.createOAuthUser(data);
};

const findAuthProvider = async (provider: string, providerUserId: string) => {
  return authQueries.findAuthProvider(provider, providerUserId);
};

const findAuthProvidersByUserId = async (userId: string) => {
  return authQueries.findAuthProvidersByUserId(userId);
};

const createAuthProvider = async (data: {
  userId: string;
  provider: string;
  providerUserId: string;
}) => {
  return authQueries.createAuthProvider(data);
};

const disconnectAuthProvider = async (userId: string, provider: string) => {
  return authQueries.disconnectAuthProvider(userId, provider);
};

const reconnectAuthProvider = async (id: string) => {
  return authQueries.reconnectAuthProvider(id);
};

const reassignAuthProvider = async (id: string, userId: string) => {
  return authQueries.reassignAuthProvider(id, userId);
};

const getUserPasswordHash = async (userId: string) => {
  return authQueries.getUserPasswordHash(userId);
};

const setUserPassword = async (userId: string, passwordHash: string) => {
  return authQueries.setUserPassword(userId, passwordHash);
};

export const authRepository = {
  getUserById,
  getUserByLogin,
  getUserByEmail,
  createUser,
  createOAuthUser,
  findAuthProvider,
  findAuthProvidersByUserId,
  createAuthProvider,
  disconnectAuthProvider,
  reconnectAuthProvider,
  reassignAuthProvider,
  getUserPasswordHash,
  setUserPassword,
};
