import { Hono } from "hono";
import type { AuthVariables } from "shared/auth/auth.variables.js";
import {
  AuthorizUserUseCase,
  RegisterUserUseCase,
  UpdateUserUseCase,
} from "./application/index.js";
import {
  BcryptPasswordHasher,
  JwtTokenIssuer,
  SqlUserRepository,
  StrictPasswordPolicyStrategy,
} from "./infrastructure/index.js";
import { UsersController } from "./presentation/UsersController.js";

/** Публичные маршруты: register / sign-in (без auth middleware). */
export const usersPublicRouter = new Hono();

/** Защищённые маршруты: /me и т.п. */
export const usersRouter = new Hono<{ Variables: AuthVariables }>();

const userRepository = new SqlUserRepository();
const passwordHasher = new BcryptPasswordHasher();
const passwordPolicy = new StrictPasswordPolicyStrategy();
const tokenIssuer = new JwtTokenIssuer();

const registerUserUseCase = new RegisterUserUseCase(
  userRepository,
  passwordHasher,
  passwordPolicy,
);
const updateUserUseCase = new UpdateUserUseCase(userRepository);
const authorizUserUseCase = new AuthorizUserUseCase(
  userRepository,
  passwordHasher,
  tokenIssuer,
);

const usersController = new UsersController(
  registerUserUseCase,
  updateUserUseCase,
  authorizUserUseCase,
);

usersController.registerPublic(usersPublicRouter);
usersController.register(usersRouter);
