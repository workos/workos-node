import {
  WarrantToken,
  WarrantTokenResponse,
} from '../interfaces/warrant-token.interface';

export const deserializeWarrantToken = (
  warrantToken: WarrantTokenResponse,
): WarrantToken => ({
  warrantToken: warrantToken.warrant_token,
});
