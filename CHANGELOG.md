# Changelog

## [10.5.0](https://github.com/workos/workos-node/compare/v10.4.1...v10.5.0) (2026-06-24)


### Features

* Add signalsId to user management APIs ([#1618](https://github.com/workos/workos-node/issues/1618)) ([b6e7944](https://github.com/workos/workos-node/commit/b6e7944796945b20d4a75177c9ea0a4d34ea20d8))

## [10.4.1](https://github.com/workos/workos-node/compare/v10.4.0...v10.4.1) (2026-06-23)


### Bug Fixes

* **events:** Add resourceTypeSlug to RoleEvent deserialization ([#1638](https://github.com/workos/workos-node/issues/1638)) ([d478595](https://github.com/workos/workos-node/commit/d4785958cdaf1ee2d7857022fb4e89ff4e9518b5))

## [10.4.0](https://github.com/workos/workos-node/compare/v10.3.0...v10.4.0) (2026-06-18)


### Features

* **user-management:** Add invitationToken to getAuthorizationUrl options ([#1612](https://github.com/workos/workos-node/issues/1612)) ([a2d516f](https://github.com/workos/workos-node/commit/a2d516fef5c7cf70aaf69b165f581ffe6dad5360))

## [10.3.0](https://github.com/workos/workos-node/compare/v10.2.1...v10.3.0) (2026-06-17)


### Features

* **authorization:** Add group role assignment endpoints ([#1619](https://github.com/workos/workos-node/issues/1619)) ([df60af3](https://github.com/workos/workos-node/commit/df60af3ba4fc2ea94fd0a7acd26daef9f56c3781))

## [10.2.1](https://github.com/workos/workos-node/compare/v10.2.0...v10.2.1) (2026-06-16)


### Bug Fixes

* Prevent handleParseError from double-reading response body ([#1622](https://github.com/workos/workos-node/issues/1622)) ([e1cdb7f](https://github.com/workos/workos-node/commit/e1cdb7f45f550bc77a28737991b42b9fd2862f06))

## [10.2.0](https://github.com/workos/workos-node/compare/v10.1.0...v10.2.0) (2026-06-02)


### Features

* **authkit:** Add Radar challenge completion and error handling ([#1606](https://github.com/workos/workos-node/issues/1606)) ([420e739](https://github.com/workos/workos-node/commit/420e739ea062f5f909d0845a25c194d535d3b05d))


### Bug Fixes

* migrate Widgets API to oagen work ([#1605](https://github.com/workos/workos-node/issues/1605)) ([19c1de6](https://github.com/workos/workos-node/commit/19c1de639392ac331823986d15e1117fbe698aa0))

## [10.1.0](https://github.com/workos/workos-node/compare/v10.0.0...v10.1.0) (2026-06-02)


### Features

* Add name field to Profile, User, and Actions interfaces ([#1602](https://github.com/workos/workos-node/issues/1602)) ([df3ecbd](https://github.com/workos/workos-node/commit/df3ecbd3feadffb9dc9c25a31f5dc55a9e1a5ec2))
* **authkit:** Add Radar fields to headless AuthKit methods ([#1603](https://github.com/workos/workos-node/issues/1603)) ([4f34f01](https://github.com/workos/workos-node/commit/4f34f018feb7b66adcff63078d83eeecf67a877e))


### Bug Fixes

* **connect:** Serialize pagination options for auto-pagination ([#1601](https://github.com/workos/workos-node/issues/1601)) ([c8333f4](https://github.com/workos/workos-node/commit/c8333f41ae36e262901b3d0048e44c94a49f2d5a))

## [10.0.0](https://github.com/workos/workos-node/compare/v9.3.1...v10.0.0) (2026-05-27)


### ⚠ BREAKING CHANGES

* remove search param from listResources ([#1591](https://github.com/workos/workos-node/issues/1591))
* **groups:** `Group.createdAt` and `Group.updatedAt` now deserialize as `Date` objects
* **vault:** `listObjects` now returns an auto-paginatable object summary collection instead of the previous list digest shape
* **vault:** generated Vault response types now use SDK-shaped camelCase fields for key and object responses
* **webhooks:** `Webhooks` constructor signature changed from `constructor(cryptoProvider: CryptoProvider)` to `constructor(workos: WorkOS)` ([#1592](https://github.com/workos/workos-node/issues/1592))

### Features

* Add Radar to Node SDK ([#1596](https://github.com/workos/workos-node/issues/1596)) ([6330961](https://github.com/workos/workos-node/commit/6330961da4b1f249f86825ad3eafc8643c275318))
* **connect:** Add Connect module ([#1597](https://github.com/workos/workos-node/issues/1597)) ([4011dd0](https://github.com/workos/workos-node/commit/4011dd0b62f7d57e6f4fabb275bdfdc90a0fb7f7))
* **groups:** Regenerate Groups module via oagen ([a3c14b3](https://github.com/workos/workos-node/commit/a3c14b31cba51aafad931ee512c6832d14a4f776))
* remove search param from listResources ([#1591](https://github.com/workos/workos-node/issues/1591)) ([9ebc818](https://github.com/workos/workos-node/commit/9ebc818c908bb4ada660cd6ccefff43c36dec148))
* **vault:** Add generated Vault serializers and types, including rekey support, object list filters, and delete version checks ([a3c14b3](https://github.com/workos/workos-node/commit/a3c14b31cba51aafad931ee512c6832d14a4f776))
* **webhooks:** Add webhook endpoint CRUD ([#1592](https://github.com/workos/workos-node/issues/1592)) ([3b226d7](https://github.com/workos/workos-node/commit/3b226d71405b55f5eb519b533087902395c3e580))


### Bug Fixes

* **renovate:** explicitly enable minor and patch updates ([#1598](https://github.com/workos/workos-node/issues/1598)) ([ad48448](https://github.com/workos/workos-node/commit/ad484483f1a1ec3a6c990d778121c663970c38f1))

## [9.3.1](https://github.com/workos/workos-node/compare/v9.3.0...v9.3.1) (2026-05-19)


### Bug Fixes

* set canonical User-Agent header format ([#1576](https://github.com/workos/workos-node/issues/1576)) ([4169434](https://github.com/workos/workos-node/commit/4169434bc9b59d77c3b226292441e8bad0a0df91))
* **webhooks:** accept raw request bytes for signature verification ([#1578](https://github.com/workos/workos-node/issues/1578)) ([112b261](https://github.com/workos/workos-node/commit/112b261ecbfc68d0ee4912ad78095b1c70cf58b5))

## [9.3.0](https://github.com/workos/workos-node/compare/v9.2.0...v9.3.0) (2026-05-13)


### Features

* Add resource and role_slug filter params to list role assignments ([#1585](https://github.com/workos/workos-node/issues/1585)) ([4f32a83](https://github.com/workos/workos-node/commit/4f32a83c1b490ffe97ecdfb18dadee22061d93c8))

## [9.2.0](https://github.com/workos/workos-node/compare/v9.1.1...v9.2.0) (2026-05-04)


### Features

* Add resource role assignments methods ([#1580](https://github.com/workos/workos-node/issues/1580)) ([ec8dd0f](https://github.com/workos/workos-node/commit/ec8dd0f66e507f4fb9dfe3d13260eb5da7c8ba77))

## [9.1.1](https://github.com/workos/workos-node/compare/v9.1.0...v9.1.1) (2026-04-24)


### Bug Fixes

* Correctly handle all `isAuthenticationErrorData` cases ([#1573](https://github.com/workos/workos-node/issues/1573)) ([b572431](https://github.com/workos/workos-node/commit/b572431a9e225a8eb524220b054cef0596c7574b))
* Fix incorrect url for listEffectivePermissionsByExternalId ([#1574](https://github.com/workos/workos-node/issues/1574)) ([8f8fc81](https://github.com/workos/workos-node/commit/8f8fc8168f6fcf6109e99938ab36c588c3e9bf62))
* restore typed data on `AuthenticationErrorData` ([#1570](https://github.com/workos/workos-node/issues/1570)) ([a7a1e6d](https://github.com/workos/workos-node/commit/a7a1e6dee05d9449b4c565906536f67b343d0fd1))
* revert "Rename Authorization methods to match oagen hints" ([7ab0380](https://github.com/workos/workos-node/commit/7ab03806854349928bac91d3f014e37f33cf94cc))

## [9.1.0](https://github.com/workos/workos-node/compare/v9.0.0...v9.1.0) (2026-04-21)


### Features

* add support for role_slug in invitation schema ([#1567](https://github.com/workos/workos-node/issues/1567)) ([ba29409](https://github.com/workos/workos-node/commit/ba29409743619ebb855c06b7c9987114afae61ea))

## [9.0.0](https://github.com/workos/workos-node/compare/v8.13.0...v9.0.0) (2026-04-21)


### ⚠ BREAKING CHANGES

* rename `portal` to `adminPortal` ([#1562](https://github.com/workos/workos-node/issues/1562))
* standardize authorization list endpoint pagination ([#1553](https://github.com/workos/workos-node/issues/1553))
* Drop Node.js v20 support, require v22.11+ ([#1560](https://github.com/workos/workos-node/issues/1560))
* Remove legacy FGA package ([#1559](https://github.com/workos/workos-node/issues/1559))

### Features

* Add groups endpoints and group event types ([#1564](https://github.com/workos/workos-node/issues/1564)) ([cb0c46d](https://github.com/workos/workos-node/commit/cb0c46d74304942146259c4b90778f05fc16df64))
* adding three new conection types to node SDK connection type enums ([#1389](https://github.com/workos/workos-node/issues/1389)) ([c11cfd6](https://github.com/workos/workos-node/commit/c11cfd659f2a151b3e03e7db88feac1fac3a6483))
* standardize authorization list endpoint pagination ([#1553](https://github.com/workos/workos-node/issues/1553)) ([7a91d74](https://github.com/workos/workos-node/commit/7a91d74146c0b4464aefa0e046c7fc002464a8ee))
* Update Node SDK to include auditlogs.listSchemas ([#1457](https://github.com/workos/workos-node/issues/1457)) ([c31736d](https://github.com/workos/workos-node/commit/c31736df36c5c933628950e5be38ae542883116c))


### Bug Fixes

* add JSDoc docstrings from OpenAPI spec to all resource methods ([#1565](https://github.com/workos/workos-node/issues/1565)) ([562a57a](https://github.com/workos/workos-node/commit/562a57abfbabbb37c037fee53544c47df662cd57))
* **errors:** type server/auth errors and restore type compatibility ([#1561](https://github.com/workos/workos-node/issues/1561)) ([e149152](https://github.com/workos/workos-node/commit/e149152e873afd3ef9034c27a4505281bbadca9e))
* Export `ConflictException` and add `code` ([#1563](https://github.com/workos/workos-node/issues/1563)) ([a5524f8](https://github.com/workos/workos-node/commit/a5524f8d567ea842297ef780d9fd11f3120ad7ce))
* Normalize GithubOAuth to GitHubOAuth in identity deserialization ([#1566](https://github.com/workos/workos-node/issues/1566)) ([61f54a5](https://github.com/workos/workos-node/commit/61f54a544434d7af8ca2e93d742214c6fa776c6e))
* Remove extractVersion from matchUpdateTypes rules ([#1557](https://github.com/workos/workos-node/issues/1557)) ([f6272ea](https://github.com/workos/workos-node/commit/f6272ea85ecf4fa72142a8a046a8df175c180f0a))
* rename `portal` to `adminPortal` ([#1562](https://github.com/workos/workos-node/issues/1562)) ([80614d4](https://github.com/workos/workos-node/commit/80614d470ea43d11f76824db4390726fba041002))


### Code Refactoring

* Drop Node.js v20 support, require v22.11+ ([#1560](https://github.com/workos/workos-node/issues/1560)) ([24609a7](https://github.com/workos/workos-node/commit/24609a737cb26d159774dd89ffca384cbc6c6723))
* Remove legacy FGA package ([#1559](https://github.com/workos/workos-node/issues/1559)) ([8cdd668](https://github.com/workos/workos-node/commit/8cdd668949d0b04e3b3eaf3214153d58ca16b0b1))

Read the [V9_MIGRATION_GUIDE.md](https://github.com/workos/workos-node/blob/main/docs/V9_MIGRATION_GUIDE.md) for more information.

## [8.13.0](https://github.com/workos/workos-node/compare/v8.12.1...v8.13.0) (2026-04-13)


### Features

* Add resource_type_slug to createOrganizationRole to create resource-scoped custom roles ([#1549](https://github.com/workos/workos-node/issues/1549)) ([36fb14a](https://github.com/workos/workos-node/commit/36fb14a81884892ba325a9d8a3f2b8e1c9023b58))

## [8.12.1](https://github.com/workos/workos-node/compare/v8.12.0...v8.12.1) (2026-04-07)


### Bug Fixes

* **events:** handle domain verification failed ([#1543](https://github.com/workos/workos-node/issues/1543)) ([0f3f1ce](https://github.com/workos/workos-node/commit/0f3f1ceef4a6da35ce3caf434835f0ec0ae2b827))

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
