import { sealData, unsealData } from 'iron-session/edge';
import {
  IronSessionProvider,
  SealDataOptions,
  UnsealedDataType,
} from './iron-session-provider';

/**
 * EdgeIronSessionProvider which uses the base iron-session seal/unseal methods.
 */
export class EdgeIronSessionProvider extends IronSessionProvider {
  /** @override */
  async sealData(data: unknown, options: SealDataOptions): Promise<string> {
    // The iron-session default ttl is 14 days, which can be problematic if the WorkOS session is configured to be > 14 days.
    // In that case the session expires and can't be refreshed, so we set the ttl to 0 to set it to the max possible value.
    const sealOptions = {
      ...options,
      ttl: 0,
    };
    return sealData(data, sealOptions);
  }

  /** @override */
  async unsealData<T = UnsealedDataType>(
    seal: string,
    options: SealDataOptions,
  ): Promise<T> {
    return unsealData<T>(seal, options);
  }
}
