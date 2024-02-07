export function getQueryString(queryObj?: Record<string, any>) {
  if (!queryObj) return undefined;

  const sanitizedQueryObj: Record<string, any> = {};

  Object.entries(queryObj).forEach(([param, value]) => {
    if (value !== '' && value !== undefined) sanitizedQueryObj[param] = value;
  });

  return new URLSearchParams(sanitizedQueryObj).toString();
}
