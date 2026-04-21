import { AutoPaginatable } from '../common/utils/pagination';
import { WorkOS } from '../workos';
import {
  AddFlagTargetOptions,
  FeatureFlag,
  FeatureFlagResponse,
  ListFeatureFlagsOptions,
  RemoveFlagTargetOptions,
  RuntimeClientOptions,
} from './interfaces';
import { deserializeFeatureFlag } from './serializers';
import { fetchAndDeserialize } from '../common/utils/fetch-and-deserialize';
import { FeatureFlagsRuntimeClient } from './runtime-client';
import { ListOrganizationFeatureFlagsOptions } from '../organizations/interfaces/list-organization-feature-flags-options.interface';
import { ListUserFeatureFlagsOptions } from '../user-management/interfaces/list-user-feature-flags-options.interface';

export class FeatureFlags {
  constructor(private readonly workos: WorkOS) {}

  /**
   * List feature flags
   *
   * Get a list of all of your existing feature flags matching the criteria specified.
   * @param options - Pagination and filter options.
   * @returns {Promise<AutoPaginatable<FeatureFlag, PaginationOptions>>}
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
      `/feature-flags/${slug}`,
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
      `/feature-flags/${slug}/enable`,
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
      `/feature-flags/${slug}/disable`,
      {},
    );

    return deserializeFeatureFlag(data);
  }

  /**
   * Add a feature flag target
   *
   * Enables a feature flag for a specific target in the current environment. Currently, supported targets include users and organizations.
   * @returns {Promise<void>}
   * @throws {BadRequestException} 400
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   */
  async addFlagTarget(options: AddFlagTargetOptions): Promise<void> {
    const { slug, targetId } = options;
    await this.workos.post(`/feature-flags/${slug}/targets/${targetId}`, {});
  }

  /**
   * Remove a feature flag target
   *
   * Removes a target from the feature flag's target list in the current environment. Currently, supported targets include users and organizations.
   * @returns {Promise<void>}
   * @throws {BadRequestException} 400
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   */
  async removeFlagTarget(options: RemoveFlagTargetOptions): Promise<void> {
    const { slug, targetId } = options;
    await this.workos.delete(`/feature-flags/${slug}/targets/${targetId}`);
  }

  /**
   * List enabled feature flags for an organization
   *
   * Get a list of all enabled feature flags for an organization.
   * @param organizationId - Unique identifier of the Organization.
   *
   * @example
   * "org_01EHZNVPK3SFK441A1RGBFSHRT"
   *
   * @param options - Pagination and filter options.
   * @returns {Promise<AutoPaginatable<Flag>>}
   * @throws {NotFoundException} 404
   */
  async listOrganizationFeatureFlags(
    options: ListOrganizationFeatureFlagsOptions,
  ): Promise<AutoPaginatable<FeatureFlag>> {
    const { organizationId, ...paginationOptions } = options;

    return new AutoPaginatable(
      await fetchAndDeserialize<FeatureFlagResponse, FeatureFlag>(
        this.workos,
        `/organizations/${organizationId}/feature-flags`,
        deserializeFeatureFlag,
        paginationOptions,
      ),
      (params) =>
        fetchAndDeserialize<FeatureFlagResponse, FeatureFlag>(
          this.workos,
          `/organizations/${organizationId}/feature-flags`,
          deserializeFeatureFlag,
          params,
        ),
      paginationOptions,
    );
  }

  /**
   * List enabled feature flags for a user
   *
   * Get a list of all enabled feature flags for the provided user. This includes feature flags enabled specifically for the user as well as any organizations that the user is a member of.
   * @param userId - The ID of the user.
   *
   * @example
   * "user_01E4ZCR3C56J083X43JQXF3JK5"
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
        `/user_management/users/${userId}/feature-flags`,
        deserializeFeatureFlag,
        paginationOptions,
      ),
      (params) =>
        fetchAndDeserialize<FeatureFlagResponse, FeatureFlag>(
          this.workos,
          `/user_management/users/${userId}/feature-flags`,
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
