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
    return sealData(data, options);
  }

  /** @override */
  async unsealData<T = UnsealedDataType>(
    seal: string,
    options: SealDataOptions,
  ): Promise<T> {
    return unsealData<T>(seal, options);
  }
}
