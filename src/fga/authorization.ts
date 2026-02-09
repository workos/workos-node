import { WorkOS } from '../workos';
import {
  AuthorizationResource,
  AuthorizationResourceResponse,
} from './interfaces/authorization-resource.interface';
import {
  CreateAuthorizationResourceOptions,
  UpdateAuthorizationResourceOptions,
} from './interfaces/authorization-resource-options.interface';
import {
  deserializeAuthorizationResource,
  serializeCreateAuthorizationResourceOptions,
  serializeUpdateAuthorizationResourceOptions,
} from './serializers/authorization-resource.serializer';

/**
 * FGA Authorization module for managing authorization resources.
 * Provides CRUD operations for resources in the Advanced RBAC system.
 */
export class FGAAuthorization {
  constructor(private readonly workos: WorkOS) {}

  /**
   * Gets an authorization resource by its internal ID.
   *
   * @param resourceId - The internal resource ID (e.g., 'authz_resource_01H...')
   * @returns The authorization resource
   */
  async getResource(resourceId: string): Promise<AuthorizationResource> {
    const { data } = await this.workos.get<AuthorizationResourceResponse>(
      `/authorization/resources/${resourceId}`,
    );
    return deserializeAuthorizationResource(data);
  }

  /**
   * Creates a new authorization resource.
   *
   * @param options - The resource creation options
   * @returns The created authorization resource
   */
  async createResource(
    options: CreateAuthorizationResourceOptions,
  ): Promise<AuthorizationResource> {
    const { data } = await this.workos.post<AuthorizationResourceResponse>(
      '/authorization/resources',
      serializeCreateAuthorizationResourceOptions(options),
    );
    return deserializeAuthorizationResource(data);
  }

  /**
   * Updates an existing authorization resource.
   *
   * @param options - The resource update options (includes resourceId)
   * @returns The updated authorization resource
   */
  async updateResource(
    options: UpdateAuthorizationResourceOptions,
  ): Promise<AuthorizationResource> {
    const { data } = await this.workos.patch<AuthorizationResourceResponse>(
      `/authorization/resources/${options.resourceId}`,
      serializeUpdateAuthorizationResourceOptions(options),
    );
    return deserializeAuthorizationResource(data);
  }

  /**
   * Deletes an authorization resource and all its descendants.
   *
   * @param resourceId - The internal resource ID to delete
   */
  async deleteResource(resourceId: string): Promise<void> {
    await this.workos.delete(`/authorization/resources/${resourceId}`);
  }
}
