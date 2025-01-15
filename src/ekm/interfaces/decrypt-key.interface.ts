export interface DecryptKeyResponse {
  data_key: string;
}

export interface DecryptKeyResultInterface {
  dataKey: string;
}

export class DecryptKeyResult implements DecryptKeyResultInterface {
  public dataKey: string;

  constructor(data: DecryptKeyResponse) {
    this.dataKey = data.data_key;
  }
}
