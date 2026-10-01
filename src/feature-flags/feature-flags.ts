import { AutoPaginatable } from '../common/utils/pagination';
import { WorkOS } from '../workos';
import {
  AddFlagTargetOptions,
  CreateFlagRuleOptions,
  CreateFlagTargetOptions,
  CreateRuleWithTargetsOptions,
  CreateRuleWithTargetsResult,
  FeatureFlag,
  FeatureFlagResponse,
  FlagRule,
  FlagRuleResponse,
  FlagTargetMembership,
  FlagTargetMembershipResponse,
  ListFlagRulesOptions,
  ListFeatureFlagsOptions,
  RemoveFlagTargetOptions,
  RuntimeClientOptions,
} from './interfaces';
import {
  deserializeFeatureFlag,
  deserializeFlagRule,
  deserializeFlagTargetMembership,
} from './serializers';
import { CreateRuleWithTargetsError } from './create-rule-with-targets-error';
import { ListResponse, PaginationOptions } from '../common/interfaces';
import { deserializeList } from '../common/serializers';
import { fetchAndDeserialize } from '../common/utils/fetch-and-deserialize';
import { FeatureFlagsRuntimeClient } from './runtime-client';
import { ListOrganizationFeatureFlagsOptions } from '../organizations/interfaces/list-organization-feature-flags-options.interface';
import { ListUserFeatureFlagsOptions } from '../user-management/interfaces/list-user-feature-flags-options.interface';
import { encodePathParameter } from '../common/utils/encode-path-parameter';

export class FeatureFlags {
  constructor(private readonly workos: WorkOS) {}

  /** Append an empty rule to a flag. Duplicate target type/value pairs return 409. */
  async createFlagRule(options: CreateFlagRuleOptions): Promise<FlagRule> {
    const { data } = await this.workos.post<FlagRuleResponse>('/flag_rules', {
      feature_flag: options.featureFlag,
      target_type: options.targetType,
      value: options.value,
    });
    return deserializeFlagRule(data);
  }

  /** List a flag's rules in evaluation order. */
  async listFlagRules(
    options: ListFlagRulesOptions,
  ): Promise<AutoPaginatable<FlagRule, ListFlagRulesOptions>> {
    const fetchPage = async ({ limit, before, after }: PaginationOptions) => {
      const { data } = await this.workos.get<ListResponse<FlagRuleResponse>>(
        '/flag_rules',
        {
          query: { feature_flag: options.featureFlag, limit, before, after },
        },
      );
      return deserializeList(data, deserializeFlagRule);
    };
    return new AutoPaginatable(await fetchPage(options), fetchPage, options);
  }

  /** Get a rule in the current environment. */
  async getFlagRule(id: string): Promise<FlagRule> {
    const { data } = await this.workos.get<FlagRuleResponse>(
      `/flag_rules/${encodePathParameter(id)}`,
    );
    return deserializeFlagRule(data);
  }

  /** Delete a rule and all its target memberships. */
  async deleteFlagRule(id: string): Promise<void> {
    await this.workos.delete(`/flag_rules/${encodePathParameter(id)}`);
  }

  /** Add a membership to a rule. The rule supplies the target type and value. */
  async createFlagTarget(
    options: CreateFlagTargetOptions,
  ): Promise<FlagTargetMembership> {
    const { data } = await this.workos.post<FlagTargetMembershipResponse>(
      '/flag_targets',
      { rule_id: options.ruleId, target_id: options.targetId },
    );
    return deserializeFlagTargetMembership(data);
  }

  /** Delete a membership by its flag_target ID, not the targeted entity's ID. */
  async deleteFlagTarget(id: string): Promise<void> {
    await this.workos.delete(`/flag_targets/${encodePathParameter(id)}`);
  }

  // @oagen-ignore-start
  /**
   * Create a rule, then add its targets sequentially in input order.
   * This is not atomic: on failure, the rule and completed memberships remain.
   * A CreateRuleWithTargetsError exposes the rule, confirmed targets, failed
   * target ID, and original error. No later targets are attempted.
   */
  async createRuleWithTargets(
    options: CreateRuleWithTargetsOptions,
  ): Promise<CreateRuleWithTargetsResult> {
    const rule = await this.createFlagRule(options);
    const targets: FlagTargetMembership[] = [];
    for (const targetId of options.targetIds) {
      try {
        targets.push(
          await this.createFlagTarget({ ruleId: rule.id, targetId }),
        );
      } catch (cause) {
        throw new CreateRuleWithTargetsError(rule, targets, targetId, cause);
      }
    }
    return { rule, targets };
  }
  // @oagen-ignore-end

  /**
   * List feature flags
   *
   * Get a list of all of your existing feature flags matching the criteria specified.
   * @param options - Pagination and filter options.
   * @returns {Promise<AutoPaginatable<FeatureFlag>>}
   * @throws {BadRequestException} 400
   * @throws {NotFoundException} 404
   * @throws {UnprocessableEntityException} 422
   */
  async listFeatureFlags(
    options?: ListFeatureFlagsOptions,
  ): Promise<AutoPaginatable<FeatureFlag>> {
    return new AutoPaginatable(
      await fetchAndDeserialize<FeatureFlagResponse, FeatureFlag>(
        this.workos,
        '/feature-flags',
        deserializeFeatureFlag,
        options,
      ),
      (params) =>
        fetchAndDeserialize<FeatureFlagResponse, FeatureFlag>(
          this.workos,
          '/feature-flags',
          deserializeFeatureFlag,
          params,
        ),
      options,
    );
  }

  /**
   * Get a feature flag
   *
   * Get the details of an existing feature flag by its slug.
   * @param slug - A unique key to reference the Feature Flag.
   *
   * @example
   * "advanced-analytics"
   *
   * @returns {Promise<FeatureFlag>}
   * @throws {NotFoundException} 404
   */
  async getFeatureFlag(slug: string): Promise<FeatureFlag> {
    const { data } = await this.workos.get<FeatureFlagResponse>(
      `/feature-flags/${encodePathParameter(slug)}`,
    );

    return deserializeFeatureFlag(data);
  }

  /**
   * Enable a feature flag
   *
   * Enables a feature flag in the current environment.
   * @param slug - A unique key to reference the Feature Flag.
   *
   * @example
   * "advanced-analytics"
   *
   * @returns {Promise<FeatureFlag>}
   * @throws {NotFoundException} 404
   */
  async enableFeatureFlag(slug: string): Promise<FeatureFlag> {
    const { data } = await this.workos.put<FeatureFlagResponse>(
      `/feature-flags/${encodePathParameter(slug)}/enable`,
      {},
    );

    return deserializeFeatureFlag(data);
  }

  /**
   * Disable a feature flag
   *
   * Disables a feature flag in the current environment.
   * @param slug - A unique key to reference the Feature Flag.
   *
   * @example
   * "advanced-analytics"
   *
   * @returns {Promise<FeatureFlag>}
   * @throws {NotFoundException} 404
   */
  async disableFeatureFlag(slug: string): Promise<FeatureFlag> {
    const { data } = await this.workos.put<FeatureFlagResponse>(
      `/feature-flags/${encodePathParameter(slug)}/disable`,
      {},
    );

    return deserializeFeatureFlag(data);
  }

  /**
   * Add a feature flag target
   *
   * @deprecated For rule-based targeting, use createFlagRule and createFlagTarget.
   * This compatibility helper remains supported.
   *
   * Enables a feature flag for a specific target in the current environment. Currently, supported targets include users and organizations.
   * @params options - Object containing slug and targetId.
   * @returns {Promise<void>}
   * @throws {BadRequestException} 400
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   */
  async addFlagTarget(options: AddFlagTargetOptions): Promise<void> {
    const { slug, targetId } = options;
    await this.workos.post(
      `/feature-flags/${encodePathParameter(slug)}/targets/${encodePathParameter(targetId)}`,
      {},
    );
  }

  /**
   * Remove a feature flag target
   *
   * @deprecated For rule-based targeting, use deleteFlagTarget with a membership ID.
   * This compatibility helper remains supported.
   *
   * Removes a target from the feature flag's target list in the current environment. Currently, supported targets include users and organizations.
   * @params options - Object containing slug and targetId.
   * @returns {Promise<void>}
   * @throws {BadRequestException} 400
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   */
  async removeFlagTarget(options: RemoveFlagTargetOptions): Promise<void> {
    const { slug, targetId } = options;
    await this.workos.delete(
      `/feature-flags/${encodePathParameter(slug)}/targets/${encodePathParameter(targetId)}`,
    );
  }

  /**
   * List enabled feature flags for an organization
   *
   * Get a list of all enabled feature flags for an organization.
   * @param options - Pagination and filter options.
   * @returns {Promise<AutoPaginatable<FeatureFlag>>}
   * @throws {NotFoundException} 404
   */
  async listOrganizationFeatureFlags(
    options: ListOrganizationFeatureFlagsOptions,
  ): Promise<AutoPaginatable<FeatureFlag>> {
    const { organizationId, ...paginationOptions } = options;

    return new AutoPaginatable(
      await fetchAndDeserialize<FeatureFlagResponse, FeatureFlag>(
        this.workos,
        `/organizations/${encodePathParameter(organizationId)}/feature-flags`,
        deserializeFeatureFlag,
        paginationOptions,
      ),
      (params) =>
        fetchAndDeserialize<FeatureFlagResponse, FeatureFlag>(
          this.workos,
          `/organizations/${encodePathParameter(organizationId)}/feature-flags`,
          deserializeFeatureFlag,
          params,
        ),
      paginationOptions,
    );
  }

  /**
   * List enabled feature flags for a user
   *
   * @param options - Pagination and filter options.
   * @returns {Promise<AutoPaginatable<Flag>>}
   * @throws {NotFoundException} 404
   */
  async listUserFeatureFlags(
    options: ListUserFeatureFlagsOptions,
  ): Promise<AutoPaginatable<FeatureFlag>> {
    const { userId, ...paginationOptions } = options;

    return new AutoPaginatable(
      await fetchAndDeserialize<FeatureFlagResponse, FeatureFlag>(
        this.workos,
        `/user_management/users/${encodePathParameter(userId)}/feature-flags`,
        deserializeFeatureFlag,
        paginationOptions,
      ),
      (params) =>
        fetchAndDeserialize<FeatureFlagResponse, FeatureFlag>(
          this.workos,
          `/user_management/users/${encodePathParameter(userId)}/feature-flags`,
          deserializeFeatureFlag,
          params,
        ),
      paginationOptions,
    );
  }

  // @oagen-ignore-start
  createRuntimeClient(
    options?: RuntimeClientOptions,
  ): FeatureFlagsRuntimeClient {
    return new FeatureFlagsRuntimeClient(this.workos, options);
  }
  // @oagen-ignore-end
}
