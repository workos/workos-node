import { WorkOS } from '../workos';
import {
  Resource,
  CheckBatchOptions,
  CheckOptions,
  CheckRequestOptions,
  CheckResult,
  CheckResultResponse,
  CreateResourceOptions,
  DeleteResourceOptions,
  ListResourcesOptions,
  ListWarrantsRequestOptions,
  ListWarrantsOptions,
  QueryOptions,
  QueryRequestOptions,
  QueryResult,
  QueryResultResponse,
  ResourceInterface,
  ResourceOptions,
  ResourceResponse,
  UpdateResourceOptions,
  WriteWarrantOptions,
  Warrant,
  WarrantResponse,
  WarrantToken,
  WarrantTokenResponse,
  BatchWriteResourcesOptions,
  BatchWriteResourcesResponse,
  SerializedListWarrantsOptions,
  SerializedListResourcesOptions,
  SerializedQueryOptions,
} from './interfaces';
import { FGAAuthorization } from './authorization';
import {
  deserializeBatchWriteResourcesResponse,
  deserializeResource,
  deserializeWarrant,
  deserializeWarrantToken,
  deserializeQueryResult,
  serializeBatchWriteResourcesOptions,
  serializeCheckBatchOptions,
  serializeCheckOptions,
  serializeCreateResourceOptions,
  serializeListResourceOptions,
  serializeListWarrantsOptions,
  serializeQueryOptions,
  serializeWriteWarrantOptions,
} from './serializers';
import { isResourceInterface } from './utils/interface-check';
import { AutoPaginatable } from '../common/utils/pagination';
import { fetchAndDeserialize } from '../common/utils/fetch-and-deserialize';
import { FgaPaginatable } from './utils/fga-paginatable';
import { fetchAndDeserializeFGAList } from './utils/fetch-and-deserialize-list';

export class FGA {
  /**
   * Authorization sub-module for Advanced RBAC resource management.
   * Access via `workos.fga.authorization.*`
   */
  readonly authorization: FGAAuthorization;

  constructor(private readonly workos: WorkOS) {
    this.authorization = new FGAAuthorization(workos);
  }

  /**
   * @deprecated Use `workos.fga.authorization` methods instead.
   */
  async check(
    checkOptions: CheckOptions,
    options: CheckRequestOptions = {},
  ): Promise<CheckResult> {
    const { data } = await this.workos.post<CheckResultResponse>(
      `/fga/v1/check`,
      serializeCheckOptions(checkOptions),
      options,
    );
    return new CheckResult(data);
  }

  /**
   * @deprecated Use `workos.fga.authorization` methods instead.
   */
  async checkBatch(
    checkOptions: CheckBatchOptions,
    options: CheckRequestOptions = {},
  ): Promise<CheckResult[]> {
    const { data } = await this.workos.post<CheckResultResponse[]>(
      `/fga/v1/check`,
      serializeCheckBatchOptions(checkOptions),
      options,
    );
    return data.map(
      (checkResult: CheckResultResponse) => new CheckResult(checkResult),
    );
  }

  /**
   * @deprecated Use `workos.fga.authorization` methods instead.
   */
  async createResource(resource: CreateResourceOptions): Promise<Resource> {
    const { data } = await this.workos.post<ResourceResponse>(
      '/fga/v1/resources',
      serializeCreateResourceOptions(resource),
    );

    return deserializeResource(data);
  }

  /**
   * @deprecated Use `workos.fga.authorization` methods instead.
   */
  async getResource(
    resource: ResourceInterface | ResourceOptions,
  ): Promise<Resource> {
    const resourceType = isResourceInterface(resource)
      ? resource.getResourceType()
      : resource.resourceType;
    const resourceId = isResourceInterface(resource)
      ? resource.getResourceId()
      : resource.resourceId;

    const { data } = await this.workos.get<ResourceResponse>(
      `/fga/v1/resources/${resourceType}/${resourceId}`,
    );

    return deserializeResource(data);
  }

  /**
   * @deprecated Use `workos.fga.authorization` methods instead.
   */
  async listResources(
    options?: ListResourcesOptions,
  ): Promise<AutoPaginatable<Resource, SerializedListResourcesOptions>> {
    return new AutoPaginatable(
      await fetchAndDeserialize<ResourceResponse, Resource>(
        this.workos,
        '/fga/v1/resources',
        deserializeResource,
        options ? serializeListResourceOptions(options) : undefined,
      ),
      (params) =>
        fetchAndDeserialize<ResourceResponse, Resource>(
          this.workos,
          '/fga/v1/resources',
          deserializeResource,
          params,
        ),
      options ? serializeListResourceOptions(options) : undefined,
    );
  }

  /**
   * @deprecated Use `workos.fga.authorization` methods instead.
   */
  async updateResource(options: UpdateResourceOptions): Promise<Resource> {
    const resourceType = isResourceInterface(options.resource)
      ? options.resource.getResourceType()
      : options.resource.resourceType;
    const resourceId = isResourceInterface(options.resource)
      ? options.resource.getResourceId()
      : options.resource.resourceId;

    const { data } = await this.workos.put<ResourceResponse>(
      `/fga/v1/resources/${resourceType}/${resourceId}`,
      {
        meta: options.meta,
      },
    );

    return deserializeResource(data);
  }

  /**
   * @deprecated Use `workos.fga.authorization` methods instead.
   */
  async deleteResource(resource: DeleteResourceOptions): Promise<void> {
    const resourceType = isResourceInterface(resource)
      ? resource.getResourceType()
      : resource.resourceType;
    const resourceId = isResourceInterface(resource)
      ? resource.getResourceId()
      : resource.resourceId;

    await this.workos.delete(`/fga/v1/resources/${resourceType}/${resourceId}`);
  }

  /**
   * @deprecated Use `workos.fga.authorization` methods instead.
   */
  async batchWriteResources(
    options: BatchWriteResourcesOptions,
  ): Promise<Resource[]> {
    const { data } = await this.workos.post<BatchWriteResourcesResponse>(
      '/fga/v1/resources/batch',
      serializeBatchWriteResourcesOptions(options),
    );
    return deserializeBatchWriteResourcesResponse(data);
  }

  /**
   * @deprecated Use `workos.fga.authorization` methods instead.
   */
  async writeWarrant(options: WriteWarrantOptions): Promise<WarrantToken> {
    const { data } = await this.workos.post<WarrantTokenResponse>(
      '/fga/v1/warrants',
      serializeWriteWarrantOptions(options),
    );

    return deserializeWarrantToken(data);
  }

  /**
   * @deprecated Use `workos.fga.authorization` methods instead.
   */
  async batchWriteWarrants(
    options: WriteWarrantOptions[],
  ): Promise<WarrantToken> {
    const { data: warrantToken } = await this.workos.post<WarrantTokenResponse>(
      '/fga/v1/warrants',
      options.map(serializeWriteWarrantOptions),
    );

    return deserializeWarrantToken(warrantToken);
  }

  /**
   * @deprecated Use `workos.fga.authorization` methods instead.
   */
  async listWarrants(
    options?: ListWarrantsOptions,
    requestOptions?: ListWarrantsRequestOptions,
  ): Promise<AutoPaginatable<Warrant, SerializedListWarrantsOptions>> {
    return new AutoPaginatable(
      await fetchAndDeserialize<WarrantResponse, Warrant>(
        this.workos,
        '/fga/v1/warrants',
        deserializeWarrant,
        options ? serializeListWarrantsOptions(options) : undefined,
        requestOptions,
      ),
      (params) =>
        fetchAndDeserialize<WarrantResponse, Warrant>(
          this.workos,
          '/fga/v1/warrants',
          deserializeWarrant,
          params,
          requestOptions,
        ),
      options ? serializeListWarrantsOptions(options) : undefined,
    );
  }

  /**
   * @deprecated Use `workos.fga.authorization` methods instead.
   */
  async query(
    options: QueryOptions,
    requestOptions: QueryRequestOptions = {},
  ): Promise<FgaPaginatable<QueryResult, SerializedQueryOptions>> {
    return new FgaPaginatable<QueryResult, SerializedQueryOptions>(
      await fetchAndDeserializeFGAList<QueryResultResponse, QueryResult>(
        this.workos,
        '/fga/v1/query',
        deserializeQueryResult,
        serializeQueryOptions(options),
        requestOptions,
      ),
      (params) =>
        fetchAndDeserializeFGAList<QueryResultResponse, QueryResult>(
          this.workos,
          '/fga/v1/query',
          deserializeQueryResult,
          params,
          requestOptions,
        ),
      serializeQueryOptions(options),
    );
  }
}
