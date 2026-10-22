import {
  DirectoryToken,
  DirectoryTokenResponse,
} from '../interfaces/directory-token.interface';

export const deserializeDirectoryToken = (
  token: DirectoryTokenResponse,
): DirectoryToken => ({
  object: token.object,
  id: token.id,
  directoryId: token.directory_id,
  ...(token.organization_id !== undefined && {
    organizationId: token.organization_id,
  }),
  tokenSuffix: token.token_suffix,
  createdAt: new Date(token.created_at),
});
