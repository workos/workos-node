export class NoApiKeyProvidedException extends Error {
  readonly status: number = 500;
  readonly name: string = 'NoApiKeyProvidedException';
  readonly message: string =
    `No api key provided. Either include the api key in the WorkOS constructor like so: ` +
    `'new WorkOS({ apiKey: "sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU" })' ` +
    `or save it to the 'WORKOS_API_KEY' environment variable.`;
}
