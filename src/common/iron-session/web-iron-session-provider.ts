import {
  IronSessionProvider,
  SealDataOptions,
  UnsealedDataType,
} from './iron-session-provider';

/**
 * WebIronSessionProvider which uses the base iron-session seal/unseal methods.
 */
export class WebIronSessionProvider extends IronSessionProvider {
  /** @override */
  async sealData(data: unknown, options: SealDataOptions): Promise<string> {
    const ironSession = await import('iron-session');
    return ironSession.sealData(data, options);
  }

  /** @override */
  async unsealData<T = UnsealedDataType>(
    seal: string,
    options: SealDataOptions,
  ): Promise<T> {
    const ironSession = await import('iron-session');
    return ironSession.unsealData<T>(seal, options);
  }
}
