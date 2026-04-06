# Changelog

## [8.12.0](https://github.com/workos/workos-node/compare/v8.11.1...v8.12.0) (2026-04-06)


### Features

* Add vault.byok_key.verification_completed event interface ([#1544](https://github.com/workos/workos-node/issues/1544)) ([5b29d3c](https://github.com/workos/workos-node/commit/5b29d3c0c961ca79b4dde30f8d95821847942c65))

## [8.11.1](https://github.com/workos/workos-node/compare/v8.11.0...v8.11.1) (2026-04-04)


### Bug Fixes

* replace node:events with eventemitter3 in runtime client ([#1540](https://github.com/workos/workos-node/issues/1540)) ([e293be1](https://github.com/workos/workos-node/commit/e293be1328cecbdee6107d86252341de0f387692))

## [8.11.0](https://github.com/workos/workos-node/compare/v8.10.0...v8.11.0) (2026-04-02)


### Features

* Adds feature flags runtime client with local evaluation ([#1511](https://github.com/workos/workos-node/issues/1511)) ([581c618](https://github.com/workos/workos-node/commit/581c6182bc18384ba9912f681d76acb19d5964a2))


### Bug Fixes

* **security:** resolve miniflare and undici vulnerabilities ([#1500](https://github.com/workos/workos-node/issues/1500)) ([cd6ddd0](https://github.com/workos/workos-node/commit/cd6ddd017090786cc7b17b1398b1049201121fce))

## [8.10.0](https://github.com/workos/workos-node/compare/v8.9.0...v8.10.0) (2026-03-25)


### Features

* add vault events ([#1531](https://github.com/workos/workos-node/issues/1531)) ([a5e619f](https://github.com/workos/workos-node/commit/a5e619f7aa31b5c93054bd5a0eeba37d1f052f52))


### Bug Fixes

* correct typecheck issues ([#1526](https://github.com/workos/workos-node/issues/1526)) ([5e52f6c](https://github.com/workos/workos-node/commit/5e52f6c72b503873f92b57b941e6b587d6e1c872))
* CreateAuthorizationResourceOptions type definition ([#1530](https://github.com/workos/workos-node/issues/1530)) ([be2ec40](https://github.com/workos/workos-node/commit/be2ec40abbc57a170b6b20f48d8e01e1258ec8f0))
* **events:** add missing order parameter to listEvents ([#1524](https://github.com/workos/workos-node/issues/1524)) ([2f3dcb4](https://github.com/workos/workos-node/commit/2f3dcb4688bae519d114cc573cd5bf8da1bd0fd6))
* **vault:** forward order and before params in listObjects ([#1527](https://github.com/workos/workos-node/issues/1527)) ([2f9c2f1](https://github.com/workos/workos-node/commit/2f9c2f19c2a31150745c47b504b83d86593a087b))

## [8.9.0](https://github.com/workos/workos-node/compare/v8.8.0...v8.9.0) (2026-03-12)


### Features

* **user-management:** add claimNonce to getAuthorizationUrl ([#1518](https://github.com/workos/workos-node/issues/1518)) ([19e4a20](https://github.com/workos/workos-node/commit/19e4a20e7db39a1fb5546229596cfaaa851907c2))
* **user-management:** add directoryManaged to OrganizationMembership ([#1512](https://github.com/workos/workos-node/issues/1512)) ([4594f4e](https://github.com/workos/workos-node/commit/4594f4e2a871e94d719312bf0500f4d106169ed7))


### Bug Fixes

* Bump minimatch from 3.1.2 to 3.1.5 ([#1507](https://github.com/workos/workos-node/issues/1507)) ([fe74c33](https://github.com/workos/workos-node/commit/fe74c3342a0cbd61d265c1ddd5dd02a5a21eb371))
* preserve sso context in authentication event deserialisation ([#1487](https://github.com/workos/workos-node/issues/1487)) ([2bad11c](https://github.com/workos/workos-node/commit/2bad11ca72127677fddfd2ae490a98cb77c53655))
* preserve verification_prefix in organization domain deserialization ([#1486](https://github.com/workos/workos-node/issues/1486)) ([640f0e4](https://github.com/workos/workos-node/commit/640f0e419712755ce0e1f68dd3f441ce1282a75a))

## [8.8.0](https://github.com/workos/workos-node/compare/v8.7.0...v8.8.0) (2026-03-03)


### Features

* add missing auth methods ([#1509](https://github.com/workos/workos-node/issues/1509)) ([3a5ce41](https://github.com/workos/workos-node/commit/3a5ce41949d09de38a6aa9c919617267c83714a0))


### Bug Fixes

* export CookieSession from package root ([#1504](https://github.com/workos/workos-node/issues/1504)) ([29048e9](https://github.com/workos/workos-node/commit/29048e992a08f32d353b38f2c53346ca3f39a16e))

## [8.7.0](https://github.com/workos/workos-node/compare/v8.6.0...v8.7.0) (2026-02-26)


### Features

* add `resourceTypeSlug` to permissions, environment and organization roles ([#1502](https://github.com/workos/workos-node/issues/1502)) ([74dadc6](https://github.com/workos/workos-node/commit/74dadc6310412e4f3601d1ba90d3fc2d8fabde0a))
* Add deserialisation support for feature flag events ([#1494](https://github.com/workos/workos-node/issues/1494)) ([3621424](https://github.com/workos/workos-node/commit/36214248128c1414bebceda634dc39689c296368))


### Bug Fixes

* update release-please manifest to match actual version 8.6.0 ([#1503](https://github.com/workos/workos-node/issues/1503)) ([6814a5c](https://github.com/workos/workos-node/commit/6814a5c75c12bbe02ed7db32ca8eb84c080b5d98))
