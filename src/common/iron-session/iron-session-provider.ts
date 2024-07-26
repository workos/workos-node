export type SealDataOptions = {
  password:
    | string
    | {
        [id: string]: string;
      };
  ttl?: number | undefined;
};

export type UnsealedDataType = Record<string, unknown>;

/**
 * Interface encapsulating the sealData/unsealData methods for separate iron-session implementations.
 */
export abstract class IronSessionProvider {
  abstract sealData(data: unknown, options: SealDataOptions): Promise<string>;

  abstract unsealData<T = UnsealedDataType>(
    seal: string,
    options: SealDataOptions,
  ): Promise<T>;
}
