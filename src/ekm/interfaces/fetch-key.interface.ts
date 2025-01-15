export interface KeyContext {
  [key: string]: any;
}

export interface FetchKeyOptions {
  context: KeyContext;
}

export interface FetchKeyResponse {
  data_key: string;
  encrypted_keys: string;
  context: KeyContext;
}

export interface FetchKeyResultInterface {
  key: string;
  encryptedKeys: string;
  context: KeyContext;
}

export class FetchKeyResult implements FetchKeyResultInterface {
  public key: string;
  public encryptedKeys: string;
  public context: KeyContext;

  constructor(data: FetchKeyResponse) {
    this.key = data.data_key;
    this.encryptedKeys = data.encrypted_keys;
    this.context = data.context;
  }
}
