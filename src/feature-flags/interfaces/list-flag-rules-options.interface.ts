import { PaginationOptions } from '../../common/interfaces';

export interface ListFlagRulesOptions extends Pick<
  PaginationOptions,
  'limit' | 'before' | 'after'
> {
  /** The feature flag's slug. Rules are always returned in position order. */
  featureFlag: string;
}
