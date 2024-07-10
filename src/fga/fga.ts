import { WorkOS } from '../workos';
import {
  BaseWarrantObject,
  BatchCheckOptions,
  CheckManyOptions,
  CheckOptions,
  CheckRequestOptions,
  CheckResult,
  CreateObjectOptions,
  DeleteObjectOptions,
  ListObjectOptions,
  ListWarrantsOptions,
  QueryOptions,
  QueryRequestOptions,
  QueryResult,
  UpdateObjectOptions,
  Warrant,
  WarrantObject,
  WarrantObjectLiteral,
  WarrantObjectResponse,
  WriteWarrantOptions,
  ListWarrantsRequestsOptions,
  WarrantResponse,
  QueryResultResponse,
  CheckResultResponse,
} from './interfaces';
import {
  WarrantToken,
  WarrantTokenResponse,
} from './interfaces/warrant-token.interface';
import {
  serializeBatchCheckOptions,
  serializeCheckManyOptions,
  serializeCheckOptions,
} from './serializers/check-warrant-options.serializer';
import { serializeCreateObjectOptions } from './serializers/create-object-options.serializer';
import { isWarrantObject } from './utils/interface-check';
import { AutoPaginatable } from '../common/utils/pagination';
import { fetchAndDeserialize } from '../common/utils/fetch-and-deserialize';
import { deserializeBaseWarrantObject } from './serializers/warrant-object.serializer';
import { deserializeWarrantToken } from './serializers/warrant-token.serializer';
import { serializeWriteWarrantOptions } from './serializers/write-warrant-options.serializer';
import { deserializeWarrant } from './serializers/warrant.serializer';
import { deserializeQueryResult } from './serializers/query-result.serializer';
import { serializeListWarrantsOptions } from './serializers/list-warrants-options.serializer';
import { serializeQueryOptions } from './serializers/query-options.serializer';
import { serializeListObjectOptions } from './serializers/list-object-options.serializer';

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

  async checkMany(
    checkOptions: CheckManyOptions,
    options: CheckRequestOptions = {},
  ): Promise<CheckResult> {
    const { data } = await this.workos.post<CheckResultResponse>(
      `/fga/v1/check`,
      serializeCheckManyOptions(checkOptions),
      options,
    );
    return new CheckResult(data);
  }

  async batchCheck(
    checkOptions: BatchCheckOptions,
    options: CheckRequestOptions = {},
  ): Promise<CheckResult[]> {
    const { data } = await this.workos.post<CheckResultResponse[]>(
      `/fga/v1/check`,
      serializeBatchCheckOptions(checkOptions),
      options,
    );
    return data.map(
      (checkResult: CheckResultResponse) => new CheckResult(checkResult),
    );
  }

  async createObject(object: CreateObjectOptions): Promise<BaseWarrantObject> {
    const { data } = await this.workos.post<WarrantObjectResponse>(
      '/fga/v1/objects',
      serializeCreateObjectOptions(object),
    );

    return deserializeBaseWarrantObject(data);
  }

  async getObject(
    object: WarrantObject | WarrantObjectLiteral,
  ): Promise<BaseWarrantObject> {
    const objectType = isWarrantObject(object)
      ? object.getObjectType()
      : object.objectType;
    const objectId = isWarrantObject(object)
      ? object.getObjectId()
      : object.objectId;

    const { data } = await this.workos.get<WarrantObjectResponse>(
      `/fga/v1/objects/${objectType}/${objectId}`,
    );

    return deserializeBaseWarrantObject(data);
  }

  async listObjects(
    options?: ListObjectOptions,
  ): Promise<AutoPaginatable<BaseWarrantObject>> {
    return new AutoPaginatable(
      await fetchAndDeserialize<WarrantObjectResponse, BaseWarrantObject>(
        this.workos,
        '/fga/v1/objects',
        deserializeBaseWarrantObject,
        options ? serializeListObjectOptions(options) : undefined,
      ),
      (params) =>
        fetchAndDeserialize<WarrantObjectResponse, BaseWarrantObject>(
          this.workos,
          '/fga/v1/objects',
          deserializeBaseWarrantObject,
          params,
        ),
      options ? serializeListObjectOptions(options) : undefined,
    );
  }

  async updateObject(options: UpdateObjectOptions): Promise<BaseWarrantObject> {
    const objectType = isWarrantObject(options.object)
      ? options.object.getObjectType()
      : options.object.objectType;
    const objectId = isWarrantObject(options.object)
      ? options.object.getObjectId()
      : options.object.objectId;

    const { data } = await this.workos.put<WarrantObjectResponse>(
      `/fga/v1/objects/${objectType}/${objectId}`,
      {
        meta: options.meta,
      },
    );

    return deserializeBaseWarrantObject(data);
  }

  async deleteObject(object: DeleteObjectOptions): Promise<void> {
    const objectType = isWarrantObject(object)
      ? object.getObjectType()
      : object.objectType;
    const objectId = isWarrantObject(object)
      ? object.getObjectId()
      : object.objectId;

    await this.workos.delete(`/fga/v1/objects/${objectType}/${objectId}`);
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
    requestOptions?: ListWarrantsRequestsOptions,
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
