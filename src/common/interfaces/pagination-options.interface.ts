export interface PaginationOptions {
  limit?: number;
  before?: string | null;
  after?: string | null;
  order?: 'asc' | 'desc';
}
