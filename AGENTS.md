# WorkOS Node SDK — Agent Context

## Spelling

Write American English in hand-maintained code, comments, docs and test names
(`behavior`, `canceled`, `honor`), per the
[WorkOS writing style guide](https://app.notion.com/p/workos/Writing-In-Our-Product-6975915fa9a74150916c669d562afe16#5d75728e33a040efa879e598340b8523).
Never respell a name or value that already ships: exported types, methods,
options, API fields and enum values, fixture payloads, generated files, and
third-party identifiers keep their spelling.

## Releases

release-please releases four packages from this repository: the SDK at the
root, and a provider package in each directory under `packages/`. A change to
a provider package must not release the SDK.

release-please counts a commit for the SDK unless every file it touches is
under `packages/`. Pull requests are squash-merged, so one pull request is one
commit. Only `feat`, `fix`, `perf` and `revert` commits, and breaking changes,
cause a release.

- A `feat` or `fix` pull request for a provider package touches only
  `packages/<name>/`.
- A change to a provider package's dependencies goes in its own `chore(deps)`
  pull request, with `packages/<name>/package.json` and the root
  `package-lock.json` together. Merge it before the `feat` or `fix` pull
  request that needs it.
- A `chore(deps)` pull request releases nothing. When a dependency change must
  ship with no other change, follow it with a `fix` pull request that touches
  only `packages/<name>/`.
- A pull request that changes the SDK and a provider package on purpose
  releases both.
