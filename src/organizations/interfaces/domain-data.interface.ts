// These are the only possible states to create an organization domain with
export enum DomainDataState {
  Verified = 'verified',
  Pending = 'pending',
}

export interface DomainData {
  domain: string;
  state: DomainDataState;
}
