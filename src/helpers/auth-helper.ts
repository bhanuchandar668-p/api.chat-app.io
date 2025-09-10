import { NAME_401 } from "../constants/app-messages.js";
import UnauthorizedException from "../exceptions/unauthorized-exception.js";
import { genJWTTokensForUser } from "../utils/jwt-utils.js";

export async function generateLoginTokensAndSaveToDB(userId: number) {
  const tokensData = await genJWTTokensForUser(userId);

  if (!tokensData) {
    throw new UnauthorizedException(NAME_401);
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  const refreshTokenData = {
    user_id: userId,
    refresh_token: tokensData.refresh_token,
    expires_at: tokensData.refresh_token_expires_at,
  };

  // await saveRecord<RefreshTokensTable>(refresh_tokens, refreshTokenData);

  return tokensData;
}
