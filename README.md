# WorkOS Node.js Library

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

## More Information

* [Single Sign-On Guide](https://workos.com/docs/sso/guide)
* [Directory Sync Guide](https://workos.com/docs/directory-sync/guide)
* [Admin Portal Guide](https://workos.com/docs/admin-portal/guide)
* [Magic Link Guide](https://workos.com/docs/magic-link/guide)
