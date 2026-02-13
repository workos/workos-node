import { PaginationOptions } from '../interfaces/pagination-options.interface';

export const serializePaginationOptions = (
  options: PaginationOptions,
): Record<string, string | number> => ({
  ...(options.limit !== undefined && { limit: options.limit }),
  ...(options.after && { after: options.after }),
  ...(options.before && { before: options.before }),
  ...(options.order && { order: options.order }),
});
