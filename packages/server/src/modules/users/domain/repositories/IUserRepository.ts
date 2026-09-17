import type {
  CreateUserDataDTO,
  UpdateUserDataDTO,
  UserAuthDTO,
  UserDTO,
} from "../types.js";

export interface IUserRepository {
  findByLogin(login: string): Promise<UserDTO | null>;
  findAuthByLogin(login: string): Promise<UserAuthDTO | null>;
  save(user: CreateUserDataDTO): Promise<UserDTO>;
  update(user: UpdateUserDataDTO): Promise<UserDTO | null>;
}
