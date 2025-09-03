import qs from 'qs';

/**
 * Converts an options object to a query string using qs library.
 * Maintains backwards compatibility with existing URL formatting.
 */
export const toQueryString = (
  options: Record<
    string,
    string | string[] | Record<string, string | boolean | number> | undefined
  >,
): string => {
  return qs.stringify(options, {
    arrayFormat: 'repeat',
    // sorts the keys alphabetically to maintain backwards compatibility
    sort: (a, b) => a.localeCompare(b),
    // encodes space as + instead of %20 to maintain backwards compatibility
    format: 'RFC1738',
  });
};
