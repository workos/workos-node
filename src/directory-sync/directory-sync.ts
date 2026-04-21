import { WorkOS } from '../workos';
import { AutoPaginatable } from '../common/utils/pagination';
import {
  DefaultCustomAttributes,
  Directory,
  DirectoryGroup,
  DirectoryGroupResponse,
  DirectoryResponse,
  DirectoryUserWithGroups,
  DirectoryUserWithGroupsResponse,
  ListDirectoriesOptions,
  ListDirectoryGroupsOptions,
  ListDirectoryUsersOptions,
  SerializedListDirectoriesOptions,
} from './interfaces';
import {
  deserializeDirectory,
  deserializeDirectoryGroup,
  deserializeDirectoryUserWithGroups,
  serializeListDirectoriesOptions,
} from './serializers';
import { fetchAndDeserialize } from '../common/utils/fetch-and-deserialize';

export class DirectorySync {
  constructor(private readonly workos: WorkOS) {}

  /**
   * List Directories
   *
   * Get a list of all of your existing directories matching the criteria specified.
   * @param options - Pagination and filter options.
   * @returns {Promise<AutoPaginatable<Directory, SerializedListDirectoriesOptions>>}
   * @throws 403 response from the API.
   * @throws {UnprocessableEntityException} 422
   */
  async listDirectories(
    options?: ListDirectoriesOptions,
  ): Promise<AutoPaginatable<Directory, SerializedListDirectoriesOptions>> {
    return new AutoPaginatable(
      await fetchAndDeserialize<DirectoryResponse, Directory>(
        this.workos,
        '/directories',
        deserializeDirectory,
        options ? serializeListDirectoriesOptions(options) : undefined,
      ),
      (params) =>
        fetchAndDeserialize<DirectoryResponse, Directory>(
          this.workos,
          '/directories',
          deserializeDirectory,
          params,
        ),
      options ? serializeListDirectoriesOptions(options) : undefined,
    );
  }

  /**
   * Get a Directory
   *
   * Get the details of an existing directory.
   * @param id - Unique identifier for the Directory.
   *
   * @example
   * "directory_01ECAZ4NV9QMV47GW873HDCX74"
   *
   * @returns {Promise<Directory>}
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   */
  async getDirectory(id: string): Promise<Directory> {
    const { data } = await this.workos.get<DirectoryResponse>(
      `/directories/${id}`,
    );

    return deserializeDirectory(data);
  }

  /**
   * Delete a Directory
   *
   * Permanently deletes an existing directory. It cannot be undone.
   * @param id - Unique identifier for the Directory.
   *
   * @example
   * "directory_01ECAZ4NV9QMV47GW873HDCX74"
   *
   * @returns {Promise<void>}
   * @throws 403 response from the API.
   */
  async deleteDirectory(id: string) {
    await this.workos.delete(`/directories/${id}`);
  }

  /**
   * List Directory Groups
   *
   * Get a list of all of existing directory groups matching the criteria specified.
   * @param options - Pagination and filter options.
   * @returns {Promise<AutoPaginatable<DirectoryGroup, ListDirectoryGroupsOptions>>}
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   * @throws {UnprocessableEntityException} 422
   */
  async listGroups(
    options: ListDirectoryGroupsOptions,
  ): Promise<AutoPaginatable<DirectoryGroup, ListDirectoryGroupsOptions>> {
    return new AutoPaginatable(
      await fetchAndDeserialize<DirectoryGroupResponse, DirectoryGroup>(
        this.workos,
        '/directory_groups',
        deserializeDirectoryGroup,
        options,
      ),
      (params) =>
        fetchAndDeserialize<DirectoryGroupResponse, DirectoryGroup>(
          this.workos,
          '/directory_groups',
          deserializeDirectoryGroup,
          params,
        ),
      options,
    );
  }

  /**
   * List Directory Users
   *
   * Get a list of all of existing Directory Users matching the criteria specified.
   * @param options - Pagination and filter options.
   * @returns {Promise<AutoPaginatable<DirectoryUserWithGroups<TCustomAttributes>, ListDirectoryUsersOptions>>}
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   * @throws {UnprocessableEntityException} 422
   * @throws {RateLimitExceededException} 429
   */
  async listUsers<TCustomAttributes extends object = DefaultCustomAttributes>(
    options: ListDirectoryUsersOptions,
  ): Promise<
    AutoPaginatable<
      DirectoryUserWithGroups<TCustomAttributes>,
      ListDirectoryUsersOptions
    >
  > {
    return new AutoPaginatable(
      await fetchAndDeserialize<
        DirectoryUserWithGroupsResponse<TCustomAttributes>,
        DirectoryUserWithGroups<TCustomAttributes>
      >(
        this.workos,
        '/directory_users',
        deserializeDirectoryUserWithGroups,
        options,
      ),
      (params) =>
        fetchAndDeserialize<
          DirectoryUserWithGroupsResponse<TCustomAttributes>,
          DirectoryUserWithGroups<TCustomAttributes>
        >(
          this.workos,
          '/directory_users',
          deserializeDirectoryUserWithGroups,
          params,
        ),
      options,
    );
  }

  /**
   * Get a Directory User
   *
   * Get the details of an existing Directory User.
   * @returns {Promise<DirectoryUserWithGroups<TCustomAttributes>>}
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   */
  async getUser<TCustomAttributes extends object = DefaultCustomAttributes>(
    user: string,
  ): Promise<DirectoryUserWithGroups<TCustomAttributes>> {
    const { data } = await this.workos.get<
      DirectoryUserWithGroupsResponse<TCustomAttributes>
    >(`/directory_users/${user}`);

    return deserializeDirectoryUserWithGroups(data);
  }

  /**
   * Get a Directory Group
   *
   * Get the details of an existing Directory Group.
   * @returns {Promise<DirectoryGroup>}
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   */
  async getGroup(group: string): Promise<DirectoryGroup> {
    const { data } = await this.workos.get<DirectoryGroupResponse>(
      `/directory_groups/${group}`,
    );

    return deserializeDirectoryGroup(data);
  }
}
