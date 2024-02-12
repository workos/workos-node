import fetch, { MockParams } from 'jest-fetch-mock';

export function fetchOnce(
  response: any = {},
  { status = 200, ...rest }: MockParams = {},
) {
  return fetch.once(JSON.stringify(response), { status, ...rest });
}

export function fetchURL() {
  return fetch.mock.calls[0][0];
}

export function fetchSearchParams() {
  return Object.fromEntries(new URL(String(fetchURL())).searchParams);
}

export function fetchHeaders() {
  return fetch.mock.calls[0][1]?.headers;
}

export function fetchBody() {
  const body = fetch.mock.calls[0][1]?.body;
  if (body instanceof URLSearchParams) {
    return body.toString();
  }
  return JSON.parse(String(body));
}
