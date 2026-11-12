// @oagen-ignore-file
// Everything here is safe for edge runtimes. `tokenFile` needs a file system
// and is exported from the Node entry (`src/index.ts`) only.
export type {
  CredentialContext,
  Credentials,
  CredentialSnapshot,
} from '../common/net/credentials';
export { tokenEnv } from './token-env';
export {
  WorkloadIdentityCredentials,
  type IdentityTokenProvider,
  type WorkloadIdentityCredentialsOptions,
} from './workload-identity-credentials';
export { WorkloadIdentityError } from './workload-identity-error';
