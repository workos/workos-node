type QueryValue =
  | string
  | string[]
  | Record<string, string | boolean | number>
  | undefined;

/**
 * Converts options to a query string.
 * - Arrays: scope=read&scope=write (repeat format)
 * - Objects: params[key]=value (bracket notation)
 * - Encoding: RFC1738 (space as +)
 * - Keys sorted alphabetically
 */
export function toQueryString(options: Record<string, QueryValue>): string {
  const params: Array<[string, string]> = [];
  const sortedKeys = Object.keys(options).sort((a, b) => a.localeCompare(b));

  for (const key of sortedKeys) {
    const value = options[key];

    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        params.push([key, String(item)]);
      }
    } else if (typeof value === 'object' && value !== null) {
      const sortedSubKeys = Object.keys(value).sort((a, b) =>
        a.localeCompare(b),
      );
      for (const subKey of sortedSubKeys) {
        const subValue = value[subKey];
        if (subValue !== undefined) {
          params.push([`${key}[${subKey}]`, String(subValue)]);
        }
      }
    } else {
      params.push([key, String(value)]);
    }
  }

  return params
    .map(([key, value]) => {
      const encodedKey = encodeRFC1738(key);
      const encodedValue = encodeRFC1738(value);
      return `${encodedKey}=${encodedValue}`;
    })
    .join('&');
}

function encodeRFC1738(str: string): string {
  return encodeURIComponent(str)
    .replace(/%20/g, '+')
    .replace(/[!'*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}
