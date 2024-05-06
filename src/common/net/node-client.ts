import HttpClientInterface from './http-client.interface';
import HttpClient from './http-client';

type Http = typeof import('http');
type Https = typeof import('https');

export class NodeHttpClient extends HttpClient implements HttpClientInterface {
  private http!: Http;
  private https!: Https;

  constructor() {
    this.init();
  }

  private async init() {
    this.http = (await import('http')).default;
    this.https = (await import('https')).default;
  }

  async get(url: string): Promise<string> {
    return this.nodeRequest(url, 'GET');
  }

  async post(
    url: string,
    body: any,
    headers?: Record<string, string>,
  ): Promise<string> {
    return this.nodeRequest(url, 'POST', body, headers);
  }

  async put(
    url: string,
    body: any,
    headers?: Record<string, string>,
  ): Promise<string> {
    return this.nodeRequest(url, 'PUT', body, headers);
  }

  async delete(url: string, headers?: Record<string, string>): Promise<string> {
    return this.nodeRequest(url, 'DELETE', null, headers);
  }

  private async nodeRequest(
    url: string,
    method: string,
    body?: any,
    headers?: Record<string, string>,
  ): Promise<string> {
    await this.init(); // Ensure HTTP modules are loaded
    return new Promise((resolve, reject) => {
      const lib = url.startsWith('https') ? this.https : this.http;
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      };
      const req = lib.request(url, options, (res) => {
        if (res.statusCode < 200 || res.statusCode > 299) {
          reject(
            new Error(`Failed to load page, status code: ${res.statusCode}`),
          );
        }
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks).toString()));
      });
      req.on('error', (err) => reject(err));
      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }
}
