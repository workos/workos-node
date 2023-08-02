export const mockWorkOsResponse = (status: number, data: unknown) => ({
  data,
  status,
  headers: {},
  statusText: '',
  config: {} as any,
});
