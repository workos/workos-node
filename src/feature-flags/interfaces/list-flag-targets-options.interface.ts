import { PaginationOptions } from '../../common/interfaces';

export interface ListFlagTargetsOptions extends PaginationOptions {
  ruleId?: string;
  flagSlug?: string;
  targetType?: string;
  targetId?: string;
}
