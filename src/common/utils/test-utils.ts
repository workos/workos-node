import fetch, { MockParams } from 'jest-fetch-mock';

export function fetchOnce(
  response = {},
  { status = 200, headers, ...rest }: MockParams = {},
) {
  return fetch.once(JSON.stringify(response), {
    status,
    headers: { 'content-type': 'application/json;charset=UTF-8', ...headers },
    ...rest,
  });
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

export function fetchMethod() {
  return fetch.mock.calls[0][1]?.method;
}

export function fetchBody({ raw = false } = {}) {
  const body = fetch.mock.calls[0][1]?.body;
  if (body instanceof URLSearchParams) {
    return body.toString();
  }
  if (raw) {
    return body;
  }
  return JSON.parse(String(body));
}
