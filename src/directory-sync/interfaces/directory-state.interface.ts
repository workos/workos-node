// @oagen-ignore-file
// Hand-owned: the WorkOS API reports raw directory states (`linked`, `unlinked`,
// `validating`, `invalid_credentials`, `deleting`), but this SDK has always
// surfaced `linked`/`unlinked` as `active`/`inactive`. The OpenAPI spec only
// describes the raw enum, so that translation can't be generated — it lives in
// `deserializeDirectoryState` (see directory.serializer.ts). Keep this type and
// that serializer in lockstep.
export type DirectoryState =
  | 'active'
  | 'inactive'
  | 'validating'
  | 'invalid_credentials'
  | 'deleting';
