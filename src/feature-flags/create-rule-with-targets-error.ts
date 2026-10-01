import { FlagRule, FlagTargetMembership } from './interfaces';

/** A rule was created, but adding one of its targets failed. */
export class CreateRuleWithTargetsError extends Error {
  readonly name = 'CreateRuleWithTargetsError';

  constructor(
    readonly rule: FlagRule,
    /** Memberships confirmed by the API before the failure. */
    readonly targets: FlagTargetMembership[],
    readonly failedTargetId: string,
    cause: unknown,
  ) {
    super('The rule was created, but adding a target failed.', { cause });
  }
}
