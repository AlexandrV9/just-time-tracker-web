import { Hono } from "hono";
import type { AuthVariables } from "shared/auth/auth.variables.js";
import { pushSubscriptionsRepository } from "../notifications/pushSubscriptions.repository.js";
import { SqlAuthProviderRepository } from "../auth/infrastructure/index.js";
import {
  GetAuthProvidersUseCase,
  SetPasswordUseCase,
  UnlinkProviderUseCase,
  UpdateLocaleUseCase,
  UpdatePasswordUseCase,
  UpdatePushNotificationsUseCase,
  UpdateUserUseCase,
} from "./application/index.js";
import type { IPushSubscriptionCleaner } from "./domain/index.js";
import {
  BcryptPasswordHasher,
  SqlUserRepository,
  StrictPasswordPolicyStrategy,
} from "./infrastructure/index.js";
import { UsersController } from "./presentation/UsersController.js";

export const usersRouter = new Hono<{ Variables: AuthVariables }>();

const userRepository = new SqlUserRepository();
const passwordHasher = new BcryptPasswordHasher();
const passwordPolicy = new StrictPasswordPolicyStrategy();
const authProviderRepository = new SqlAuthProviderRepository();

const pushSubscriptionCleaner: IPushSubscriptionCleaner = {
  deleteByUserId: async (userId) => {
    await pushSubscriptionsRepository.deleteByUserId(userId);
  },
};

const updateUserUseCase = new UpdateUserUseCase(userRepository);
const updateLocaleUseCase = new UpdateLocaleUseCase(userRepository);
const updatePushNotificationsUseCase = new UpdatePushNotificationsUseCase(
  userRepository,
  pushSubscriptionCleaner,
);
const setPasswordUseCase = new SetPasswordUseCase(
  userRepository,
  passwordHasher,
  passwordPolicy,
);
const updatePasswordUseCase = new UpdatePasswordUseCase(
  userRepository,
  passwordHasher,
  passwordPolicy,
);
const getAuthProvidersUseCase = new GetAuthProvidersUseCase(
  authProviderRepository,
);
const unlinkProviderUseCase = new UnlinkProviderUseCase(
  authProviderRepository,
  userRepository,
);

const usersController = new UsersController(
  updateUserUseCase,
  updateLocaleUseCase,
  updatePushNotificationsUseCase,
  setPasswordUseCase,
  updatePasswordUseCase,
  getAuthProvidersUseCase,
  unlinkProviderUseCase,
);

usersController.register(usersRouter);

export * from "./domain/index.js";
export * from "./infrastructure/index.js";
