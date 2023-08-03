import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export function withDefaultOrder(
  options?: PaginationOptions,
): PaginationOptions {
  return { ...options, order: options?.order ?? 'desc' };
}
