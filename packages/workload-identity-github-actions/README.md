# @workos-inc/workload-identity-github-actions

A GitHub Actions identity token provider for [WorkOS workload identity](https://github.com/workos/workos-node#workload-identity). A workflow authenticates to the WorkOS API with its own OIDC token, so no API key is stored in the repository's secrets.

## Installation

```
npm install @workos-inc/node @workos-inc/workload-identity-github-actions
```

## Usage

The job needs permission to request an OIDC token:

```yaml
permissions:
  id-token: write
```

```ts
import { WorkOS, WorkloadIdentityCredentials } from '@workos-inc/node';
import { githubActions } from '@workos-inc/workload-identity-github-actions';

const workos = new WorkOS({
  credentials: new WorkloadIdentityCredentials({
    clientId: 'client_...',
    tokenUrl: 'https://<your token endpoint>/oauth2/token',
    environmentId: 'environment_...',
    identityTokenProvider: githubActions('https://api.workos.com'),
  }),
});
```

`githubActions(audience)` returns a function that requests a token from the runner on every call. The audience must match the audience of the trust rule on the WorkOS application.

The package has no dependencies and does not depend on `@workos-inc/node`.
