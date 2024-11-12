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
} from './interfaces';
import {
  deserializeBatchWriteResourcesResponse,
  deserializeQueryResult,
  deserializeResource,
  deserializeWarrant,
  deserializeWarrantToken,
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

export class FGA {
  constructor(private readonly workos: WorkOS) {}

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

  async createResource(resource: CreateResourceOptions): Promise<Resource> {
    const { data } = await this.workos.post<ResourceResponse>(
      '/fga/v1/resources',
      serializeCreateResourceOptions(resource),
    );

    return deserializeResource(data);
  }

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

  async listResources(
    options?: ListResourcesOptions,
  ): Promise<AutoPaginatable<Resource>> {
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

  async deleteResource(resource: DeleteResourceOptions): Promise<void> {
    const resourceType = isResourceInterface(resource)
      ? resource.getResourceType()
      : resource.resourceType;
    const resourceId = isResourceInterface(resource)
      ? resource.getResourceId()
      : resource.resourceId;

    await this.workos.delete(`/fga/v1/resources/${resourceType}/${resourceId}`);
  }

  async batchWriteResources(
    options: BatchWriteResourcesOptions,
  ): Promise<Resource[]> {
    const { data } = await this.workos.post<BatchWriteResourcesResponse>(
      '/fga/v1/resources/batch',
      serializeBatchWriteResourcesOptions(options),
    );
    return deserializeBatchWriteResourcesResponse(data);
  }

  async writeWarrant(options: WriteWarrantOptions): Promise<WarrantToken> {
    const { data } = await this.workos.post<WarrantTokenResponse>(
      '/fga/v1/warrants',
      serializeWriteWarrantOptions(options),
    );

    return deserializeWarrantToken(data);
  }

  async batchWriteWarrants(
    options: WriteWarrantOptions[],
  ): Promise<WarrantToken> {
    const { data: warrantToken } = await this.workos.post<WarrantTokenResponse>(
      '/fga/v1/warrants',
      options.map(serializeWriteWarrantOptions),
    );

    return deserializeWarrantToken(warrantToken);
  }

  async listWarrants(
    options?: ListWarrantsOptions,
    requestOptions?: ListWarrantsRequestOptions,
  ): Promise<AutoPaginatable<Warrant>> {
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

  async query(
    options: QueryOptions,
    requestOptions: QueryRequestOptions = {},
  ): Promise<AutoPaginatable<QueryResult>> {
    return new AutoPaginatable(
      await fetchAndDeserialize<QueryResultResponse, QueryResult>(
        this.workos,
        '/fga/v1/query',
        deserializeQueryResult,
        serializeQueryOptions(options),
        requestOptions,
      ),
      (params) =>
        fetchAndDeserialize<QueryResultResponse, QueryResult>(
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
