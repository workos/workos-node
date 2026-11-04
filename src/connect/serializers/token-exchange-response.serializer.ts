import type {
  TokenExchangeResponse,
  TokenExchangeResponseResponse,
} from '../interfaces/token-exchange.interface';

export const deserializeTokenExchangeResponse = (
  response: TokenExchangeResponseResponse,
): TokenExchangeResponse => ({
  accessToken: response.access_token,
  issuedTokenType: response.issued_token_type,
  tokenType: response.token_type,
  expiresIn: response.expires_in,
  ...(response.scope !== undefined && { scope: response.scope }),
});
