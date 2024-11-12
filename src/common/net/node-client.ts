import { HttpClient, HttpClientError, HttpClientResponse } from './http-client';
import {
  HttpClientInterface,
  HttpClientResponseInterface,
  RequestHeaders,
  RequestOptions,
} from '../interfaces/http-client.interface';

import {
  RequestOptions as HttpRequestOptions,
  Agent as HttpAgent,
} from 'node:http';
import { Agent as HttpsAgent } from 'node:https';

import * as http_ from 'node:http';
import * as https_ from 'node:https';

// `import * as http_ from 'http'` creates a "Module Namespace Exotic Object"
// which is immune to monkey-patching, whereas http_.default (in an ES Module context)
// will resolve to the same thing as require('http'), which is
// monkey-patchable. We care about this because users in their test
// suites might be using a library like "nock" which relies on the ability
// to monkey-patch and intercept calls to http.request.
const http = (http_ as unknown as { default: typeof http_ }).default || http_;
const https =
  (https_ as unknown as { default: typeof https_ }).default || https_;

export class NodeHttpClient extends HttpClient implements HttpClientInterface {
  private httpAgent: HttpAgent;
  private httpsAgent: HttpsAgent;

  constructor(readonly baseURL: string, readonly options?: RequestInit) {
    super(baseURL, options);

    this.httpAgent = new http.Agent({ keepAlive: true });
    this.httpsAgent = new https.Agent({ keepAlive: true });
  }

  getClientName(): string {
    return 'node';
  }

  static override getBody(entity: unknown): string | null {
    if (entity === null || entity === undefined) {
      return null;
    }

    if (entity instanceof URLSearchParams) {
      return entity.toString();
    }

    return JSON.stringify(entity);
  }

  async get(
    path: string,
    options: RequestOptions,
  ): Promise<HttpClientResponseInterface> {
    const resourceURL = HttpClient.getResourceURL(
      this.baseURL,
      path,
      options.params,
    );

    if (path.startsWith('/fga/')) {
      return await this.nodeRequestWithRetry(
        resourceURL,
        'GET',
        null,
        options.headers,
      );
    } else {
      return await this.nodeRequest(resourceURL, 'GET', null, options.headers);
    }
  }

  async post<Entity = any>(
    path: string,
    entity: Entity,
    options: RequestOptions,
  ): Promise<HttpClientResponseInterface> {
    const resourceURL = HttpClient.getResourceURL(
      this.baseURL,
      path,
      options.params,
    );

    if (path.startsWith('/fga/')) {
      return await this.nodeRequestWithRetry(
        resourceURL,
        'POST',
        NodeHttpClient.getBody(entity),
        {
          ...HttpClient.getContentTypeHeader(entity),
          ...options.headers,
        },
      );
    } else {
      return await this.nodeRequest(
        resourceURL,
        'POST',
        NodeHttpClient.getBody(entity),
        {
          ...HttpClient.getContentTypeHeader(entity),
          ...options.headers,
        },
      );
    }
  }

  async put<Entity = any>(
    path: string,
    entity: Entity,
    options: RequestOptions,
  ): Promise<HttpClientResponseInterface> {
    const resourceURL = HttpClient.getResourceURL(
      this.baseURL,
      path,
      options.params,
    );

    if (path.startsWith('/fga/')) {
      return await this.nodeRequestWithRetry(
        resourceURL,
        'PUT',
        NodeHttpClient.getBody(entity),
        {
          ...HttpClient.getContentTypeHeader(entity),
          ...options.headers,
        },
      );
    } else {
      return await this.nodeRequest(
        resourceURL,
        'PUT',
        NodeHttpClient.getBody(entity),
        {
          ...HttpClient.getContentTypeHeader(entity),
          ...options.headers,
        },
      );
    }
  }

  async delete(
    path: string,
    options: RequestOptions,
  ): Promise<HttpClientResponseInterface> {
    const resourceURL = HttpClient.getResourceURL(
      this.baseURL,
      path,
      options.params,
    );

    if (path.startsWith('/fga/')) {
      return await this.nodeRequestWithRetry(
        resourceURL,
        'DELETE',
        null,
        options.headers,
      );
    } else {
      return await this.nodeRequest(
        resourceURL,
        'DELETE',
        null,
        options.headers,
      );
    }
  }

  private async nodeRequest(
    url: string,
    method: string,
    body: string | null,
    headers?: RequestHeaders,
  ): Promise<HttpClientResponseInterface> {
    return new Promise<HttpClientResponseInterface>((resolve, reject) => {
      const isSecureConnection = url.startsWith('https');
      const agent = isSecureConnection ? this.httpsAgent : this.httpAgent;
      const lib = isSecureConnection ? https : http;

      const { 'User-Agent': userAgent } = this.options
        ?.headers as RequestHeaders;

      const options: HttpRequestOptions = {
        method,
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          ...(this.options?.headers as http_.OutgoingHttpHeaders),
          ...headers,
          'User-Agent': this.addClientToUserAgent(userAgent.toString()),
        },
        agent,
      };

      const req = lib.request(url, options, async (res) => {
        const clientResponse = new NodeHttpClientResponse(res);

        if (res.statusCode && (res.statusCode < 200 || res.statusCode > 299)) {
          reject(
            new HttpClientError({
              message: res.statusMessage as string,
              response: {
                status: res.statusCode,
                headers: res.headers,
                data: await clientResponse.toJSON(),
              },
            }),
          );
        }

        resolve(clientResponse);
      });

      req.on('error', (err) => {
        reject(new Error(err.message));
      });

      if (body) {
        req.setHeader('Content-Length', Buffer.byteLength(body));
        req.write(body);
      }
      req.end();
    });
  }

  private async nodeRequestWithRetry(
    url: string,
    method: string,
    body: string | null,
    headers?: RequestHeaders,
  ): Promise<HttpClientResponseInterface> {
    const isSecureConnection = url.startsWith('https');
    const agent = isSecureConnection ? this.httpsAgent : this.httpAgent;
    const lib = isSecureConnection ? https : http;

    const { 'User-Agent': userAgent } = this.options?.headers as RequestHeaders;

    const options: HttpRequestOptions = {
      method,
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        ...(this.options?.headers as http_.OutgoingHttpHeaders),
        ...headers,
        'User-Agent': this.addClientToUserAgent(userAgent.toString()),
      },
      agent,
    };

    let retryAttempts = 1;

    const makeRequest = async (): Promise<HttpClientResponseInterface> =>
      new Promise<HttpClientResponseInterface>((resolve, reject) => {
        const req = lib.request(url, options, async (res) => {
          const clientResponse = new NodeHttpClientResponse(res);

          if (this.shouldRetryRequest(res, retryAttempts)) {
            retryAttempts++;

            await this.sleep(retryAttempts);

            return makeRequest().then(resolve).catch(reject);
          }

          if (
            res.statusCode &&
            (res.statusCode < 200 || res.statusCode > 299)
          ) {
            reject(
              new HttpClientError({
                message: res.statusMessage as string,
                response: {
                  status: res.statusCode,
                  headers: res.headers,
                  data: await clientResponse.toJSON(),
                },
              }),
            );
          }

          resolve(new NodeHttpClientResponse(res));
        });

        req.on('error', async (err) => {
          if (err != null && err instanceof TypeError) {
            retryAttempts++;
            await this.sleep(retryAttempts);
            return makeRequest().then(resolve).catch(reject);
          }

          reject(new Error(err.message));
        });

        if (body) {
          req.setHeader('Content-Length', Buffer.byteLength(body));
          req.write(body);
        }
        req.end();
      });

    return makeRequest();
  }

  private shouldRetryRequest(response: any, retryAttempt: number): boolean {
    if (retryAttempt > this.MAX_RETRY_ATTEMPTS) {
      return false;
    }

    if (
      response != null &&
      this.RETRY_STATUS_CODES.includes(response.statusCode)
    ) {
      return true;
    }

    return false;
  }
}

// tslint:disable-next-line
export class NodeHttpClientResponse
  extends HttpClientResponse
  implements HttpClientResponseInterface
{
  _res: http_.IncomingMessage;

  constructor(res: http_.IncomingMessage) {
    // @ts-ignore
    super(res.statusCode, res.headers || {});
    this._res = res;
  }

  getRawResponse(): http_.IncomingMessage {
    return this._res;
  }

  toJSON(): Promise<any> | any {
    return new Promise((resolve, reject) => {
      const contentType = this._res.headers['content-type'];
      const isJsonResponse = contentType?.includes('application/json');

      if (!isJsonResponse) {
        resolve(null);
      }

      let response = '';

      this._res.setEncoding('utf8');
      this._res.on('data', (chunk) => {
        response += chunk;
      });
      this._res.once('end', () => {
        try {
          resolve(JSON.parse(response));
        } catch (e) {
          reject(e);
        }
      });
    });
  }
}
