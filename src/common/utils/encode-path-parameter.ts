/**
 * Encode a caller-supplied identifier for safe interpolation into a single URL
 * path segment.
 *
 * SDK path templates interpolate caller-supplied identifiers (user IDs,
 * invitation tokens, MFA factor IDs, organization IDs, external IDs, role and
 * permission slugs, ...) into the request path. Without encoding, a value such
 * as `../../user_management/users/user_01ABC` would be resolved by the WHATWG
 * `URL` parser (see `HttpClient.getResourceURL`) into a different API path,
 * letting an attacker who influences one identifier retarget the request to an
 * arbitrary same-verb endpoint. `encodeURIComponent` neutralizes this by
 * percent-encoding the path/query/fragment metacharacters (`/`, `?`, `#`, ...)
 * that enable the injection, keeping one parameter mapped to exactly one path
 * segment.
 *
 * `encodeURIComponent` alone is not sufficient for the two dot-only segments
 * `.` and `..`: it leaves them unchanged, and the WHATWG `URL` parser then
 * removes them as relative path segments (even when a value like `..` is a
 * single segment, a template such as `/feature-flags/${slug}/enable` supplies
 * the trailing segment, so `..` still climbs and retargets the request).
 * Percent-encoding the dots does not help because the parser also treats the
 * `%2e` forms as dot segments. A `.` or `..` is never a valid WorkOS
 * identifier, so we fail closed and throw rather than emit an ambiguous path.
 *
 * The one deviation from `encodeURIComponent` is that a literal `:` is kept
 * unescaped. Colons are valid path-segment characters (RFC 3986 `pchar`) and
 * are used by WorkOS RBAC slugs (e.g. `users:read`); an interpolated value is
 * always preceded by a `/`-delimited segment, so a `:` can never be read as a
 * URL scheme. Preserving it keeps the wire format identical for existing slugs.
 */
export function encodePathParameter(value: string): string {
  const encoded = encodeURIComponent(value).replace(/%3A/gi, ':');

  if (encoded === '.' || encoded === '..') {
    throw new TypeError(
      'Invalid path parameter: a path parameter must not be "." or "..".',
    );
  }

  return encoded;
}
