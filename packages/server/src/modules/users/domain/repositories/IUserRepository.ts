import type {
  CreateUserDataDTO,
  UpdateUserDataDTO,
  UserAuthDTO,
  UserDTO,
} from "../types.js";

export interface IUserRepository {
  findById(id: string): Promise<UserDTO | null>;
  findByLogin(login: string): Promise<UserDTO | null>;
  findByEmail(email: string): Promise<UserDTO | null>;
  findAuthByLogin(login: string): Promise<UserAuthDTO | null>;
  getPasswordHash(userId: string): Promise<string | null>;
  setPasswordHash(userId: string, passwordHash: string): Promise<boolean>;
  save(user: CreateUserDataDTO): Promise<UserDTO>;
  update(user: UpdateUserDataDTO): Promise<UserDTO | null>;
}
