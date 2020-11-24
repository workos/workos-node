# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.8.3] - 2020-11-23

### Fixed

- Fixed an issue where the `redirectURI` parameter was being passed up to the API using the wrong name ([#273](https://github.com/workos-inc/workos-node/pull/273))

## [0.8.2] - 2020-11-19

### Changed

- Improved naming consistency for better ergonomics ([#269](https://github.com/workos-inc/workos-node/pull/269))

## [0.8.1] - 2020-11-18

### Added

- Support `redirect_uri` Option for Creating Passwordless Sessions ([#267](https://github.com/workos-inc/workos-node/pull/267))

## [0.8.0] - 2020-10-14

### Added

- Exposed `connection_id` attribute on Profile objects. ([#241](https://github.com/workos-inc/workos-node/pull/241))

## [0.7.0] - 2020-09-16

### Added

- Added MagicLink support through Passwordless module ([#224](https://github.com/workos-inc/workos-node/pull/224))

## [0.6.1] - 2020-09-14

### Fixed

- Bump `@workos-inc/node` to `0.6.1` ([#223](https://github.com/workos-inc/workos-node/pull/223))

## [0.6.0] - 2020-09-14

### Added

- Added `generateLink` to Portal ([#219](https://github.com/workos-inc/workos-node/pull/219))
- Added `createOrganization` to Portal ([#218](https://github.com/workos-inc/workos-node/pull/218))
- Added Portal and expose `listOrganizations` ([#217](https://github.com/workos-inc/workos-node/pull/217))

### Changed

- Renamed listOrganizations arg `domain` to `domains` ([#222](https://github.com/workos-inc/workos-node/pull/222))

## [0.5.0] - 2020-08-25

### Added

- Exposed `raw_attributes` on Profile ([#204](https://github.com/workos-inc/workos-node/pull/204))

## [0.4.1] - 2020-08-14

### Changed

- Changed `event_type` for Audit Trail events and added barrel files.

## [0.4.0] - 2020-08-04

### Added

- Added method to fetch Audit Trail events.

## [0.3.0] - 2020-04-30

### Changed

- Deprecated `client.sso.promoteDraftConnection()`. Replaced with `client.sso.createConnection()`. ([#138](https://github.com/workos-inc/workos-node/pull/138))

## [2.3.4] - 2020-04-15

### Changed

- Removed `engines` from package.json. ([#124](https://github.com/workos-inc/workos-node/pull/124))

## [0.2.3] - 2020-03-19

### Changed

- Changed the profile request to use the `POST` body instead of query parameters.

## [0.2.1] - 2020-03-15

### Changed

- Renamed the `auditLog` package to `auditTrail`. To upgrade change all references `WorkOS.auditLog` to `WorkOS.auditTrail`.

## [0.1.0] - 2020-01-02

### Removed

- Removed the `redirectURI` parameter from the `sso.getProfile` function. Migrating existing code just requires removing the existing parameter:

```ts
// v0.0.23

const profile = await workos.sso.getProfile({
  code: 'authorization_code',
  projectID: 'proj_123',
  redirectURI: 'https://exmaple.com/sso/workos/callback',
});
```

```ts
// v0.1.0

const profile = await workos.sso.getProfile({
  code: 'authorization_code',
  projectID: 'proj_123',
});
```

[unreleased]: https://github.com/workos-inc/workos-node/compare/v0.8.3...HEAD
[0.8.3]: https://github.com/workos-inc/workos-node/compare/v0.8.2...v0.8.3
[0.8.2]: https://github.com/workos-inc/workos-node/compare/v0.8.1...v0.8.2
[0.8.1]: https://github.com/workos-inc/workos-node/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/workos-inc/workos-node/compare/0.7.0...v0.8.0
[0.7.0]: https://github.com/workos-inc/workos-node/compare/v0.6.1...0.7.0
[0.6.1]: https://github.com/workos-inc/workos-node/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/workos-inc/workos-node/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/workos-inc/workos-node/compare/v0.4.1...v0.5.0
[0.4.1]: https://github.com/workos-inc/workos-node/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/workos-inc/workos-node/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/workos-inc/workos-node/compare/2.3.4...v0.3.0
[2.3.4]: https://github.com/workos-inc/workos-node/compare/v0.2.3...2.3.4
[0.2.3]: https://github.com/workos-inc/workos-node/compare/v0.2.1...v0.2.3
[0.2.1]: https://github.com/workos-inc/workos-node/compare/0.1.0...v0.2.1
[0.1.0]: https://github.com/workos-inc/workos-node/compare/ea4ecf1...0.1.0
