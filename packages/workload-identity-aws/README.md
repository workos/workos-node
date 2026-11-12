# @workos-inc/workload-identity-aws

An AWS identity token provider for [WorkOS workload identity](https://github.com/workos/workos-node#workload-identity). A workload with an IAM role authenticates to the WorkOS API with a token signed by AWS STS, so no API key is stored.

## Installation

```
npm install @workos-inc/node @workos-inc/workload-identity-aws
```

## Usage

```ts
import { WorkOS, WorkloadIdentityCredentials } from '@workos-inc/node';
import { awsSts } from '@workos-inc/workload-identity-aws';

const workos = new WorkOS({
  credentials: new WorkloadIdentityCredentials({
    clientId: 'client_...',
    tokenUrl: 'https://<your token endpoint>/oauth2/token',
    environmentId: 'environment_...',
    identityTokenProvider: awsSts('https://api.workos.com', 'us-east-1'),
  }),
});
```

`awsSts(audience, region)` returns a function that calls `sts:GetWebIdentityToken` (signed with RS256) on every call. The audience must match the audience of the trust rule on the WorkOS application.

- AWS credentials come from the AWS SDK's default chain.
- `region` is optional when the AWS SDK can resolve one, for example from `AWS_REGION`. The call uses that region's STS endpoint, never the global endpoint.
- The AWS account needs outbound identity federation enabled, and the role needs permission for `sts:GetWebIdentityToken`.

The package depends on `@aws-sdk/client-sts` and does not depend on `@workos-inc/node`.
