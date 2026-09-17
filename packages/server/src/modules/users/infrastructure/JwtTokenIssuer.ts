import type { ITokenIssuer } from "../domain/index.js";
import { tokenService } from "shared/index.js";

/**
 * Выпуск JWT через существующий tokenService.
 */
export class JwtTokenIssuer implements ITokenIssuer {
  async issueTokens(
    user: Parameters<ITokenIssuer["issueTokens"]>[0],
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      tokenService.generateAccessToken(user),
      tokenService.generateRefreshToken(user),
    ]);

    return { accessToken, refreshToken };
  }
}
