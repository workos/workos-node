# WorkOS Node.js Library

![npm](https://img.shields.io/npm/v/@workos-inc/node)
[![Build Status](https://workos.semaphoreci.com/badges/workos-node/branches/main.svg?style=shields)](https://workos.semaphoreci.com/projects/workos-node)

The WorkOS library for Node.js provides convenient access to the WorkOS API from applications written in server-side JavaScript.

## Documentation

See the [API Reference](https://workos.com/docs/reference/client-libraries) for Node.js usage examples.

## Installation

Install the package with:

```
yarn add @workos-inc/node
```

## Configuration

To use the library you must provide an API key, located in the WorkOS dashboard, as an environment variable `WORKOS_API_KEY`:

```sh
WORKOS_API_KEY="sk_1234"
```

Or, you can set it on your own before your application starts:

```ts
import WorkOS from '@workos-inc/node';

const workos = new WorkOS('sk_1234');
```

## Axios customization

Some users may need to customize the underlying Axios instance. For instance, you may need to pass an `https.Agent` with a root CA to allow older Node versions to call the API, or you may be running on a non-Node runtime and need to pass in a custom `adapter`.

You can pass in one of three Axios options in the `WorkOSOptions` object:

- `adapter`
- `httpsAgent`
- `proxy`

Example of using a custom root CA for legacy Node support:

```ts
import { Agent } from 'https';
import { readFileSync } from 'fs';
import { join } from 'path';

import WorkOS from '@workos-inc/node';

const rootCA = readFileSync(join(__dirname, './isrg-root-x2.pem'));

const agent = new Agent({ ca: rootCA });

const workos = new WorkOS('sk_1234', { axios: { httpsAgent: agent } });
```

## SDK Versioning

For our SDKs WorkOS follows a Semantic Versioning ([SemVer](https://semver.org/)) process where all releases will have a version X.Y.Z (like 1.0.0) pattern wherein Z would be a bug fix (e.g., 1.0.1), Y would be a minor release (1.1.0) and X would be a major release (2.0.0). We permit any breaking changes to only be released in major versions and strongly recommend reading changelogs before making any major version upgrades.

## More Information

- [Single Sign-On Guide](https://workos.com/docs/sso/guide)
- [Directory Sync Guide](https://workos.com/docs/directory-sync/guide)
- [Admin Portal Guide](https://workos.com/docs/admin-portal/guide)
- [Magic Link Guide](https://workos.com/docs/magic-link/guide)
