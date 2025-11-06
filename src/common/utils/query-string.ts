/**
 * Native query string serialization that replaces the qs library.
 * Maintains backward compatibility with existing URL formatting.
 *
 * This implementation:
 * - Uses only native Web APIs (works in all runtimes)
 * - Handles arrays with 'repeat' format: scope=read&scope=write
 * - Sorts keys alphabetically for consistency
 * - Uses RFC1738 encoding (space as +)
 * - Handles nested objects: provider_query_params[key]=value
 * - Filters out undefined values
 */

type QueryValue = string | string[] | Record<string, string | boolean | number> | undefined;

/**
 * Converts an options object to a query string.
 * Compatible with the qs library's stringify method when used with:
 * - arrayFormat: 'repeat'
 * - format: 'RFC1738'
 * - sort: alphabetical
 */
export function toQueryString(options: Record<string, QueryValue>): string {
  const params: Array<[string, string]> = [];

  // Get sorted keys for consistent output (matches qs behavior)
  const sortedKeys = Object.keys(options).sort((a, b) => a.localeCompare(b));

  for (const key of sortedKeys) {
    const value = options[key];

    // Skip undefined values (matches qs behavior)
    if (value === undefined) {
      continue;
    }

    // Handle arrays with 'repeat' format: key=val1&key=val2
    if (Array.isArray(value)) {
      for (const item of value) {
        params.push([key, String(item)]);
      }
    }
    // Handle nested objects: key[subkey]=value
    else if (typeof value === 'object' && value !== null) {
      const sortedSubKeys = Object.keys(value).sort((a, b) => a.localeCompare(b));
      for (const subKey of sortedSubKeys) {
        const subValue = value[subKey];
        if (subValue !== undefined) {
          params.push([`${key}[${subKey}]`, String(subValue)]);
        }
      }
    }
    // Handle primitives (string, number, boolean)
    else {
      params.push([key, String(value)]);
    }
  }

  // Build query string with RFC1738 encoding (space as +)
  return params
    .map(([key, value]) => {
      // Encode using RFC1738 format (matches qs behavior)
      const encodedKey = encodeRFC1738(key);
      const encodedValue = encodeRFC1738(value);
      return `${encodedKey}=${encodedValue}`;
    })
    .join('&');
}

/**
 * Encodes a string using RFC1738 format.
 * - Space is encoded as +
 * - Additional characters encoded to match qs library behavior
 */
function encodeRFC1738(str: string): string {
  return encodeURIComponent(str)
    .replace(/%20/g, '+')        // Space as + (RFC1738)
    .replace(/[!'*]/g, (c) => {
      // Encode additional characters to match qs behavior
      return '%' + c.charCodeAt(0).toString(16).toUpperCase();
    });
}
