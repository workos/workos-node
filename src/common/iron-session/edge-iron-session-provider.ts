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
    const ironSession = await import('iron-session/edge');
    return ironSession.sealData(data, options);
  }

  /** @override */
  async unsealData<T = UnsealedDataType>(
    seal: string,
    options: SealDataOptions,
  ): Promise<T> {
    const ironSession = await import('iron-session/edge');
    return ironSession.unsealData<T>(seal, options);
  }
}
