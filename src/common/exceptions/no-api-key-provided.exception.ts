export class NoApiKeyProvidedException extends Error {
  readonly status: number = 500;
  readonly name: string = 'NoApiKeyProvidedException';
  readonly message: string =
    `Missing API key. Pass it to the constructor (new WorkOS({ key: "sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU" })) ` +
    `or define it in the WORKOS_API_KEY environment variable.`;
}
