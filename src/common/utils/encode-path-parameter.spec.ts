import { encodePathParameter } from './encode-path-parameter';

describe('encodePathParameter', () => {
  it('leaves ordinary identifiers unchanged', () => {
    expect(encodePathParameter('user_01ABC')).toBe('user_01ABC');
    expect(encodePathParameter('auth_factor_01FVYZ5QM8N98T9ME5BCB2BBMJ')).toBe(
      'auth_factor_01FVYZ5QM8N98T9ME5BCB2BBMJ',
    );
  });

  it('preserves colons used by RBAC slugs', () => {
    expect(encodePathParameter('users:read')).toBe('users:read');
    expect(encodePathParameter('members:invite')).toBe('members:invite');
  });

  it('encodes path traversal and metacharacters so one param stays one segment', () => {
    expect(encodePathParameter('../../user_management/users/user_01ABC')).toBe(
      '..%2F..%2Fuser_management%2Fusers%2Fuser_01ABC',
    );
    expect(encodePathParameter('a/b')).toBe('a%2Fb');
    expect(encodePathParameter('a?b')).toBe('a%3Fb');
    expect(encodePathParameter('a#b')).toBe('a%23b');
    expect(encodePathParameter('%2e%2e')).toBe('%252e%252e');
  });

  it('rejects dot-only segments the URL parser would collapse', () => {
    // `encodeURIComponent` leaves these unchanged and `new URL()` removes them
    // as relative path segments, so a non-terminal template (e.g.
    // `/feature-flags/${slug}/enable`) would retarget the request.
    expect(() => encodePathParameter('.')).toThrow(TypeError);
    expect(() => encodePathParameter('..')).toThrow(TypeError);
  });

  it('allows segments that merely contain dots', () => {
    expect(encodePathParameter('...')).toBe('...');
    expect(encodePathParameter('..foo')).toBe('..foo');
    expect(encodePathParameter('v1.2.3')).toBe('v1.2.3');
  });
});
