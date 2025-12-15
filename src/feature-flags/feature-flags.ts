import { AutoPaginatable } from '../common/utils/pagination';
import { WorkOS } from '../workos';
import {
  FeatureFlag,
  FeatureFlagResponse,
  ListFeatureFlagsOptions,
} from './interfaces';
import { deserializeFeatureFlag } from './serializers';
import { fetchAndDeserialize } from '../common/utils/fetch-and-deserialize';

export class FeatureFlags {
  constructor(private readonly workos: WorkOS) {}

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

  async getFeatureFlag(slug: string): Promise<FeatureFlag> {
    const { data } = await this.workos.get<FeatureFlagResponse>(
      `/feature-flags/${slug}`,
    );

    return deserializeFeatureFlag(data);
  }

  async enableFeatureFlag(slug: string): Promise<FeatureFlag> {
    const { data } = await this.workos.put<FeatureFlagResponse>(
      `/feature-flags/${slug}/enable`,
      {},
    );

    return deserializeFeatureFlag(data);
  }

  async disableFeatureFlag(slug: string): Promise<FeatureFlag> {
    const { data } = await this.workos.put<FeatureFlagResponse>(
      `/feature-flags/${slug}/disable`,
      {},
    );

    return deserializeFeatureFlag(data);
  }

  async addFlagTarget(slug: string, targetId: string): Promise<void> {
    await this.workos.post(`/feature-flags/${slug}/targets/${targetId}`, {});
  }

  async removeFlagTarget(slug: string, targetId: string): Promise<void> {
    await this.workos.delete(`/feature-flags/${slug}/targets/${targetId}`);
  }
}
