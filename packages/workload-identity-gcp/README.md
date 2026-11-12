# @workos-inc/workload-identity-gcp

A Google Cloud identity token provider for [WorkOS workload identity](https://github.com/workos/workos-node#workload-identity). A workload on Compute Engine, GKE, Cloud Run, Cloud Functions or App Engine authenticates to the WorkOS API as its service account, so no API key is stored.

## Installation

```
npm install @workos-inc/node @workos-inc/workload-identity-gcp
```

## Usage

```ts
import { WorkOS, WorkloadIdentityCredentials } from '@workos-inc/node';
import { gcpMetadata } from '@workos-inc/workload-identity-gcp';

const workos = new WorkOS({
  credentials: new WorkloadIdentityCredentials({
    clientId: 'client_...',
    tokenUrl: 'https://<your token endpoint>/oauth2/token',
    environmentId: 'environment_...',
    identityTokenProvider: gcpMetadata('https://api.workos.com'),
  }),
});
```

`gcpMetadata(audience)` returns a function that requests an identity token for the default service account from the metadata server on every call. The audience must match the audience of the trust rule on the WorkOS application.

The request to the metadata server never goes through a proxy, even when Node is started with `NODE_USE_ENV_PROXY=1`. That server exists only inside the workload's own VM or container, so a proxy cannot reach it.

The package has no dependencies and does not depend on `@workos-inc/node`.
